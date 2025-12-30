# 🤖 BMW Intelligent Calendar Agent

> **Hackathon Project**: AI-Powered Productivity Assistant with Natural Language Scheduling

An intelligent productivity agent that helps users manage their calendar through natural language conversations. Built with contextual awareness, reasoning capabilities, and real-time streaming updates - specifically designed for busy professionals who need smart scheduling assistance.

## 🎯 Challenge Implementation

This project addresses the **Productivity Agent Challenge** by creating an AI assistant that:

✅ **Natural Language Understanding** - "Schedule a 2-hour coding session after lunch" → Agent analyzes calendar, finds optimal time, creates event  
✅ **Multi-Tool Integration** (4+ tools) - Calendar sync, event analysis, smart time slot finding, event creation  
✅ **Context Tracking** - Remembers conversation history, understands time references ("today", "after lunch")  
✅ **Reasoning & Tool Orchestration** - Sequential workflow: analyze request → fetch events → find best slot → create event  
✅ **Real Calendar Integration** - Google Calendar API (not mock) with OAuth 2.0  
✅ **Conversational Interface** - Streaming responses with real-time step visualization  
✅ **MCP Server** - Exposed as Model Context Protocol server for Claude Desktop  

### 🌟 Bonus Features Implemented

✅ **Self-Reflection** - Agent reviews its own work after each task, providing insights on decision-making  
✅ **AI Observability** - Built-in Mastra observability for tracking agent execution and tool usage  
✅ **Advanced Context Awareness** - Fatigue detection, continuous meeting block detection, timezone handling  
✅ **Smart Scheduling Logic** - Considers gaps, lunch hours, meeting density, user state (tired/energized)

## 🛠️ Tech Stack

### Prerequisites

- Node.js >= 22.13.0
- npm or pnpm
- Google Cloud Project with Calendar API enabled
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Clone & Install

```bash
# Clone repository
cd bmw-agent

# Install backend dependencies
npm install

# Install frontend dependencies
cd web
pnpm install
cd ..
```

### 2. Environment Setup

Create `.env` file in root directory:

```env
# Gemini API Key (required)
GEMINI_API_KEY=your_gemini_api_key_here

# Google Calendar OAuth (required)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback

# Server Configuration
PORT=3000
NOD📁 Project Structure

```
bmw-agent/
├── src/                                    # Backend source code
│   ├── agents/
│   │   └── orchestrator-agent.ts          # Main productivity agent with instructions
│   ├── tools/
│   │   ├── calendar-tools.ts              # Basic calendar operations (list, create)
│   │   └── scheduling-tools.ts            # Intelligent scheduling tools (4-step workflow)
│   ├── memory/
│   │   └── calendar-store.ts              # In-memory event storage
│   ├── llm/
│   │   └── gemini.ts                      # Gemini 1.5 Pro configuration
│   ├── server/
│   │   ├── api.ts                         # Express REST API with SSE streaming
│   │   └── mcp.ts                         # MCP server implementation
│   ├── mastra.ts                          # Mastra instance with agents & tools
│   └── index.ts                           # CLI entry point
│
├── web/                                    # React TypeScript frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatMessage.tsx            # Message display with reflection
│   │   │   ├── ChatModal.tsx              # Chat interface with SSE
│   │   │   ├── ReflectionBlock.tsx        # Self-reflection visualization
│   │   │   ├── AgentSteps.tsx             # Real-time step tracking
│   │   │   ├── MeetingsCard.tsx           # Upcoming meetings display
│   │   │   └── GoogleCalendarAuth.tsx     # OAuth flow handler
│   │   ├── App.tsx                        # Main dashboard (bento grid)
│   │   ├── types.ts                       # TypeScript interfaces
│   │   └── main.tsx                       # React entry point
│   ├── public/                            # Static assets
│   ├── package.json                       # Frontend dependencies
│   └── vite.config.ts                     # Vite configuration
│
├── .env                                    # Environment variables (create this)
├── package.json                           # Backend dependencies
├── tsconfig.json                          # TypeScript configuration
└── README.md                              # This file

Terminal 2 (Frontend):
```bash
cd web
pnpm dev
```

Then open:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

**Option B: Test Agent Directly**
```bash
npm run dev
```

**Option C: MCP Server (Claude Desktop)**
```bash
npm run mcp
```
See [MCP_QUICKSTART.md](MCP_QUICKSTART.md) for Claude Desktop integration.

### 4. First Use

1. Open frontend at http://localhost:5173
2. Click "Connect Google Calendar"
3. Authorize the application
4. Start chatting: "I need to meet with the dev team today for 1 hour"
5. Watch the agent work in real-time!
     - ✅ Afternoon preference (2-5 PM): +30 points
     - ⚠️ Lunch hour avoidance (12-1 PM): -10 points
     - 🚫 Past time filtering: Automatic exclusion
     - 📊 Gap scoring: Penalizes awkward 15-min gaps
     - ⏰ Buffer management: Requires 60 min after continuous blocks

3. **Context-Aware Scheduling**
   - **Fatigue Detection**: Recognizes keywords (tired, exhausted, worn out, drained, burned out)
   - **Continuous Block Detection**: Identifies 2+ hour meeting marathons with <30 min gaps
   - **Smart Recovery Time**: Enforces 60-min buffer after long meeting blocks
   - **Evening Penalty**: Avoids late slots (-100 points) when user is fatigued
   - **Time Awareness**: Never schedules meetings in the past

4. **Real-Time Streaming Updates**
   - Step-by-step visualization: "Analyzing request..." → "Getting events..." → "Finding time slot..." → "Creating event..."
   - Server-Sent Events (SSE) architecture
   - Live agent reasoning display
   - Instant feedback on tool execution

5. **Self-Reflection (Bonus)**
   - After completing a task, agent analyzes its own work
   - Structured reflection format:
     - ✅ Goal Status: What was accomplished
     - 🧠 Reasoning: Why that time was chosen
     - ⚠️ Potential Issue: Warnings about schedule density
     - 🔁 Suggestion: Recommendations for better time management
   - Powered by Gemini with structured prompts

6. **Google Calendar Integration**
   - OAuth 2.0 authentication flow
   - Real-time sync with user's Google Calendar
   - Create, read, and delete events
   - Timezone conversion (IST ↔ UTC)
   - Automatic calendar refresh

7. **MCP Server**
   - Exposed as Model Context Protocol server
   - Works with Claude Desktop and Cline
   - Tool discovery and invocation
   - Structured responses

###🎬 Demo & Usage Examples

### Example 1: Basic Scheduling
```
User: "I need to meet with the dev team today for 1 hour"

Agent Steps (Streaming):
1. 🔍 Analyzing request...
   ✓ Extracted: "Dev Team Meeting", Duration: 1 hour, Date: Today
   
2. 📅 Getting today's events...
   ✓ Found 3 existing meetings
   
3. 🎯 Finding best time slot...
   ✓ Analyzed 12 time slots, scored based on gaps and preferences
   ✓ Best slot: 2:30 PM - 3:30 PM (Score: 45)
   
4. 🎯 Hackathon Challenge Fulfillment

### Required Features

| Requirement | Implementation | Status |
|------------|----------------|--------|
| Natural language goals | "Schedule 2-hour coding session after lunch" → Analyzes → Creates event | ✅ Complete |
| Calendar API integration | Real Google Calendar API v3 with OAuth 2.0 (not mock) | ✅ Complete |
| Task memory | In-memory calendar store with event persistence | ✅ Complete |
| Conversational responses | Streaming chat interface with context awareness | ✅ Complete |
| MCP Server | Exposed as Model Context Protocol server | ✅ Complete |
| Context tracking | Remembers conversation, understands relative times | ✅ Complete |
| Reasoning & orchestration | 4-tool sequential workflow with decision logic | ✅ Complete |
| Time management logic | Gap analysis, scoring, conflict detection | ✅ Complete |

### Bonus Features

| Feature | Implementation | Status |
|---------|----------------|--------|
| Self-reflection | Agent analyzes its own decisions after each task | ✅ Implemented |
| AI observability | Built-in Mastra observability with execution traces | ✅ Implemented |
| Additional context | Fatigue detection, continuous block awareness, timezone handling | ✅ Implemented |

### Skills Demonstrated

✅ **Context Tracking** - Agent maintains conversation state, understands time references ("today", "after lunch"), tracks fatigue state  
✅ **Reasoning** - Multi-step workflow with scoring algorithm for optimal time slot selection  
✅ **Tool Orchestration** - 4 tools working sequentially: analyze → fetch → score → create  
✅ **NLU** - Extracts meeting details from natural language, handles variations  
✅ **Time Management** - Gap analysis, buffer management, conflict avoidance, past time filtering  

## 🚀 Key Differentiators

1. **Real, Not Mock** - Actual Google Calendar integration, not simulated
2. **Production-Ready UI** - Full React frontend with real-time streaming
3. **Context Awareness** - Fatigue detection, meeting density analysis
4. **Self-Reflection** - Agent explains its reasoning after each action
5. **Timezone Handling** - IST display with UTC storage for international compatibility
6. **Smart Scoring** - Multi-factor time slot evaluation algorithm
7. **MCP Integration** - Works with Claude Desktop out of the box

## 🧪 Testing & Validation

### Test Scenarios

1. **Basic Scheduling**: ✅ "Meet with team today" → Analyzes calendar → Finds optimal slot
2. **Fatigue Handling**: ✅ "I'm tired" → Avoids evening slots → Schedules early
3. **Time Awareness**: ✅ Current time 1 PM → Filters past slots → Only future times
4. **Block Detection**: ✅ 3-hour meeting marathon → Requires 60-min buffer
5. **Natural Language**: ✅ "Take a one hour lecture on git" → Full title preserved
6. **Self-Reflection**: ✅ After event creation → Agent analyzes decision quality

### Run Tests

```bash
# Test agent directly
npm run dev

# Test API endpoints
curl http://localhost:3000/api/agent/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Schedule a meeting with the team today"}'

# Test SSE streaming
curl http://localhost:3000/api/agent/query-stream \
  -H "Content-Type: application/json" \
  -d '{"query": "I need a 1 hour coding session"}' \
  --no-buffer
```

## 🐛 Troubleshooting

### Common Issues

**Error: GEMINI_API_KEY is required**
- Create `.env` file in root directory
- Add: `GEMINI_API_KEY=your_key_here`
- Get key from [Google AI Studio](https://aistudio.google.com/apikey)

**Error: OAuth callback failed**
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- Check redirect URI matches: `http://localhost:3000/auth/google/callback`
- Enable Calendar API in Google Cloud Console

**Frontend not connecting to backend**
- Backend must be running on port 3000: `npm run server`
- Frontend on port 5173: `cd web && pnpm dev`
- Check CORS configuration in [src/server/api.ts](src/server/api.ts)

**Agent not streaming steps**
- Verify SSE connection in browser DevTools → Network tab
- Check for `sentSteps` Set tracking in [src/server/api.ts](src/server/api.ts)
- Ensure `onStepFinish` callback is firing

**Past times being scheduled**
- Check system time is correct
- Verify `isPastTime()` function in [src/tools/scheduling-tools.ts](src/tools/scheduling-tools.ts)
- Ensure timezone is set to Asia/Kolkata

## 🔮 Future Enhancements

### Planned Features
- [ ] Multi-calendar support (work, personal, team calendars)
- [ ] Recurring meeting patterns
- [ ] Meeting priority levels (high/medium/low)
- [ ] Integration with Slack for meeting notifications
- [ ] Email invitations to attendees
- [ ] Meeting analytics dashboard
- [ ] Voice input for hands-free scheduling
- [ ] Persistent database (PostgreSQL/MongoDB)

### Extension Ideas
- [ ] Task management beyond calendar (to-do lists)
- [ ] Time tracking and productivity metrics
- [ ] Meeting preparation agent (research attendees, topics)
- [ ] Post-meeting summary generation
- [ ] Conflict resolution with suggestions

## 📄 License

ISC

## 🙏 Acknowledgments

Built with:
- [Mastra](https://mastra.ai/) - AI agent framework
- [Google Gemini](https://ai.google.dev/) - Language model
- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

**Hackathon Submission** - Productivity Agent Challenge  
**Team**: BMW Agent  
**Tech**: Mastra + Gemini + React + TypeScript  
**Highlights**: Real calendar integration, self-reflection, fatigue awareness, MCP server

### 2. Configure Environment

Copy the example environment file and add your Gemini API key:

```bash
cp .env.example .env
```

Get your Gemini API key from: https://aistudio.google.com/apikey

Edit `.env` and replace `your_gemini_api_key_here` with your actual key.

### 3. Choose Your Interface

**Option A: Test the agent directly**
```bash
npm run dev
```

**Option B: Start the REST API server**
```bash
npm run server
```
Then open http://localhost:3000 for the web UI.

**Option C: Start the MCP server (for Claude Desktop)**
```bash
npm run mcp
```
See [MCP_QUICKSTART.md](MCP_QUICKSTART.md) for Claude Desktop setup.

## Project Structure

```
src/
├── agents/
│   └── orchestrator-agent.ts    # Main productivity agent
├── tools/
│   └── calendar-tools.ts        # Calendar event creation & listing
├── memory/
│   └── calendar-store.ts        # In-memory event storage
├── llm/
│   └── gemini.ts                # Gemini configuration
├── server/
│   ├── api.ts                   # REST API server
│   ├── mcp.ts                   # MCP server (Claude Desktop)
│   └── public/
│       └── index.html           # Demo web UI
├── mastra.ts                    # Mastra instance configuration
└── index.ts                     # Entry point & test execution
```

## Usage Guides

- **Backend Testing**: See [QUICKSTART.md](QUICKSTART.md)
- **Frontend Integration**: See [FRONTEND_QUICKSTART.md](FRONTEND_QUICKSTART.md)
- **MCP Server Setup**: See [MCP_QUICKSTART.md](MCP_QUICKSTART.md)

## Available Scripts

- `npm run dev` - Run the agent with hot reload
- `npm run server` - Start the REST API server (port 3000)
- `npm run mcp` - Start the MCP server (for Claude Desktop)
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run mastra:dev` - Start Mastra dev server (for UI)
- `npm run mastra:build` - Build Mastra project
- `npm run mastra:start` - Start Mastra server

## Architecture

### Why This Structure?

**Separation of Concerns:**
- `agents/` - Agent definitions and instructions
- `tools/` - Tool implementations (calendar, future tools)
- `memory/` - Data storage abstractions
- `llm/` - LLM provider configuration
- `mastra.ts` - Central Mastra configuration

**Key Design Decisions:**

1. **Centralized LLM Config** ([src/llm/gemini.ts](src/llm/gemini.ts))
   - Single source for API keys and model selection
   - Easy to switch models globally
   - Validates API key at startup

2. **In-Memory Storage** ([src/memory/calendar-store.ts](src/memory/calendar-store.ts))
   - No database setup required
   - Fast iteration during development
   - Easy to replace with persistent storage

3. **Modular Tools** ([src/tools/calendar-tools.ts](src/tools/calendar-tools.ts))
   - Each tool is self-contained
   - Zod schemas ensure type safety
   - Easy to add new tools

4. **Simple Agent** ([src/agents/orchestrator-agent.ts](src/agents/orchestrator-agent.ts))
   - Clear instructions guide behavior
   - Tools are declaratively added
   - No complex state management

## Extending This Setup

### Add More Agents

1. Create new agent file in `src/agents/`
2. Register in `src/mastra.ts`:

```typescript
export const mastra = new Mastra({
  agents: {
    orchestrator: orchestratorAgent,
    specialist: specialistAgent, // New agent
  },
  // ...
});
```

### Add More Tools

1. Create tool in `src/tools/`
2. Import and add to agent's tools:

```typescript
tools: {
  createCalendarEvent: createCalendarEventTool,
  myNewTool: myNewTool,
},
```

### Convert to MCP Server

Mastra agents can be exposed as MCP servers. Add to [src/mastra.ts](src/mastra.ts):

```typescript
import { createServer } from '@mastra/mcp';

const server = createServer({
  mastra,
  serverName: 'productivity-agent',
});
```

Then use Mastra's MCP commands to start the server.

### Add Persistence

Replace in-memory storage:

```typescript
// In src/mastra.ts
storage: new LibSQLStore({
  url: 'file:./mastra.db', // File-based SQLite
}),

// In src/memory/calendar-store.ts
// Replace with database queries or use Mastra's Memory system
```

### Add Agent Reflection

Create a reflection workflow that analyzes agent performance:

```typescript
// src/workflows/reflection-workflow.ts
export const reflectionWorkflow = createWorkflow({
  name: 'reflection',
  // Analyze tool usage, response quality, etc.
});
```

### Add Observability

Already enabled! View traces:

```bash
npm run mastra:dev
```

Then navigate to the Mastra UI to see agent execution traces.

## Troubleshooting

**Error: GEMINI_API_KEY is required**
- Make sure you created a `.env` file
- Add your API key: `GEMINI_API_KEY=your_key_here`

**Import errors**
- Run `npm install` to install all dependencies
- Check that you're using Node.js >= 22.13.0

**Agent not using tools**
- Verify tool descriptions are clear
- Check agent instructions guide tool usage
- Review Gemini model's tool-calling capabilities

## License

ISC
