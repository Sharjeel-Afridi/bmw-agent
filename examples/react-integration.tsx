/**
 * React Component Example
 * 
 * Shows how to integrate the agent API into a React application.
 * Can be used with Next.js, Vite, Create React App, etc.
 */

import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3000/api';

interface Message {
  id: string;
  text: string;
  type: 'user' | 'agent' | 'system';
  toolCalls?: Array<{ tool: string; args: any }>;
}

interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export default function ProductivityAgent() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 Welcome! I can help you schedule events and manage your calendar.',
      type: 'system',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Load calendar events
  const loadEvents = async () => {
    try {
      const response = await fetch(`${API_URL}/calendar/events`);
      const data = await response.json();
      if (data.success) {
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Send message to agent
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      type: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/agent/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (data.success) {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.response,
          type: 'agent',
          toolCalls: data.toolCalls,
        };
        setMessages(prev => [...prev, agentMessage]);

        // Refresh events if calendar was modified
        if (data.toolCalls?.some((t: any) => t.tool.includes('calendar'))) {
          await loadEvents();
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `❌ Error: ${data.error}`,
          type: 'system',
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '❌ Failed to connect to agent',
        type: 'system',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const examples = [
    'Schedule a 2-hour coding session after lunch',
    'Create a meeting with the team at 3pm for 1 hour',
    'Block off time for deep work tomorrow morning',
  ];

  return (
    <div className="productivity-agent">
      <div className="chat-container">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}`}>
            <p>{message.text}</p>
            {message.toolCalls && message.toolCalls.length > 0 && (
              <div className="tool-calls">
                <strong>🔧 Tools used:</strong>{' '}
                {message.toolCalls.map(t => t.tool).join(', ')}
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="message agent loading">
            <span>Thinking...</span>
          </div>
        )}
      </div>

      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask me to schedule something..."
          disabled={isLoading}
        />
        <button onClick={sendMessage} disabled={isLoading || !input.trim()}>
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </div>

      <div className="examples">
        <h4>💡 Try these:</h4>
        {examples.map((example, i) => (
          <button key={i} onClick={() => setInput(example)}>
            {example}
          </button>
        ))}
      </div>

      {events.length > 0 && (
        <div className="events-section">
          <h3>📅 Calendar Events</h3>
          {events.map(event => (
            <div key={event.id} className="event-item">
              <strong>{event.title}</strong>
              <div className="event-time">
                {new Date(event.startTime).toLocaleString()} -{' '}
                {new Date(event.endTime).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Usage in Next.js:
 * 
 * 1. Copy this component to app/components/ProductivityAgent.tsx
 * 2. Import and use in your page:
 * 
 * import ProductivityAgent from '@/components/ProductivityAgent';
 * 
 * export default function Home() {
 *   return <ProductivityAgent />;
 * }
 * 
 * 3. Add styles (Tailwind or CSS modules)
 */
