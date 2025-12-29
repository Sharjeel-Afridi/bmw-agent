import type { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const baseClasses = "mb-4 px-4 py-3 rounded-xl max-w-[80%] animate-slideIn";
  
  const typeClasses = {
    user: "bg-primary text-white ml-auto text-right",
    agent: "bg-white border border-gray-200",
    system: "bg-yellow-50 border border-yellow-400 text-sm text-yellow-800 max-w-full text-center"
  };

  return (
    <div className={`${baseClasses} ${typeClasses[message.type]}`}>
      {message.text}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-900">
          <strong>🔧 Tools used:</strong> {message.toolCalls.map(t => t.tool).join(', ')}
        </div>
      )}
    </div>
  );
}
