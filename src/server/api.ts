/**
 * API Server for Mastra Agent
 * 
 * Exposes the orchestrator agent through HTTP endpoints.
 * Frontend applications can POST requests to interact with the agent.
 * 
 * Features:
 * - REST API endpoint for agent queries
 * - CORS enabled for frontend access
 * - Streaming support for real-time responses
 * - Error handling
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { orchestratorAgent } from '../agents/orchestrator-agent.js';
import { calendarStore } from '../memory/calendar-store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for frontend access
app.use(express.json()); // Parse JSON bodies
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files

/**
 * Self-Reflection Helper
 * Analyzes the agent's decisions and validates goal fulfillment
 */
async function performReflection({
  message,
  result,
  sendStep,
  res,
  eventDetails
}: {
  message: string;
  result: any;
  sendStep: (action: string, status: string, details?: string) => void;
  res: express.Response;
  eventDetails: { title: string; startTime: string; endTime: string; eventTime: string };
}) {
  try {
    sendStep('🧠 Reflecting on decisions', 'in-progress');
    
    // Extract steps from tool calls
    const steps = (result.toolCalls as any)?.map((tc: any, idx: number) => {
      const toolName = tc.payload?.toolName || tc.toolName || tc.name || 'unknown';
      return `${idx + 1}. ${toolName}`;
    }).join('\n') || 'No steps recorded';
    
    // Get all events from calendar for context
    const allEvents = Array.from(calendarStore.getAllEvents().values());
    const todayEvents = allEvents.filter(e => {
      const eventDate = new Date(e.startTime).toISOString().split('T')[0];
      const targetDate = new Date(eventDetails.startTime).toISOString().split('T')[0];
      return eventDate === targetDate;
    });
    
    const reflectionPrompt = `You are reviewing your own decision-making process.

User Request: "${message}"

Steps Executed:
${steps}

Final Action: Created event "${eventDetails.title}" at ${eventDetails.eventTime}
Date: ${new Date(eventDetails.startTime).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}

Context: User has ${todayEvents.length} event(s) today
${todayEvents.length > 0 ? 'Other meetings: ' + todayEvents.map(e => {
  const time = new Date(e.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${e.title} at ${time}`;
}).join(', ') : ''}

Provide a structured self-reflection with EXACTLY this format:

✅ Goal Status: [Completed/Partially Completed/Failed]
🧠 Reasoning: [One sentence explaining why this time was chosen]
⚠️ Potential Issue: [One concern or risk, or "None" if no issues]
🔁 Suggestion: [One proactive next step, or "None needed"]

Be concise. Each line should be ONE sentence maximum.`;

    // Call Gemini for reflection
    const { generateText } = await import('ai');
    const { geminiPro } = await import('../llm/gemini.js');
    const reflectionResult = await generateText({
      model: geminiPro,
      prompt: reflectionPrompt,
    });
    
    sendStep('🧠 Reflection complete', 'completed');
    
    // Send reflection as separate SSE event
    res.write(`data: ${JSON.stringify({
      type: 'reflection',
      content: reflectionResult.text,
    })}\n\n`);
    
  } catch (error) {
    console.error('[API] Reflection failed:', error);
    sendStep('⚠️ Reflection skipped', 'completed');
  }
}

/**
 * POST /api/agent/query-stream
 * 
 * Streaming endpoint for agent interactions with real-time step updates
 * 
 * Body:
 * {
 *   "message": "Schedule a meeting tomorrow at 2pm",
 *   "threadId": "optional-conversation-id",
 *   "googleAccessToken": "user-google-token"
 * }
 */
app.post('/api/agent/query-stream', async (req, res) => {
  const { message, threadId, googleAccessToken } = req.body;

  if (!message) {
    return res.status(400).json({
      error: 'Message is required',
      success: false,
    });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendStep = (action: string, status: string = 'completed', details?: string) => {
    const step = {
      id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      action,
      status,
      timestamp: Date.now(),
      details,
    };
    res.write(`data: ${JSON.stringify({ type: 'step', step })}\n\n`);
  };

  try {
    console.log(`[API] Processing streaming query: "${message}"`);

    // Track which steps have been sent to avoid duplicates
    const sentSteps = new Set<string>();

    // Always sync Google Calendar events
    if (googleAccessToken) {
      try {
        const { fetchGoogleCalendarEvents } = await import('../utils/googleCalendar.js');
        const googleEvents = await fetchGoogleCalendarEvents(googleAccessToken);
        
        const { calendarStore } = await import('../memory/calendar-store.js');
        calendarStore.clear();
        googleEvents.forEach(event => {
          calendarStore.addEvent({
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
          });
        });
        
        if (!sentSteps.has('sync')) {
          sentSteps.add('sync');
          sendStep('📅 Synced events from Google Calendar', 'completed');
        }
        console.log(`[API] Synced ${googleEvents.length} events`);
      } catch (error) {
        console.error('[API] Failed to sync from Google Calendar:', error);
        sendStep('❌ Failed to sync Google Calendar', 'error');
      }
    }

    // Send step updates as tools are called
    const result = await orchestratorAgent.generate(message, {
      ...(threadId && { threadId }),
      onStepFinish: async (step: any) => {
        // Send step update for each tool call
        if (step.toolCalls) {
          for (const tc of step.toolCalls) {
            const toolName = tc.toolName || tc.name || '';
            
            // Avoid duplicate steps
            if (sentSteps.has(toolName)) continue;
            sentSteps.add(toolName);
            
            if (toolName === 'analyzeSchedulingRequest') {
              sendStep('📋 Analyzing your scheduling request', 'completed');
            } else if (toolName === 'getEventsForDate') {
              sendStep('📅 Checking all events for that day', 'completed');
            } else if (toolName === 'findBestTimeSlot') {
              sendStep('🔍 Finding best available time slot', 'completed');
            } else if (toolName === 'createCalendarEvent' || toolName === 'create-calendar-event') {
              sendStep('✅ Creating calendar event', 'completed');
            } else if (toolName === 'listCalendarEvents' || toolName === 'list-calendar-events') {
              sendStep('📋 Listing calendar events', 'completed');
            } else if (toolName === 'deleteCalendarEvent' || toolName === 'delete-calendar-event') {
              sendStep('🗑️ Deleting event', 'completed');
            }
          }
        }
      },
    });

    // Handle Google Calendar event creation
    if (googleAccessToken && result.toolCalls && result.toolCalls.length > 0) {
      try {
        const createEventCall = (result.toolCalls as any).find((call: any) => {
          const toolName = call.payload?.toolName || call.toolName || call.name || '';
          return toolName === 'create-calendar-event' || toolName === 'createCalendarEvent';
        });
        
        if (createEventCall) {
          const args = createEventCall.payload?.args || createEventCall.args || createEventCall.input || {};
          const { title, startTime, endTime } = args as { title: string; startTime: string; endTime: string };
          
          const { createGoogleCalendarEvent } = await import('../utils/googleCalendar.js');
          await createGoogleCalendarEvent(googleAccessToken, {
            title,
            startTime,
            endTime,
          });
          
          const eventTime = new Date(startTime).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
          
          // Update the last step with more details
          if (!sentSteps.has('google-calendar-success')) {
            sentSteps.add('google-calendar-success');
            sendStep('✅ Event created successfully', 'completed', `Scheduled at ${eventTime}`);
          }
          
          // Trigger self-reflection after successful workflow
          if (!sentSteps.has('reflection')) {
            sentSteps.add('reflection');
            await performReflection({
              message,
              result,
              sendStep,
              res,
              eventDetails: { title, startTime, endTime, eventTime }
            });
          }
        }
      } catch (error) {
        console.error('[API] Failed to create Google Calendar event:', error);
        sendStep('❌ Failed to create in Google Calendar', 'error');
      }
    }

    // Get events if list tool was called
    let events = null;
    const toolCalls = (result.toolCalls as any) || [];
    if (toolCalls.some((tc: any) => {
      const toolName = tc.payload?.toolName || tc.toolName || tc.name || '';
      return toolName === 'listCalendarEvents' || toolName === 'list-calendar-events';
    })) {
      events = Array.from(calendarStore.getAllEvents().values());
    }

    // Send final response
    const completePayload = {
      type: 'complete',
      response: result.text,
      events,
      toolCalls: toolCalls.map((tc: any) => ({
        tool: tc.payload?.toolName || tc.toolName || tc.name || 'unknown',
      })),
    };
    console.log('[API] Sending complete event with response length:', result.text?.length || 0);
    res.write(`data: ${JSON.stringify(completePayload)}\n\n`);
    console.log('[API] Complete event sent, ending stream');
    res.end();
  } catch (error) {
    console.error('[API] Error in streaming endpoint:', error);
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: 'Failed to process request',
    })}\n\n`);
    res.end();
  }
});

/**
 * POST /api/agent/query
 * 
 * Main endpoint for agent interactions (non-streaming)
 */
app.post('/api/agent/query', async (req, res) => {
  try {
    const { message, threadId, googleAccessToken } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
        success: false,
      });
    }

    console.log(`[API] Processing query: "${message}"`);

    // Track agent steps for frontend display
    const agentSteps: Array<{id: string; action: string; status: string; timestamp: number; details?: string}> = [];
    
    const addStep = (action: string, status: string = 'completed', details?: string) => {
      agentSteps.push({
        id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        action,
        status,
        timestamp: Date.now(),
        details,
      });
    };

    // Always sync Google Calendar events
    if (googleAccessToken) {
      try {
        addStep('📅 Syncing events from Google Calendar', 'completed');
        const { fetchGoogleCalendarEvents } = await import('../utils/googleCalendar.js');
        const googleEvents = await fetchGoogleCalendarEvents(googleAccessToken);
        
        const { calendarStore } = await import('../memory/calendar-store.js');
        calendarStore.clear();
        googleEvents.forEach(event => {
          calendarStore.addEvent({
            id: event.id,
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
            description: event.description,
          });
        });
        console.log(`[API] Synced ${googleEvents.length} events from Google Calendar`);
      } catch (error) {
        console.error('[API] Error syncing Google Calendar:', error);
        addStep('Failed to sync Google Calendar events', 'error');
      }
    }

    // Generate response using orchestrator agent
    const result = await orchestratorAgent.generate(message, {
      ...(threadId && { threadId }), // Include threadId if provided for conversation continuity
    });

    // If calendar tool was used and we have a Google access token, create in Google Calendar too
    if (googleAccessToken && result.toolCalls && result.toolCalls.length > 0) {
      
      // Add step for each tool call
      (result.toolCalls as any).forEach((tc: any) => {
        const toolName = tc.payload?.toolName || tc.toolName || tc.name || '';
        
        if (toolName === 'analyzeSchedulingRequest') {
          addStep('📋 Analyzing your scheduling request', 'completed');
        } else if (toolName === 'getEventsForDate') {
          addStep('📅 Checking all events for that day', 'completed');
        } else if (toolName === 'findBestTimeSlot') {
          addStep('🔍 Finding best available time slot', 'completed');
        } else if (toolName === 'listCalendarEvents' || toolName === 'list-calendar-events') {
          addStep('📋 Listing calendar events', 'completed');
        } else if (toolName === 'createCalendarEvent' || toolName === 'create-calendar-event') {
          addStep('✅ Creating calendar event', 'completed');
        } else if (toolName === 'deleteCalendarEvent' || toolName === 'delete-calendar-event') {
          addStep('🗑️ Deleting event', 'completed');
        }
      });
      
      // console.log('[API] Raw tool calls:', JSON.stringify(result.toolCalls, null, 2));
      try {
        // Find the create calendar event tool call
        const createEventCall = (result.toolCalls as any).find((call: any) => {
          const toolName = call.payload?.toolName || call.toolName || call.name || '';
          return toolName === 'create-calendar-event' || toolName === 'createCalendarEvent';
        });
        
        if (createEventCall) {
          const args = createEventCall.payload?.args || createEventCall.args || createEventCall.input || {};
          const { title, startTime, endTime } = args as { title: string; startTime: string; endTime: string };
          
          addStep('Finding best available time', 'completed');
          addStep('Creating event in Google Calendar', 'in-progress');
          
          const { createGoogleCalendarEvent } = await import('../utils/googleCalendar.js');
          const googleEventId = await createGoogleCalendarEvent(googleAccessToken, {
            title,
            startTime,
            endTime,
          });
          
          // Format time for display
          const eventTime = new Date(startTime).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          });
          
          addStep('Event created successfully', 'completed', `Scheduled at ${eventTime}`);
        }
      } catch (error) {
        console.error('[API] Failed to create Google Calendar event:', error);
        // Don't fail the whole request, just log the error
      }
    }

    // Return structured response
    const toolCalls = (result.toolCalls as any) || [];
    const toolResults = (result.toolResults as any) || [];
    
    // If the agent used listCalendarEvents, include the events in the response
    let events = null;
    if (toolCalls.some((tc: any) => {
      const toolName = tc.payload?.toolName || tc.toolName || tc.name || '';
      return toolName === 'listCalendarEvents' || toolName === 'list-calendar-events';
    })) {
      events = Array.from(calendarStore.getAllEvents().values());
    }
    
    res.json({
      success: true,
      response: result.text,
      events: events,
      steps: agentSteps,
      toolCalls: toolCalls.map((call: any) => ({
        tool: call.payload?.toolName || call.toolName || call.name || 'unknown',
        args: call.payload?.args || call.args || call.input || {},
      })),
      toolResults: toolResults.map((tr: any) => ({
        tool: tr.payload?.toolName || tr.toolName || tr.name || 'unknown',
        result: tr.payload?.result || tr.result || {},
      })),
    });

  } catch (error) {
    console.error('[API] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/agent/stream
 * 
 * Streaming endpoint for real-time agent responses
 * Uses Server-Sent Events (SSE)
 */
app.post('/api/agent/stream', async (req, res) => {
  try {
    const { message, threadId } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
        success: false,
      });
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    console.log(`[API] Streaming query: "${message}"`);

    // Stream the response
    const stream = await orchestratorAgent.stream(message, {
      ...(threadId && { threadId }),
    });

    // Send chunks as they arrive
    for await (const chunk of stream.textStream) {
      res.write(`data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`);
    }

    // Send final event
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();

  } catch (error) {
    console.error('[API] Streaming error:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })}\n\n`);
    res.end();
  }
});

/**
 * GET /api/calendar/events
 * 
 * Get all calendar events
 */
app.get('/api/calendar/events', async (req, res) => {
  try {
    const events = calendarStore.getAllEvents();

    res.json({
      success: true,
      count: events.length,
      events,
    });
  } catch (error) {
    console.error('[API] Error fetching events:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/auth/google/callback
 * 
 * Exchange Google OAuth authorization code for access token
 */
app.post('/api/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        error: 'Authorization code is required',
        success: false,
      });
    }

    const clientId = process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5173/auth/callback';

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        error: 'Google OAuth credentials not configured',
        success: false,
      });
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('[OAuth] Token exchange failed:', error);
      return res.status(500).json({
        error: 'Failed to exchange authorization code',
        success: false,
      });
    }

    const tokens = await tokenResponse.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    res.json({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      success: true,
    });

  } catch (error) {
    console.error('[OAuth] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /health
 * 
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Agent API server running on http://localhost:${PORT}`);
  console.log(`📝 POST to http://localhost:${PORT}/api/agent/query to interact with agent`);
  console.log(`📡 POST to http://localhost:${PORT}/api/agent/stream for streaming responses`);
});

export default app;
