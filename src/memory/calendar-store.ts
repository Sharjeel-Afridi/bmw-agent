/**
 * In-Memory Calendar Store
 * 
 * Simple data structure to store calendar events during runtime.
 * WHY: Avoids database complexity while proving the tool execution flow works.
 * Can be easily replaced with persistent storage later.
 */

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

class CalendarStore {
  private events: CalendarEvent[] = [];

  addEvent(event: Omit<CalendarEvent, 'id' | 'createdAt'>): CalendarEvent {
    const newEvent: CalendarEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    
    this.events.push(newEvent);
    return newEvent;
  }

  getAllEvents(): CalendarEvent[] {
    return [...this.events];
  }

  getEventById(id: string): CalendarEvent | undefined {
    return this.events.find(e => e.id === id);
  }

  clear(): void {
    this.events = [];
  }
}

// Singleton instance - shared across the application
export const calendarStore = new CalendarStore();
