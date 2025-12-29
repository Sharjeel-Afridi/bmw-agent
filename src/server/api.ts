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
import { mastra } from '../mastra';

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
    const { message, threadId } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
        success: false,
      });
    }

    console.log(`[API] Processing query: "${message}"`);

    // Get orchestrator agent
    const orchestrator = mastra.agents.orchestrator;

    // Generate response
    const result = await orchestrator.generate(message, {
      ...(threadId && { threadId }), // Include threadId if provided for conversation continuity
    });

    // Return structured response
    res.json({
      success: true,
      response: result.text,
      toolCalls: result.toolCalls?.map(call => ({
        tool: call.toolName,
        args: call.args,
      })) || [],
      toolResults: result.toolResults?.map(tr => ({
        tool: tr.toolName,
        result: tr.result,
      })) || [],
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

    const orchestrator = mastra.agents.orchestrator;

    // Stream the response
    const stream = await orchestrator.stream(message, {
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
    const { calendarStore } = await import('../memory/calendar-store');
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
