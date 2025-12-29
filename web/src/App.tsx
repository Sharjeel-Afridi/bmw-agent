import { useState, useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import ChatMessage from './components/ChatMessage';
import EventsList from './components/EventsList';
import type { Message, CalendarEvent, AgentResponse, CalendarEventsResponse } from './types';

const API_URL = '/api'; // Use proxy in development

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: '👋 Welcome! I can help you schedule events, manage your calendar, and more. Try asking me to schedule something!',
      type: 'system',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [threadId] = useState(`thread-${Date.now()}`);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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

  const sendMessage = async (e?: FormEvent) => {
    e?.preventDefault();
    const message = inputValue.trim();

    if (!message || isLoading) return;

    // Add user message
    setMessages(prev => [...prev, { text: message, type: 'user' }]);
    setInputValue('');
    setIsLoading(true);

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

  const handleExampleClick = (text: string) => {
    setInputValue(text);
  };

  const examples = [
    'Schedule a 2-hour coding session after lunch',
    'Create a meeting with the team at 3pm for 1 hour',
    'Block off time for deep work tomorrow morning',
    'List all my calendar events',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary p-5">
      <div className="max-w-3xl mx-auto">
        <div className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">🤖 AI Productivity Agent</h1>
          <p className="text-lg opacity-90">Powered by Mastra & Google Gemini</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-5">
          <div 
            className="h-96 overflow-y-auto mb-5 p-4 bg-gray-50 rounded-lg"
            ref={chatContainerRef}
          >
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex gap-2 mb-5">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g., Schedule a team meeting tomorrow at 3pm for 1 hour"
              disabled={isLoading}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg text-base outline-none transition-colors focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className="px-6 py-3 bg-primary text-white rounded-lg text-base cursor-pointer transition-colors font-semibold hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  Thinking<span className="inline-block w-3 h-3 border-2 border-gray-200 border-t-primary rounded-full animate-spin ml-2"></span>
                </>
              ) : (
                'Send'
              )}
            </button>
          </form>

          <div className="mt-5">
            <h3 className="text-lg mb-2 text-gray-800">💡 Try these examples:</h3>
            <div className="flex flex-wrap gap-2">
              {examples.map((example, index) => (
                <button
                  key={index}
                  className="px-4 py-2 bg-gray-100 text-gray-800 border border-gray-300 rounded-md text-sm cursor-pointer transition-all hover:bg-primary hover:text-white hover:border-primary"
                  onClick={() => handleExampleClick(example)}
                  type="button"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <EventsList events={events} />
        </div>
      </div>
    </div>
  );
}

export default App;

