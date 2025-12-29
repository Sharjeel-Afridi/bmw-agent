import { MessageSquare, Github, MessageCircle } from 'lucide-react';

const messages = [
  { id: 1, platform: 'Slack', icon: MessageSquare, sender: 'Sarah', preview: 'Can you review the PR?', time: '2m ago', color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 2, platform: 'WhatsApp', icon: MessageCircle, sender: 'Team', preview: 'Meeting moved to 3pm', time: '15m ago', color: 'text-green-500', bg: 'bg-green-50' },
  { id: 3, platform: 'GitHub', icon: Github, sender: 'John', preview: 'Commented on issue #42', time: '1h ago', color: 'text-gray-700', bg: 'bg-gray-50' },
];

export default function MessagesCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-full">3</span>
      </div>
      
      <div className="space-y-3">
        {messages.map((message) => {
          const Icon = message.icon;
          return (
            <div
              key={message.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className={`${message.bg} p-2 rounded-lg shrink-0`}>
                <Icon className={`w-4 h-4 ${message.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{message.sender}</p>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                <p className="text-sm text-gray-600 truncate">{message.preview}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
