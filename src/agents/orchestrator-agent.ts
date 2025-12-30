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

Current date and time: ${new Date().toISOString()}
Today is: ${new Date().toISOString().split('T')[0]}

Rules for scheduling:
1. Extract title, date, and duration from the user's request
2. Pay CAREFUL attention to date keywords:
   - "today" = ${new Date().toISOString().split('T')[0]}
   - "tomorrow" = ${new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]}
   - "next week" = add 7 days to today
   - If no date keyword, assume TODAY
3. Use reasonable defaults for ambiguous times:
   - "after lunch" = 1:00 PM (13:00)
   - "morning" = 9:00 AM (09:00)
   - "afternoon" = 2:00 PM (14:00)
   - "evening" = 6:00 PM (18:00)
4. Convert times to UTC ISO 8601 format: YYYY-MM-DDTHH:mm:ss.000Z
   - Assume times are in Asia/Kolkata timezone (UTC+5:30)
   - To convert to UTC: subtract 5 hours 30 minutes
   - Example: 4:00 PM IST = 16:00 IST = 10:30 UTC = "YYYY-MM-DDT10:30:00.000Z"
5. Default duration is 1 hour if not specified

Examples:
User: "Schedule a meeting tomorrow at 4pm"
- Tomorrow = ${new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]}
- 4pm IST = 16:00 IST = 10:30 UTC
- startTime: "${new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]}T10:30:00.000Z"
- endTime: "${new Date(Date.now() + 24*60*60*1000).toISOString().split('T')[0]}T11:30:00.000Z"

User: "Schedule a 2-hour coding session today after lunch"
- Today = ${new Date().toISOString().split('T')[0]}
- 1pm IST = 13:00 IST = 07:30 UTC
- startTime: "${new Date().toISOString().split('T')[0]}T07:30:00.000Z"
- endTime: "${new Date().toISOString().split('T')[0]}T09:30:00.000Z"

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
