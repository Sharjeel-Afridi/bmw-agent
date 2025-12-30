export interface ToolCall {
  tool: string;
}

export interface AgentResponse {
  success: boolean;
  response: string;
  error?: string;
  toolCalls?: ToolCall[];
  events?: CalendarEvent[];
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
}
