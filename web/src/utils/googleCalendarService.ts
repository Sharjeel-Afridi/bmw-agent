import { getAccessToken, clearAccessToken } from './googleAuth';
import type { CalendarEvent } from '../types';

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  htmlLink?: string;
}

export async function fetchGoogleCalendarEvents(): Promise<CalendarEvent[]> {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    throw new Error('No access token available');
  }

  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(); // Next 7 days

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '10',
  });

  try {
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
      if (response.status === 401) {
        // Token expired or invalid
        clearAccessToken();
        throw new Error('Authentication expired. Please sign in again.');
      }
      throw new Error('Failed to fetch calendar events');
    }

    const data = await response.json();
    
    return (data.items || []).map((event: GoogleCalendarEvent) => ({
      id: event.id,
      title: event.summary || 'Untitled Event',
      startTime: event.start.dateTime || event.start.date || '',
      endTime: event.end.dateTime || event.end.date || '',
    }));
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
}

export async function exchangeCodeForToken(code: string): Promise<{
  access_token: string;
  refresh_token?: string;
}> {
  // This should be done on the backend for security
  // For now, we'll use the backend API
  const response = await fetch('/api/auth/google/callback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error || 'Failed to exchange code for token';
    console.error('Token exchange failed:', errorMessage, errorData);
    throw new Error(errorMessage);
  }

  return response.json();
}
