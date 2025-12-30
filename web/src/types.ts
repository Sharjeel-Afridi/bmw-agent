export interface ToolCall {
  tool: string;
}

export interface AgentStep {
  id: string;
  action: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  timestamp: number;
  details?: string;
}

export interface AgentResponse {
  success: boolean;
  response: string;
  error?: string;
  toolCalls?: ToolCall[];
  events?: CalendarEvent[];
  steps?: AgentStep[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

export interface CalendarEventsResponse {
  success: boolean;
  events: CalendarEvent[];
}

export interface Message {
  text: string;
  type: 'user' | 'agent' | 'system';
  toolCalls?: ToolCall[];
  events?: CalendarEvent[];
  steps?: AgentStep[];
}
