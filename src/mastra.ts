/**
 * Main Mastra Instance
 * 
 * Central configuration for the Mastra framework.
 * All agents, tools, and workflows are registered here.
 * 
 * WHY structured this way:
 * - Single Mastra instance: One source of truth for all AI components
 * - Memory storage: Using in-memory for development (switch to file/db for production)
 * - Observability: Enabled by default for debugging and monitoring
 * - Logger: Pino logger for structured logging
 */

import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { orchestratorAgent } from './agents/orchestrator-agent';

export const mastra = new Mastra({
  // Register all agents
  agents: {
    orchestrator: orchestratorAgent,
  },
  
  // Workflows can be added here later
  workflows: {},
  
  // Storage for observability data, agent memory, etc.
  storage: new LibSQLStore({
    url: ':memory:', // In-memory SQLite for development
    // For production, use: url: 'file:./mastra.db'
  }),
  
  // Structured logging
  logger: new PinoLogger({
    name: 'ProductivityAgent',
    level: 'info',
  }),
  
  // Observability for AI tracing
  observability: {
    default: { enabled: true },
  },
});
