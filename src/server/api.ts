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
 * POST /api/agent/query
 * 
 * Main endpoint for agent interactions
 * 
 * Body:
 * {
 *   "message": "Schedule a meeting tomorrow at 2pm",
 *   "threadId": "optional-conversation-id"
 * }
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

    // If user has Google access token and is asking to list events, fetch from Google Calendar
    if (googleAccessToken && message.toLowerCase().includes('list') || message.toLowerCase().includes('show') || message.toLowerCase().includes('events') || message.toLowerCase().includes('meetings')) {
      try {
        console.log('[API] Attempting to sync events from Google Calendar...');
        const { fetchGoogleCalendarEvents } = await import('../utils/googleCalendar.js');
        const googleEvents = await fetchGoogleCalendarEvents(googleAccessToken);
        
        // Sync events to local store
        const { calendarStore } = await import('../memory/calendar-store.js');
        calendarStore.clear();
        googleEvents.forEach(event => {
          calendarStore.addEvent({
            title: event.title,
            startTime: event.startTime,
            endTime: event.endTime,
          });
        });
        
        console.log(`[API] Synced ${googleEvents.length} events from Google Calendar to local store`);
      } catch (error) {
        console.error('[API] Failed to sync from Google Calendar:', error);
        // Continue with local store if sync fails
      }
    }

    // Generate response using orchestrator agent
    const result = await orchestratorAgent.generate(message, {
      ...(threadId && { threadId }), // Include threadId if provided for conversation continuity
    });

    // If calendar tool was used and we have a Google access token, create in Google Calendar too
    console.log('[API] Checking if should create Google Calendar event...', {
      hasAccessToken: !!googleAccessToken,
      hasToolCalls: !!(result.toolCalls && result.toolCalls.length > 0),
    });
    
    if (googleAccessToken && result.toolCalls && result.toolCalls.length > 0) {
      console.log('[API] Checking for calendar tool calls...');
      // console.log('[API] Raw tool calls:', JSON.stringify(result.toolCalls, null, 2));
      try {
        // Find the create calendar event tool call
        const createEventCall = (result.toolCalls as any).find((call: any) => {
          const toolName = call.payload?.toolName || call.toolName || call.name || '';
          console.log('[API] Checking tool:', toolName);
          return toolName === 'create-calendar-event' || toolName === 'createCalendarEvent';
        });
        
        console.log('[API] Found create event call:', !!createEventCall);
        
        if (createEventCall) {
          const args = createEventCall.payload?.args || createEventCall.args || createEventCall.input || {};
          const { title, startTime, endTime } = args as { title: string; startTime: string; endTime: string };
          console.log('[API] Creating event in Google Calendar:', { title, startTime, endTime });
          
          const { createGoogleCalendarEvent } = await import('../utils/googleCalendar.js');
          const googleEventId = await createGoogleCalendarEvent(googleAccessToken, {
            title,
            startTime,
            endTime,
          });
          
          console.log(`[API] Created Google Calendar event: ${googleEventId}`);
        }
      } catch (error) {
        console.error('[API] Failed to create Google Calendar event:', error);
        // Don't fail the whole request, just log the error
      }
    }

    // Return structured response
    const toolCalls = (result.toolCalls as any) || [];
    const toolResults = (result.toolResults as any) || [];
    
    console.log('[API] Serializing response...');
    console.log('[API] Tool calls to serialize:', toolCalls.length);
    console.log('[API] Tool results to serialize:', toolResults.length);
    
    // If the agent used listCalendarEvents, include the events in the response
    let events = null;
    if (toolCalls.some((tc: any) => {
      const toolName = tc.payload?.toolName || tc.toolName || tc.name || '';
      return toolName === 'listCalendarEvents' || toolName === 'list-calendar-events';
    })) {
      events = Array.from(calendarStore.getAllEvents().values());
      console.log('[API] Including events in response:', events.length);
    }
    
    res.json({
      success: true,
      response: result.text,
      events: events,
      toolCalls: toolCalls.map((call: any) => {
        const toolData = {
          tool: call.payload?.toolName || call.toolName || call.name || 'unknown',
          args: call.payload?.args || call.args || call.input || {},
        };
        console.log('[API] Serialized tool call:', JSON.stringify(toolData));
        return toolData;
      }),
      toolResults: toolResults.map((tr: any) => {
        const resultData = {
          tool: tr.payload?.toolName || tr.toolName || tr.name || 'unknown',
          result: tr.payload?.result || tr.result || {},
        };
        console.log('[API] Serialized tool result:', JSON.stringify(resultData));
        return resultData;
      }),
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
