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
