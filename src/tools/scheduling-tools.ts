/**
 * Scheduling Analysis Tools
 * 
 * These tools break down the scheduling process into discrete steps:
 * 1. Analyze the scheduling request
 * 2. Get events for a specific date
 * 3. Find the best available time slot
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { calendarStore } from '../memory/calendar-store';

/**
 * Tool: Analyze Scheduling Request
 * Extracts key information from a natural language scheduling request
 */
export const analyzeSchedulingRequestTool = createTool({
  id: 'analyzeSchedulingRequest',
  description: 'Analyzes a natural language scheduling request and extracts structured information like title, date, preferred time, and duration',
  inputSchema: z.object({
    request: z.string().describe('The natural language scheduling request from the user'),
  }),
  execute: async ({ context }) => {
    const { request } = context;
    
    console.log('[TOOL] Analyzing scheduling request:', request);
    
    // Extract date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let targetDate = today;
    if (request.toLowerCase().includes('tomorrow')) {
      targetDate = tomorrow;
    } else if (request.toLowerCase().includes('next week')) {
      targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + 7);
    }
    
    // Extract title (everything before time/date keywords)
    let title = request;
    const dateKeywords = ['today', 'tomorrow', 'next week'];
    for (const keyword of dateKeywords) {
      const idx = title.toLowerCase().indexOf(keyword);
      if (idx > 0) {
        title = title.substring(0, idx).trim();
      }
    }
    
    // Clean up title - remove common scheduling prefixes
    title = title
      .replace(/^(schedule\s+a?\s*|create\s+a?\s*|add\s+a?\s*|set\s+up\s+a?\s*|book\s+a?\s*|plan\s+a?\s*|i\s+need\s+to\s+|i\s+have\s+to\s+|need\s+to\s+|have\s+to\s+|take\s+a?\s*)/i, '')
      .trim();
    
    // Extract preferred time if specified
    const timeMatch = request.match(/at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    let preferredTime = null;
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const meridiem = timeMatch[3]?.toLowerCase();
      
      if (meridiem === 'pm' && hour !== 12) hour += 12;
      if (meridiem === 'am' && hour === 12) hour = 0;
      
      preferredTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    }
    
    // Extract duration
    const durationMatch = request.match(/(\d+)\s*(hour|hr|minute|min)/i);
    let duration = 60; // default 1 hour
    if (durationMatch) {
      const value = parseInt(durationMatch[1]);
      const unit = durationMatch[2].toLowerCase();
      duration = unit.startsWith('hour') || unit === 'hr' ? value * 60 : value;
    }
    
    const result = {
      title,
      date: targetDate.toISOString().split('T')[0],
      preferredTime,
      duration,
      hasSpecificTime: !!preferredTime,
      reasoning: preferredTime 
        ? `User specified a specific time: ${preferredTime}`
        : 'No specific time mentioned - will need to find best available slot'
    };
    
    console.log('[TOOL] Analysis result:', result);
    return result;
  },
});

/**
 * Tool: Get Events for Date
 * Retrieves all events scheduled for a specific date
 */
export const getEventsForDateTool = createTool({
  id: 'getEventsForDate',
  description: 'Gets all calendar events scheduled for a specific date',
  inputSchema: z.object({
    date: z.string().describe('Date in YYYY-MM-DD format'),
  }),
  execute: async ({ context }) => {
    const { date } = context;
    
    console.log('[TOOL] Getting events for date:', date);
    
    const allEvents = Array.from(calendarStore.getAllEvents().values());
    console.log('[TOOL] Total events in store:', allEvents.length);
    
    // Filter events for the specified date
    const eventsForDate = allEvents.filter(event => {
      const eventDate = new Date(event.startTime).toISOString().split('T')[0];
      console.log(`[TOOL] Comparing event date ${eventDate} with target ${date}`);
      return eventDate === date;
    });
    
    console.log('[TOOL] Filtered events for date:', eventsForDate.length);
    
    // Sort by start time
    eventsForDate.sort((a, b) => 
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
    
    const result = {
      date,
      count: eventsForDate.length,
      events: eventsForDate.map(e => ({
        id: e.id,
        title: e.title,
        startTime: e.startTime,
        endTime: e.endTime,
      })),
      isEmpty: eventsForDate.length === 0,
      reasoning: eventsForDate.length === 0
        ? `No events scheduled for ${date} - entire day is available`
        : `Found ${eventsForDate.length} event(s) scheduled for ${date}`
    };
    
    console.log('[TOOL] Events found:', result);
    return result;
  },
});

/**
 * Tool: Find Best Time Slot
 * Analyzes existing events and suggests the best available time slot
 */
export const findBestTimeSlotTool = createTool({
  id: 'findBestTimeSlot',
  description: 'Analyzes calendar events for a specific date and finds the best available time slot based on existing meetings and preferences',
  inputSchema: z.object({
    date: z.string().describe('Date in YYYY-MM-DD format'),
    duration: z.number().describe('Duration in minutes'),
    preferredTime: z.string().optional().describe('Preferred time in HH:mm format (optional)'),
  }),
  execute: async ({ context }) => {
    const { date, duration, preferredTime } = context;
    
    console.log('[TOOL] Finding best time slot:', { date, duration, preferredTime });
    
    // Get all events for the date
    const allEvents = Array.from(calendarStore.getAllEvents().values());
    const eventsForDate = allEvents
      .filter(event => {
        const eventDate = new Date(event.startTime).toISOString().split('T')[0];
        return eventDate === date;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    // Working hours: 9 AM to 6 PM (IST)
    const workDayStart = 9;
    const workDayEnd = 18;
    
    // Convert to IST timezone offset (UTC+5:30)
    const targetDate = new Date(date + 'T00:00:00.000Z');
    
    // If user specified a preferred time, check if it's available
    if (preferredTime) {
      const [prefHour, prefMin] = preferredTime.split(':').map(Number);
      const preferredStartTime = new Date(targetDate);
      preferredStartTime.setUTCHours(prefHour - 5, prefMin - 30, 0, 0); // Convert IST to UTC
      
      const preferredEndTime = new Date(preferredStartTime);
      preferredEndTime.setMinutes(preferredEndTime.getMinutes() + duration);
      
      // Check for conflicts
      const hasConflict = eventsForDate.some(event => {
        const eventStart = new Date(event.startTime);
        const eventEnd = new Date(event.endTime);
        return (
          (preferredStartTime >= eventStart && preferredStartTime < eventEnd) ||
          (preferredEndTime > eventStart && preferredEndTime <= eventEnd) ||
          (preferredStartTime <= eventStart && preferredEndTime >= eventEnd)
        );
      });
      
      if (!hasConflict) {
        return {
          success: true,
          startTime: preferredStartTime.toISOString(),
          endTime: preferredEndTime.toISOString(),
          reasoning: `Preferred time ${preferredTime} is available - no conflicts found`
        };
      }
    }
    
    // Find gaps between meetings
    const gaps: Array<{ start: Date; end: Date; durationMinutes: number }> = [];
    
    // Check gap before first meeting
    if (eventsForDate.length > 0) {
      const firstEvent = new Date(eventsForDate[0].startTime);
      const morningStart = new Date(targetDate);
      morningStart.setUTCHours(workDayStart - 5, -30, 0, 0); // 9 AM IST
      
      if (firstEvent > morningStart) {
        const gapDuration = (firstEvent.getTime() - morningStart.getTime()) / (1000 * 60);
        if (gapDuration >= duration) {
          gaps.push({ start: morningStart, end: firstEvent, durationMinutes: gapDuration });
        }
      }
    }
    
    // Check gaps between consecutive meetings
    for (let i = 0; i < eventsForDate.length - 1; i++) {
      const currentEnd = new Date(eventsForDate[i].endTime);
      const nextStart = new Date(eventsForDate[i + 1].startTime);
      const gapDuration = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);
      
      if (gapDuration >= duration) {
        gaps.push({ start: currentEnd, end: nextStart, durationMinutes: gapDuration });
      }
    }
    
    // Check gap after last meeting
    if (eventsForDate.length > 0) {
      const lastEvent = new Date(eventsForDate[eventsForDate.length - 1].endTime);
      const eveningEnd = new Date(targetDate);
      eveningEnd.setUTCHours(workDayEnd - 5, -30, 0, 0); // 6 PM IST
      
      if (lastEvent < eveningEnd) {
        const gapDuration = (eveningEnd.getTime() - lastEvent.getTime()) / (1000 * 60);
        if (gapDuration >= duration) {
          gaps.push({ start: lastEvent, end: eveningEnd, durationMinutes: gapDuration });
        }
      }
    }
    
    // If no meetings, entire work day is available
    if (eventsForDate.length === 0) {
      const morningStart = new Date(targetDate);
      morningStart.setUTCHours(workDayStart - 5, -30, 0, 0);
      const afternoonStart = new Date(targetDate);
      afternoonStart.setUTCHours(14 - 5, -30, 0, 0); // 2 PM IST - preferred afternoon slot
      
      const endTime = new Date(afternoonStart);
      endTime.setMinutes(endTime.getMinutes() + duration);
      
      return {
        success: true,
        startTime: afternoonStart.toISOString(),
        endTime: endTime.toISOString(),
        reasoning: 'No events scheduled - chose 2:00 PM (preferred afternoon slot for meetings)'
      };
    }
    
    // Score gaps (prefer afternoon, avoid lunch, prefer larger gaps)
    const scoredGaps = gaps.map(gap => {
      const hour = gap.start.getUTCHours() + 5.5; // Convert to IST
      let score = 0;
      
      // Prefer afternoon (2-5 PM)
      if (hour >= 14 && hour < 17) score += 30;
      // Morning is okay (9-12)
      else if (hour >= 9 && hour < 12) score += 20;
      // Avoid lunch (12-1 PM)
      else if (hour >= 12 && hour < 13) score -= 10;
      // Late afternoon is okay (5-6 PM)
      else if (hour >= 17 && hour < 18) score += 15;
      
      // Prefer gaps with more buffer time
      const bufferTime = gap.durationMinutes - duration;
      score += Math.min(bufferTime / 5, 20);
      
      return { gap, score };
    });
    
    // Sort by score (highest first)
    scoredGaps.sort((a, b) => b.score - a.score);
    
    if (scoredGaps.length > 0) {
      const bestGap = scoredGaps[0].gap;
      const startTime = new Date(bestGap.start);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);
      
      const startTimeIST = new Date(startTime.getTime() + (5.5 * 60 * 60 * 1000));
      const endTimeIST = new Date(endTime.getTime() + (5.5 * 60 * 60 * 1000));
      const timeStr = startTimeIST.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      
      let reasoning = `Best available slot at ${timeStr} - `;
      if (scoredGaps[0].score > 25) {
        reasoning += 'optimal afternoon time with good buffer between meetings';
      } else if (scoredGaps[0].score > 15) {
        reasoning += 'suitable time slot with adequate spacing';
      } else {
        reasoning += 'available time slot that fits your schedule';
      }
      
      return {
        success: true,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        startTimeIST: startTimeIST.toISOString(),
        endTimeIST: endTimeIST.toISOString(),
        reasoning
      };
    }
    
    // No suitable gaps found
    return {
      success: false,
      reasoning: `No suitable ${duration}-minute slots available between ${workDayStart}:00 AM and ${workDayEnd}:00 PM. Consider scheduling for a different day or adjusting meeting duration.`
    };
  },
});
