import { Calendar, Clock, Trash2 } from 'lucide-react';
import type { Message } from '../types';
import AgentSteps from './AgentSteps';

interface ChatMessageProps {
  message: Message;
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

function formatEventTime(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // Check if it's an all-day event (no time component or just dates)
  if (startTime.length === 10 || !startTime.includes('T')) {
    return 'All day';
  }
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
}

function getEventEmoji(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('birth')) return '🎂';
  if (lower.includes('meet')) return '💼';
  if (lower.includes('call')) return '📞';
  if (lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast')) return '🍽️';
  if (lower.includes('party') || lower.includes('celebration')) return '🎉';
  if (lower.includes('workout') || lower.includes('gym')) return '🏃‍♂️';
  if (lower.includes('coffee')) return '☕';
  if (lower.includes('code') || lower.includes('coding')) return '💻';
  if (lower.includes('review')) return '📊';
  if (lower.includes('standup')) return '👥';
  return '📅';
}

function groupEventsByDate(events: CalendarEvent[]): Array<{ date: string; dateStr: string; events: CalendarEvent[] }> {
  const groups: { [key: string]: { date: string; dateStr: string; events: CalendarEvent[] } } = {};
  
  events.forEach(event => {
    const dateStr = formatEventDate(event.startTime);
    const dateKey = new Date(event.startTime).toISOString().split('T')[0];
    
    if (!groups[dateKey]) {
      groups[dateKey] = { date: dateKey, dateStr, events: [] };
    }
    groups[dateKey].events.push(event);
  });
  
  return Object.values(groups).sort((a, b) => a.date.localeCompare(b.date));
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const baseClasses = "mb-4 px-4 py-3 rounded-xl max-w-[80%] animate-slideIn";
  
  const typeClasses = {
    user: "bg-primary text-white ml-auto text-right",
    agent: "bg-white border border-gray-200",
    system: "bg-yellow-50 border border-yellow-400 text-sm text-yellow-800 max-w-full text-center"
  };

  // If we have events in the message, render as cards
  if (message.events && message.events.length > 0 && message.type === 'agent') {
    const groupedEvents = groupEventsByDate(message.events);
    
    return (
      <div className="mb-4 animate-slideIn max-w-full">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          {/* Agent thinking steps */}
          {message.steps && message.steps.length > 0 && (
            <AgentSteps steps={message.steps} />
          )}
          
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-gray-900">Your Calendar Events</p>
              <p className="text-xs text-gray-500">{message.events.length} event{message.events.length !== 1 ? 's' : ''} found</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {groupedEvents.map((dateGroup, idx) => (
              <div key={idx}>
                <h3 className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  {dateGroup.dateStr}
                </h3>
                <div className="space-y-2">
                  {dateGroup.events.map((event) => {
                    const emoji = getEventEmoji(event.title);
                    const timeStr = formatEventTime(event.startTime, event.endTime);
                    
                    return (
                      <div 
                        key={event.id}
                        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 border border-blue-100 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{emoji}</span>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{event.title}</p>
                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{timeStr}</span>
                            </div>
                          </div>
                          {/* <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (confirm(`Delete "${event.title}"?`)) {
                                // Trigger delete - you can pass a callback from App.tsx if needed
                                console.log('Delete event:', event.id);
                              }
                            }}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                            title="Delete event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button> */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {message.text && message.text.trim() && !message.text.includes('📆') && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-700">
              {message.text}
            </div>
          )}
        </div>
        
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-2 px-4 py-2 bg-blue-50 rounded-lg text-xs text-blue-900">
            <strong>🔧 Tools used:</strong> {message.toolCalls.map(t => t.tool).join(', ')}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`${baseClasses} ${typeClasses[message.type]}`}>
      {/* Agent thinking steps for non-event messages */}
      {message.type === 'agent' && message.steps && message.steps.length > 0 && (
        <AgentSteps steps={message.steps} />
      )}
      
      <div className="whitespace-pre-wrap">{message.text}</div>
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-900">
          <strong>🔧 Tools used:</strong> {message.toolCalls.map(t => t.tool).join(', ')}
        </div>
      )}
    </div>
  );
}
