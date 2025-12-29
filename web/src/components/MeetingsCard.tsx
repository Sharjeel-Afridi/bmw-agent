import { Video, Calendar } from 'lucide-react';
import type { CalendarEvent } from '../types';

interface MeetingsCardProps {
  events: CalendarEvent[];
}

export default function MeetingsCard({ events }: MeetingsCardProps) {
  const upcomingEvent = events[0];
  const nextEvent = events[1];

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
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
      </div>

      {/* Active Meeting */}
      <div className="bg-gradient-to-br from-yellow-50 to-cyan-50 rounded-xl p-4 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">{upcomingEvent.title}</h3>
            <p className="text-sm text-gray-600">{timeString}</p>
          </div>
          <div className="flex -space-x-2">
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

      {/* Timeline to next meeting */}
      {nextEvent && (
        <div className="relative pl-6">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500"></div>
          <div className="absolute left-0 top-2 w-2 h-2 -ml-0.5 rounded-full bg-blue-500"></div>
          <div className="py-2">
            <p className="text-sm font-medium text-gray-900">{nextEvent.title}</p>
            <p className="text-xs text-gray-500">
              {new Date(nextEvent.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
