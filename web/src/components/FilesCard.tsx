import { FileText, Sheet, File, ChevronDown } from 'lucide-react';

const files = [
  { id: 1, name: 'Project Proposal.pdf', type: 'pdf', icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 2, name: 'Q4 Budget.xlsx', type: 'sheet', icon: Sheet, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 3, name: 'Meeting Notes.docx', type: 'doc', icon: File, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 4, name: 'Design System.pdf', type: 'pdf', icon: FileText, color: 'text-red-500', bg: 'bg-red-50' },
];

export default function FilesCard() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Files</h2>
        <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
          Recent <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-3">
        {files.map((file) => {
          const Icon = file.icon;
          return (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className={`${file.bg} p-2 rounded-lg`}>
                <Icon className={`w-5 h-5 ${file.color}`} />
              </div>
              <span className="text-sm text-gray-700 flex-1">{file.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
