# MCP Server Configuration Guide

## 🔌 Your Agent is Now an MCP Server!

Your productivity agent is exposed as a Model Context Protocol server that can be used with:
- **Claude Desktop** (Anthropic)
- **Cline** (VS Code extension)
- **Any MCP-compatible client**

---

## 🚀 Quick Start

### 1. Start the MCP Server

```bash
npm run mcp
```

The server will start and expose:
- ✅ **3 Tools** (create events, list events, ask agent)
- ✅ **1 Resource** (calendar events)
- ✅ **3 Prompts** (schedule meeting, view schedule, focus time)

---

## 🔧 Claude Desktop Setup

### Step 1: Locate Claude Config

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Add Your Server

Copy the content from [mcp-config.json](mcp-config.json) and merge it into your Claude config:

```json
{
  "mcpServers": {
    "productivity-agent": {
      "command": "node",
      "args": [
        "--experimental-strip-types",
        "--no-warnings",
        "D:\\code\\bmw-agent\\src\\server\\mcp.ts"
      ],
      "env": {
        "GEMINI_API_KEY": "your_actual_api_key_here"
      }
    }
  }
}
```

**Important:** 
- Replace the path with your actual project path
- Replace `your_actual_api_key_here` with your real Gemini API key

### Step 3: Restart Claude Desktop

Close and reopen Claude Desktop. You should see:
- 🔌 MCP connection indicator
- 🔧 Tools available in the interface

---

## 🛠️ Cline (VS Code) Setup

### Step 1: Install Cline Extension

Install from VS Code marketplace: `Cline`

### Step 2: Configure MCP Server

1. Open VS Code Settings (JSON)
2. Add to `cline.mcpServers`:

```json
{
  "cline.mcpServers": {
    "productivity-agent": {
      "command": "node",
      "args": [
        "--experimental-strip-types",
        "--no-warnings",
        "D:\\code\\bmw-agent\\src\\server\\mcp.ts"
      ],
      "env": {
        "GEMINI_API_KEY": "your_actual_api_key_here"
      }
    }
  }
}
```

### Step 3: Restart VS Code

Reload window or restart VS Code.

---

## 📋 Available Features

### Tools (Callable Functions)

**1. `create-calendar-event`**
- Creates a new calendar event
- Inputs: title, startTime, endTime (ISO 8601 format)
- Returns: event details and success status

**2. `list-calendar-events`**
- Lists all calendar events
- No inputs required
- Returns: array of all events

**3. `ask-productivity-agent`**
- Ask the agent any scheduling/productivity question
- Input: natural language query
- Returns: intelligent agent response with tool execution

### Resources (Read-Only Data)

**`calendar://events`**
- JSON representation of all calendar events
- Can be read by MCP clients
- Updates automatically as events are created

### Prompts (Templates)

**1. `schedule-meeting`**
- Quick template for scheduling meetings
- Arguments: title, time, duration

**2. `view-schedule`**
- Quick access to view all events

**3. `schedule-focus-time`**
- Template for blocking focus time
- Arguments: when, duration

---

## 💬 Example Usage in Claude

Once configured, you can:

```
You: "Can you check my calendar?"

Claude uses: list-calendar-events tool
Claude responds with your events

---

You: "Schedule a team standup tomorrow at 9am for 30 minutes"

Claude uses: create-calendar-event tool
Claude confirms event created

---

You: "What do I have scheduled this week?"

Claude uses: ask-productivity-agent tool
Agent analyzes and responds
```

---

## 🔍 Testing the MCP Server

### Test Locally

Run the server directly:
```bash
npm run mcp
```

You should see:
```
🚀 Starting MCP Server: productivity-agent
📋 Tools available:
   - create-calendar-event
   - list-calendar-events
   - ask-productivity-agent
📦 Resources available:
   - calendar://events
💡 Prompts available:
   - schedule-meeting
   - view-schedule
   - schedule-focus-time
```

### Test with MCP Inspector

Install MCP Inspector:
```bash
npx @modelcontextprotocol/inspector node --experimental-strip-types --no-warnings src/server/mcp.ts
```

This opens a web interface to test your MCP server.

---

## 🏗️ Architecture

```
┌──────────────────┐
│  Claude Desktop  │ ← MCP Client
│   or Cline       │
└────────┬─────────┘
         │ MCP Protocol (stdio)
         ↓
┌──────────────────┐
│   MCP Server     │ ← src/server/mcp.ts
│  (@mastra/mcp)   │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ Orchestrator     │ ← Your Mastra agent
│     Agent        │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   Gemini API     │ ← LLM Provider
└──────────────────┘
```

---

## 🆚 MCP vs REST API

You now have **BOTH** integration methods:

| Feature | MCP Server | REST API |
|---------|-----------|----------|
| **Use Case** | Claude Desktop, Cline | Web/mobile apps |
| **Protocol** | stdio, MCP | HTTP, JSON |
| **File** | `src/server/mcp.ts` | `src/server/api.ts` |
| **Run Command** | `npm run mcp` | `npm run server` |
| **Client** | Claude, Cline | Browser, React, etc. |

**Use MCP for:** AI assistants (Claude, Cline)
**Use REST API for:** Web apps, mobile apps, custom frontends

---

## 🔐 Security Notes

**Environment Variables:**
- MCP config includes your API key
- Make sure Claude Desktop config file is secure
- Never commit `claude_desktop_config.json` to git

**Local Access Only:**
- MCP servers run locally
- No network exposure
- Safe for development

---

## 🐛 Troubleshooting

**Claude shows no MCP connection:**
- Check path in config is correct (absolute path)
- Verify Gemini API key is set
- Restart Claude Desktop completely
- Check Claude logs: `%APPDATA%\Claude\logs` (Windows)

**"Cannot find module" errors:**
- Run `npm install` in project directory
- Verify Node.js version >= 20
- Check path uses forward slashes on macOS/Linux

**Tools not appearing:**
- Wait 30 seconds after Claude starts
- Check MCP indicator in Claude interface
- Try disconnecting/reconnecting in Claude settings

**Agent not responding:**
- Verify `.env` has `GEMINI_API_KEY`
- Test with `npm run dev` first
- Check Claude logs for errors

---

## 🎯 Next Steps

1. **Start MCP server**: `npm run mcp` (test it works)
2. **Configure Claude Desktop** (add to config)
3. **Restart Claude Desktop**
4. **Test in Claude**: "List my calendar events"
5. **Build more tools** as needed!

---

## 📚 Resources

- **MCP Specification**: https://modelcontextprotocol.io
- **Mastra MCP Docs**: https://mastra.dev/docs/mcp
- **Claude Desktop**: https://claude.ai/download
- **MCP Inspector**: https://github.com/modelcontextprotocol/inspector

---

## ✅ You're Ready!

Your agent is now:
- ✅ Accessible via MCP protocol
- ✅ Compatible with Claude Desktop
- ✅ Compatible with Cline
- ✅ Exposing tools, resources, and prompts
- ✅ Still has REST API for web use

**Test it in Claude Desktop now!** 🚀
