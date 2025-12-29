/**
 * MCP Server for Mastra Agent
 * 
 * Exposes the orchestrator agent as a Model Context Protocol server.
 * Can be used with Claude Desktop, Cline, and other MCP clients.
 */

import 'dotenv/config';
import { MCPServer } from '@mastra/mcp';
import { createCalendarEventTool, listCalendarEventsTool } from '../tools/calendar-tools.js';
import { orchestratorAgent } from '../agents/orchestrator-agent.js';

// Create MCP server with tools and agent
const server = new MCPServer({
  name: 'productivity-agent',
  version: '1.0.0',
  tools: {
    createCalendarEvent: createCalendarEventTool,
    listCalendarEvents: listCalendarEventsTool,
  },
  agents: {
    orchestrator: orchestratorAgent,
  },
});

// Start the server (stdio mode for Claude Desktop)
console.log('🚀 Starting MCP Server: productivity-agent');
console.log('📋 Exposing agent and tools');

server.startStdio().catch((error) => {
  console.error('Error starting MCP server:', error);
  process.exit(1);
});
