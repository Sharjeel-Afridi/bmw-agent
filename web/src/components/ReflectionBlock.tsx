/**
 * ReflectionBlock Component
 * 
 * Displays the agent's self-reflection after completing a workflow.
 * Shows goal status, reasoning, potential issues, and suggestions.
 */

import { Brain } from 'lucide-react';

interface ReflectionBlockProps {
  content: string;
}

export function ReflectionBlock({ content }: ReflectionBlockProps) {
  // Parse the structured reflection content
  const lines = content.split('\n').filter(line => line.trim() !== '');
  
  return (
    <div className="mt-4 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-purple-600" />
        <span className="text-sm font-semibold text-purple-900">Agent Reflection</span>
      </div>
      
      <div className="space-y-2 text-sm">
        {lines.map((line, idx) => {
          // Style different line types
          let className = 'text-gray-700';
          
          if (line.includes('✅ Goal Status')) {
            className = 'text-green-700 font-medium';
          } else if (line.includes('🧠 Reasoning')) {
            className = 'text-blue-700';
          } else if (line.includes('⚠️ Potential Issue')) {
            className = 'text-amber-700';
          } else if (line.includes('🔁 Suggestion')) {
            className = 'text-purple-700';
          }
          
          return (
            <div key={idx} className={className}>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}
