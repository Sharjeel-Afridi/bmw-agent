import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import FilesCard from './components/FilesCard';
import MeetingsCard from './components/MeetingsCard';
import MessagesCard from './components/MessagesCard';
import EmailsCard from './components/EmailsCard';
import ChatInput from './components/ChatInput';
import ChatModal from './components/ChatModal';
import GoogleCalendarAuth from './components/GoogleCalendarAuth';
import AuthCallback from './components/AuthCallback';
import { isAuthenticated, getAccessToken } from './utils/googleAuth';
import { fetchGoogleCalendarEvents } from './utils/googleCalendarService';
import type { Message, CalendarEvent, AgentResponse, CalendarEventsResponse } from './types';

const API_URL = '/api'; // Use proxy in development

function App() {
  // Check if we're on the callback route first
  if (window.location.pathname === '/auth/callback') {
    return <AuthCallback />;
  }

  return <Dashboard />;
}

function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: '👋 Welcome! Please connect your Google Calendar to get started. Once connected, I can help you schedule events, manage your calendar, and more!',
      type: 'system',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [threadId] = useState(`thread-${Date.now()}`);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCalendarAuthenticated, setIsCalendarAuthenticated] = useState(isAuthenticated());

  const loadEvents = async () => {
    try {
      // Try to load from Google Calendar first if authenticated
      if (isCalendarAuthenticated) {
        try {
          const googleEvents = await fetchGoogleCalendarEvents();
          setEvents(googleEvents);
          return;
        } catch (error) {
          console.error('Error loading Google Calendar events:', error);
          // Fall back to backend calendar if Google Calendar fails
          setIsCalendarAuthenticated(false);
        }
      }

      // Fall back to backend calendar storage
      const response = await fetch(`${API_URL}/calendar/events`);
      const data: CalendarEventsResponse = await response.json();

      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleAuthChange = () => {
    setIsCalendarAuthenticated(isAuthenticated());
    loadEvents();
  };

  // Load events on mount and when auth changes
  useEffect(() => {
    loadEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCalendarAuthenticated]);

  const sendMessage = async (message: string) => {
    if (!message || isLoading) return;

    // Require Google OAuth authentication before allowing chat
    if (!isCalendarAuthenticated) {
      setMessages(prev => [
        ...prev,
        {
          text: '🔒 Please connect your Google Calendar first to start using the assistant. Click the "Sign in with Google" button above.',
          type: 'system',
        },
      ]);
      setIsChatOpen(true);
      return;
    }

    // Add user message
    setMessages(prev => [...prev, { text: message, type: 'user' }]);
    setIsLoading(true);
    setIsChatOpen(true); // Open chat modal when sending message

    try {
      const response = await fetch(`${API_URL}/agent/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          threadId,
          googleAccessToken: isCalendarAuthenticated ? getAccessToken() : undefined,
        }),
      });

      const data: AgentResponse = await response.json();

      if (data.success) {
        setMessages(prev => [
          ...prev,
          {
            text: data.response,
            type: 'agent',
            toolCalls: data.toolCalls,
          },
        ]);

        // Refresh events if calendar was modified
        if (data.toolCalls?.some(t => t.tool.includes('calendar'))) {
          try {
            await loadEvents();
          } catch (eventLoadError) {
            console.error('Error reloading events after calendar update:', eventLoadError);
            // Don't show error to user, calendar was updated successfully
          }
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            text: `❌ Error: ${data.error}`,
            type: 'system',
          },
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        {
          text: '❌ Failed to connect to agent. Make sure the server is running on port 3000.',
          type: 'system',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-32">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-primary to-secondary p-3 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AI Productivity Agent</h1>
              <p className="text-sm text-gray-500">Powered by Mastra & Google Gemini</p>
            </div>
          </div>
          
          {messages.length > 1 && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all text-sm font-medium text-gray-700 border border-gray-200"
            >
              View Chat History
            </button>
          )}
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Google Calendar Auth - Spans full width when not authenticated */}
          {!isCalendarAuthenticated ? (
            <div className="lg:col-span-3">
              <GoogleCalendarAuth onAuthChange={handleAuthChange} />
            </div>
          ) : (
            <div className="lg:col-span-3">
              <GoogleCalendarAuth onAuthChange={handleAuthChange} />
            </div>
          )}

          {/* Files Card - Spans 1 column */}
          <div className="lg:col-span-1">
            <FilesCard />
          </div>

          {/* Meetings Card - Spans 2 columns on large screens */}
          <div className="lg:col-span-2">
            <MeetingsCard events={events} />
          </div>

          {/* Messages Card */}
          <div className="lg:col-span-1">
            <MessagesCard />
          </div>

          {/* Emails Card */}
          <div className="lg:col-span-1">
            <EmailsCard />
          </div>

          {/* Placeholder for future integrations */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border-2 border-dashed border-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">More integrations</p>
              <p className="text-xs text-gray-400 mt-1">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Input */}
      <ChatInput 
        onSendMessage={sendMessage} 
        isLoading={isLoading} 
        disabled={!isCalendarAuthenticated}
      />

      {/* Chat Modal */}
      <ChatModal 
        messages={messages}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}

export default App;

