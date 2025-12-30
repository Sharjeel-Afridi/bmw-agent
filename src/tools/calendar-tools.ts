/**
 * Calendar Tool - Mock Implementation
 * 
 * Creates calendar events and stores them in memory.
 * 
 * WHY structured this way:
 * - Zod schema: Type-safe inputs with automatic validation
 * - Execute function: Clean separation of tool logic from Mastra wiring
 * - In-memory store: Proves tool execution without external dependencies
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { calendarStore } from '../memory/calendar-store';

export const createCalendarEventTool = createTool({
  id: 'create-calendar-event',
  description: 'Creates a new calendar event with specified title and time range',
  
  // Input validation schema
  inputSchema: z.object({
    title: z.string().describe('Event title or description'),
    startTime: z.string().describe('Start time in ISO 8601 format (e.g., "2024-01-15T14:00:00Z")'),
    endTime: z.string().describe('End time in ISO 8601 format (e.g., "2024-01-15T16:00:00Z")'),
  }),
  
  // Output schema
  outputSchema: z.object({
    success: z.boolean(),
    eventId: z.string(),
    message: z.string(),
    event: z.object({
      title: z.string(),
      startTime: z.string(),
      endTime: z.string(),
    }),
  }),
  
  // Execution logic
  execute: async ({ context }) => {
    const { title, startTime, endTime } = context;
    
    // Validate time format (basic check)
    try {
      const start = new Date(startTime);
      const end = new Date(endTime);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return {
          success: false,
          eventId: '',
          message: 'Invalid date format. Use ISO 8601 format.',
          event: { title, startTime, endTime },
        };
      }
      
      if (end <= start) {
        return {
          success: false,
          eventId: '',
          message: 'End time must be after start time.',
          event: { title, startTime, endTime },
        };
      }
    } catch (error) {
      return {
        success: false,
        eventId: '',
        message: 'Failed to parse dates.',
        event: { title, startTime, endTime },
      };
    }
    
    // Create the event
    const event = calendarStore.addEvent({
      title,
      startTime,
      endTime,
    });
    
    console.log(`[CALENDAR TOOL] Created event: ${event.id} - "${event.title}"`);
    
    return {
      success: true,
      eventId: event.id,
      message: `Successfully created calendar event "${title}"`,
      event: {
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
      },
    };
  },
});

/**
 * Helper tool to list all calendar events
 * Useful for debugging and verification
 */
export const listCalendarEventsTool = createTool({
  id: 'list-calendar-events',
  description: 'Lists all calendar events in the system',
  
  inputSchema: z.object({}),
  
  outputSchema: z.object({
    count: z.number(),
    events: z.array(z.object({
      id: z.string(),
      title: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      createdAt: z.string(),
    })),
  }),
  
  execute: async () => {
    const events = calendarStore.getAllEvents();
    
    console.log(`[CALENDAR TOOL] Listing events: ${events.length} events found`);
    events.forEach(event => {
      console.log(`[CALENDAR TOOL]   - ${event.title} | ${event.startTime} to ${event.endTime}`);
    });
    
    return {
      count: events.length,
      events,
    };
  },
});

/**
 * Delete calendar event tool
 * Removes an event from the calendar
 */
export const deleteCalendarEventTool = createTool({
  id: 'delete-calendar-event',
  description: 'Deletes a calendar event by its ID',
  
  inputSchema: z.object({
    eventId: z.string().describe('The ID of the event to delete'),
  }),
  
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  
  execute: async ({ context }) => {
    const { eventId } = context;
    
    const event = calendarStore.getEventById(eventId);
    
    if (!event) {
      return {
        success: false,
        message: `Event with ID "${eventId}" not found`,
      };
    }
    
    calendarStore.deleteEvent(eventId);
    
    console.log(`[CALENDAR TOOL] Deleted event: ${eventId} - "${event.title}"`);
    
    return {
      success: true,
      message: `Successfully deleted calendar event "${event.title}"`,
    };
  },
});
