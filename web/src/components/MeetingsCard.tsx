import { Video, Calendar, Trash2, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { CalendarEvent } from '../types';

interface MeetingsCardProps {
  events: CalendarEvent[];
  onDeleteEvent?: (eventId: string) => void;
}

export default function MeetingsCard({ events, onDeleteEvent }: MeetingsCardProps) {
  const [showAll, setShowAll] = useState(false);
  
  // Filter for upcoming events only (future from now)
  const now = new Date();
  const upcomingEvents = events
    .filter(event => new Date(event.startTime) > now)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  
  // Show first 3 or all based on state
  const displayedEvents = showAll ? upcomingEvents : upcomingEvents.slice(0, 3);
  const hasMore = upcomingEvents.length > 3;
  
  const upcomingEvent = displayedEvents[0];
  const nextEvents = displayedEvents.slice(1);

  const handleDelete = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteEvent && confirm('Are you sure you want to delete this meeting?')) {
      onDeleteEvent(eventId);
    }
  };

  if (!upcomingEvent) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
        </div>
        <p className="text-sm text-gray-500">No upcoming meetings</p>
      </div>
    );
  }

  const startTime = new Date(upcomingEvent.startTime);
  const endTime = new Date(upcomingEvent.endTime);
  const timeString = `${startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
        </div>
        <span className="text-xs text-gray-500">{upcomingEvents.length} meeting{upcomingEvents.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Active Meeting */}
      <div className="bg-gradient-to-br from-yellow-50 to-cyan-50 rounded-xl p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900">{upcomingEvent.title}</h3>
              {onDeleteEvent && (
                <button
                  onClick={(e) => handleDelete(upcomingEvent.id, e)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Delete meeting"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-gray-600">{timeString}</p>
          </div>
          <div className="flex -space-x-2 ml-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white"></div>
            <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white"></div>
            <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white"></div>
          </div>
        </div>
        <button className="w-full bg-black text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
          <Video className="w-4 h-4" />
          Join
        </button>
      </div>

      {/* Next meetings */}
      {nextEvents.length > 0 && (
        <div className="space-y-2">
          {nextEvents.map((event, index) => (
            <div key={event.id} className="relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500"></div>
              {/* <div className="absolute -left-1 top-6 w-2 h-2 rounded-full bg-blue-500"></div> */}
              <div className="py-2 flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
                {onDeleteEvent && (
                  <button
                    onClick={(e) => handleDelete(event.id, e)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors ml-2"
                    aria-label="Delete meeting"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* View All button */}
      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-4 py-2 text-sm font-medium text-primary hover:text-primary-dark flex items-center justify-center gap-1 hover:bg-blue-50 rounded-lg transition-colors"
        >
          View All ({upcomingEvents.length} meetings)
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
      
      {showAll && hasMore && (
        <button
          onClick={() => setShowAll(false)}
          className="w-full mt-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Show Less
        </button>
      )}
    </div>
  );
}

