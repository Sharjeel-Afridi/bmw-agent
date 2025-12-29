import { Mail, Star } from 'lucide-react';

const emails = [
  { id: 1, from: 'Design Team', subject: 'New wireframes ready', time: '10:30 AM', important: true },
  { id: 2, from: 'HR Department', subject: 'Benefits enrollment deadline', time: '9:15 AM', important: false },
  { id: 3, from: 'Client Portal', subject: 'New feedback received', time: 'Yesterday', important: true },
];

export default function EmailsCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Emails</h2>
        <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">2</span>
      </div>
      
      <div className="space-y-3">
        {emails.map((email) => (
          <div
            key={email.id}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <div className="bg-blue-50 p-2 rounded-lg shrink-0">
              <Mail className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-gray-900 truncate">{email.from}</p>
                {email.important && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />}
              </div>
              <p className="text-sm text-gray-600 truncate">{email.subject}</p>
              <p className="text-xs text-gray-500 mt-1">{email.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
