import type { CalendarEvent } from '../types';

interface EventsListProps {
  events: CalendarEvent[];
}

export default function EventsList({ events }: EventsListProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 pt-5 border-t border-gray-200">
      <h3 className="text-lg mb-2 text-gray-800">📅 Calendar Events</h3>
      <div className="flex flex-col gap-2">
        {events.map(event => (
          <div key={event.id} className="p-2 bg-gray-50 border-l-4 border-primary rounded">
            <strong className="text-primary">{event.title}</strong>
            <div className="text-sm text-gray-600 mt-1">
              {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
