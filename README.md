# Personal Productivity Agent

A clean, production-ready AI agent built with Mastra and Google Gemini for hackathon iteration.

## Features

- 🤖 Orchestrator agent powered by Gemini 1.5 Flash
- 📅 Calendar event creation tool
- 💾 In-memory storage (easily upgradeable)
- 🔧 Type-safe with TypeScript
- 📝 Structured logging
- 👁️ Built-in observability

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and add your Gemini API key:

```bash
cp .env.example .env
```

Get your Gemini API key from: https://aistudio.google.com/apikey

Edit `.env` and replace `your_gemini_api_key_here` with your actual key.

### 3. Run the Agent

```bash
npm run dev
```

You should see the agent process the default test prompt and create a calendar event.

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
├── mastra.ts                    # Mastra instance configuration
└── index.ts                     # Entry point & test execution
```

## Usage

### Test the Agent

Modify the `userInput` in [src/index.ts](src/index.ts) to test different prompts:

```typescript
const userInput = "Schedule a 2-hour coding session after lunch tomorrow";
```

### View Calendar Events

All created events are displayed after agent execution.

## Available Scripts

- `npm run dev` - Run the agent with hot reload
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
