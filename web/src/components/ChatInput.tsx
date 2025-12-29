import { useState } from 'react';
import type { FormEvent } from 'react';
import { Paperclip, Mic, Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export default function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-50">
      <form onSubmit={handleSubmit} className="bg-white rounded-full shadow-2xl border border-gray-100">
        <div className="flex items-center gap-3 px-6 py-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            disabled={isLoading}
            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 disabled:opacity-50"
          />
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Attach file"
            >
              <Paperclip className="w-5 h-5 text-gray-500" />
            </button>
            
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Voice input"
            >
              <Mic className="w-5 h-5 text-gray-500" />
            </button>
            
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-gray-200 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
