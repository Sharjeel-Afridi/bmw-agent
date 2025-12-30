/**
 * Google Calendar API Integration
 * 
 * Helper functions to create events in Google Calendar using the API
 */

interface GoogleCalendarEvent {
  summary: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
}

/**
 * Create an event in Google Calendar
 * @param accessToken User's OAuth access token
 * @param event Event details
 * @returns Created event ID
 */
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: {
    title: string;
    startTime: string;
    endTime: string;
  }
): Promise<string> {
  const calendarEvent: GoogleCalendarEvent = {
    summary: event.title,
    start: {
      dateTime: event.startTime,
      timeZone: 'UTC',
    },
    end: {
      dateTime: event.endTime,
      timeZone: 'UTC',
    },
  };

  console.log('[Google Calendar] Creating event:', JSON.stringify(calendarEvent, null, 2));

  const response = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calendarEvent),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('[Google Calendar] Error response:', error);
    throw new Error(`Failed to create Google Calendar event: ${error}`);
  }

  const data = await response.json() as { id: string; htmlLink?: string };
  console.log('[Google Calendar] Event created successfully:', { id: data.id, link: data.htmlLink });
  return data.id;
}

/**
 * Fetch events from Google Calendar
 * @param accessToken User's OAuth access token
 * @returns Array of calendar events
 */
export async function fetchGoogleCalendarEvents(accessToken: string): Promise<Array<{
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}>> {
  const now = new Date();
  const timeMin = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Past 7 days
  const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // Next 30 days

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
  });

  console.log('[Google Calendar] Fetching events from:', timeMin, 'to:', timeMax);

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('[Google Calendar] Error fetching events:', error);
    throw new Error(`Failed to fetch Google Calendar events: ${error}`);
  }

  const data = await response.json() as {
    items: Array<{
      id: string;
      summary?: string;
      start: { dateTime?: string; date?: string };
      end: { dateTime?: string; date?: string };
      created?: string;
    }>;
  };

  const events = (data.items || []).map(event => ({
    id: event.id,
    title: event.summary || 'Untitled Event',
    startTime: event.start.dateTime || event.start.date || '',
    endTime: event.end.dateTime || event.end.date || '',
    createdAt: event.created || new Date().toISOString(),
  }));

  console.log('[Google Calendar] Fetched', events.length, 'events');
  return events;
}
