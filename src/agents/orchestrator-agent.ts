/**
 * Orchestrator Agent
 * 
 * Primary agent that:
 * 1. Receives natural language tasks from users
 * 2. Decides which tools to use (if any)
 * 3. Returns structured responses
 * 
 * WHY structured this way:
 * - Instructions: Clear system prompt guides model behavior
 * - Tools: Agent has access to calendar tools for task execution
 * - Model: Uses Gemini Flash for speed and cost efficiency
 * - No memory: Stateless for simplicity (can add later)
 */

import { Agent } from '@mastra/core/agent';
import { createCalendarEventTool, listCalendarEventsTool } from '../tools/calendar-tools';
import { geminiFlash } from '../llm/gemini';

export const orchestratorAgent = new Agent({
  name: 'Orchestrator Agent',
  description: 'A personal productivity assistant that helps users manage their calendar and schedule tasks using natural language.',
  
  instructions: `
You are a personal productivity assistant that helps users manage their calendar and tasks.

Your responsibilities:
- Understand natural language requests about scheduling
- Create calendar events using the create-calendar-event tool when appropriate
- Provide clear, concise responses about what actions were taken
- Ask for clarification if critical information is missing (date, time, etc.)

Guidelines:
- When a user asks to schedule something, extract the title, start time, and end time
- Use ISO 8601 format for times (e.g., "2024-01-15T14:00:00Z")
- If the user provides relative times like "after lunch" or "tomorrow at 2pm", use reasonable defaults:
  - "after lunch" = 13:00 (1 PM) local time
  - "morning" = 09:00 (9 AM)
  - "afternoon" = 14:00 (2 PM)
- Always confirm what was created with the user
- Be helpful and proactive, but don't make assumptions about important details

Example interaction:
User: "Schedule a 2-hour coding session after lunch"
You: [Call create-calendar-event tool with appropriate parameters]
Response: "I've scheduled a 2-hour coding session from 1:00 PM to 3:00 PM."
  `.trim(),
  
  model: geminiFlash,
  
  // Tools available to this agent
  tools: {
    createCalendarEvent: createCalendarEventTool,
    listCalendarEvents: listCalendarEventsTool,
  },
  
  // Configuration
  enableCache: false, // Disable caching for development
});
