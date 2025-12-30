import { useState, useEffect } from 'react';
import { Sparkles, Slack, Github, MessageCircle, ListTodo } from 'lucide-react';
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
    setIsChatOpen(true);

    // Create a placeholder message for streaming steps
    const placeholderMessage: Message = {
      text: '',
      type: 'agent',
      steps: [],
    };
    setMessages(prev => [...prev, placeholderMessage]);
    const messageIndex = messages.length + 1; // +1 because we just added user message

    try {
      const response = await fetch(`${API_URL}/agent/query-stream`, {
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

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              console.log('[Frontend] Received SSE event:', data.type);

              if (data.type === 'step') {
                // Update the placeholder message with new step
                setMessages(prev => {
                  const newMessages = [...prev];
                  const msg = newMessages[messageIndex];
                  if (msg) {
                    msg.steps = [...(msg.steps || []), data.step];
                  }
                  return newMessages;
                });
              } else if (data.type === 'complete') {
                console.log('[Frontend] Received complete event, stopping loader');
                // Update with final response
                setMessages(prev => {
                  const newMessages = [...prev];
                  const msg = newMessages[messageIndex];
                  if (msg) {
                    msg.text = data.response;
                    msg.events = data.events;
                    msg.toolCalls = data.toolCalls;
                  }
                  return newMessages;
                });
                setIsLoading(false);

                // Refresh events if calendar was modified
                if (data.toolCalls?.some((t: any) => t.tool.includes('calendar') || t.tool.includes('Calendar'))) {
                  try {
                    await loadEvents();
                  } catch (err) {
                    console.error('Failed to refresh events:', err);
                  }
                }
              } else if (data.type === 'reflection') {
                console.log('[Frontend] Received reflection');
                // Add reflection to the message
                setMessages(prev => {
                  const newMessages = [...prev];
                  const msg = newMessages[messageIndex];
                  if (msg) {
                    msg.reflection = data.content;
                  }
                  return newMessages;
                });
              } else if (data.type === 'error') {
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[messageIndex] = {
                    text: `❌ Error: ${data.error}`,
                    type: 'system',
                  };
                  return newMessages;
                });
                setIsLoading(false);
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', line, parseError);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[messageIndex] = {
          text: '❌ Failed to connect to agent. Make sure the server is running on port 3000.',
          type: 'system',
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      // Delete from backend using agent
      const response = await fetch(`${API_URL}/agent/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Delete the event with ID ${eventId}`,
          threadId,
          googleAccessToken: isCalendarAuthenticated ? getAccessToken() : undefined,
        }),
      });

      const data: AgentResponse = await response.json();

      if (data.success) {
        // Refresh events
        await loadEvents();
        
        // Show success message
        setMessages(prev => [
          ...prev,
          {
            text: '✅ Meeting deleted successfully',
            type: 'system',
          },
        ]);
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      setMessages(prev => [
        ...prev,
        {
          text: '❌ Failed to delete meeting',
          type: 'system',
        },
      ]);
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

          {/* Placeholder for future integrations */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900">More Integrations</h3>
              <p className="text-xs text-gray-500 mt-1">Coming soon...</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <Slack className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-xs font-medium text-purple-900">Slack</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                <Github className="w-8 h-8 text-gray-700 mb-2" />
                <span className="text-xs font-medium text-gray-900">GitHub</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                <MessageCircle className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-xs font-medium text-green-900">WhatsApp</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <ListTodo className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-xs font-medium text-blue-900">Jira</span>
              </div>
            </div>
          </div>

          {/* Meetings Card - Spans 2 columns on large screens */}
          <div className="lg:col-span-2">
            <MeetingsCard events={events} onDeleteEvent={handleDeleteEvent} />
          </div>

          {/* Messages Card */}
          <div className="lg:col-span-1">
            <MessagesCard />
          </div>

          {/* Emails Card */}
          <div className="lg:col-span-1">
            <EmailsCard />
          </div>
          {/* Files Card - Spans 1 column */}
          <div className="lg:col-span-1">
            <FilesCard />
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

