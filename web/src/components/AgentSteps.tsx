import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import type { AgentStep } from '../types';

interface AgentStepsProps {
  steps: AgentStep[];
}

export default function AgentSteps({ steps }: AgentStepsProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="mb-3 space-y-2">
      {steps.map((step) => (
        <div
          key={step.id}
          className="flex items-start gap-2 text-sm animate-slideIn"
        >
          {step.status === 'completed' && (
            <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          )}
          {step.status === 'in-progress' && (
            <Loader2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0 animate-spin" />
          )}
          {step.status === 'pending' && (
            <Circle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          )}
          {step.status === 'error' && (
            <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          )}
          
          <div className="flex-1">
            <span
              className={`font-medium ${
                step.status === 'completed'
                  ? 'text-gray-700'
                  : step.status === 'in-progress'
                  ? 'text-blue-600'
                  : step.status === 'error'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}
            >
              {step.action}
            </span>
            {step.details && (
              <span className="text-gray-500 ml-2">• {step.details}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
