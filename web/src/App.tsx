import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import FilesCard from './components/FilesCard';
import MeetingsCard from './components/MeetingsCard';
import MessagesCard from './components/MessagesCard';
import EmailsCard from './components/EmailsCard';
import ChatInput from './components/ChatInput';
import ChatModal from './components/ChatModal';
import type { Message, CalendarEvent, AgentResponse, CalendarEventsResponse } from './types';

const API_URL = '/api'; // Use proxy in development

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: '👋 Welcome! I can help you schedule events, manage your calendar, and more. Try asking me to schedule something!',
      type: 'system',
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [threadId] = useState(`thread-${Date.now()}`);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/calendar/events`);
      const data: CalendarEventsResponse = await response.json();

      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const sendMessage = async (message: string) => {
    if (!message || isLoading) return;

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
          await loadEvents();
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
      <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />

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

