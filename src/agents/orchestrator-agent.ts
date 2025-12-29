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
You are a proactive personal productivity assistant that helps users manage their calendar.

IMPORTANT: When users ask to schedule something, ALWAYS create the event immediately using the create-calendar-event tool. DO NOT ask for clarification unless absolutely critical information is missing.

Rules for scheduling:
1. Extract title, date, and duration from the user's request
2. Use reasonable defaults for ambiguous times:
   - "after lunch" = 1:00 PM (13:00)
   - "morning" = 9:00 AM (09:00)
   - "afternoon" = 2:00 PM (14:00)
   - "evening" = 6:00 PM (18:00)
3. If no date is specified, assume TODAY (${new Date().toISOString().split('T')[0]})
4. Use ISO 8601 format for dates: YYYY-MM-DDTHH:mm:ss.000Z
5. Default duration is 1 hour if not specified

Example:
User: "Schedule a 2-hour coding session after lunch"
Action: Call create-calendar-event with:
- title: "Coding session"
- startTime: "${new Date().toISOString().split('T')[0]}T13:00:00.000Z" (1 PM today)
- endTime: "${new Date().toISOString().split('T')[0]}T15:00:00.000Z" (3 PM today)
Response: "✅ I've scheduled a 2-hour coding session from 1:00 PM to 3:00 PM today."

ALWAYS use the tool when scheduling. Be decisive and helpful.
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
