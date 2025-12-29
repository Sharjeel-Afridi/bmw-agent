# MCP Server - Quick Setup

## ✅ MCP Server is Ready!

Your agent is now exposed via Model Context Protocol and can be used with Claude Desktop, Cline, and other MCP clients.

## 🚀 Start the MCP Server

```bash
npm run mcp
```

You should see:
```
🚀 Starting MCP Server: productivity-agent
📋 Exposing all agents, tools, and workflows from Mastra
```

The server runs in stdio mode (waiting for input). Press Ctrl+C to stop.

## 🔧 Claude Desktop Setup

### 1. Find your Claude config file

- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### 2. Add this configuration

```json
{
  "mcpServers": {
    "productivity-agent": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "D:\\code\\bmw-agent",
      "env": {
        "GEMINI_API_KEY": "your_gemini_api_key_here"
      }
    }
  }
}
```

**Important**: 
- Replace `D:\\code\\bmw-agent` with your actual project path
- Replace `your_gemini_api_key_here` with your Gemini API key

### 3. Restart Claude Desktop

Quit and restart Claude Desktop completely.

### 4. Verify

Look for the MCP server icon in Claude Desktop's bottom-right corner. You should see:
- `createCalendarEvent` tool
- `listCalendarEvents` tool  
- `ask_orchestrator` agent

## 💬 Using the Agent

Ask Claude to use your agent:

```
"Use the orchestrator to schedule a meeting tomorrow at 2pm"
"Create a calendar event for lunch on Friday"
"List all my calendar events"
```

## 🔍 Troubleshooting

**Server won't start?**
- Check `.env` has `GEMINI_API_KEY`
- Run `npm install`

**Claude can't connect?**
- Verify the path in config is correct
- Restart Claude Desktop
- Check Claude Desktop logs

**Tools not showing?**
- Click the MCP icon in Claude Desktop
- Restart Claude after config changes

## 📚 Resources

- [Model Context Protocol](https://spec.modelcontextprotocol.io/)
- [Mastra MCP Docs](https://mastra.ai/docs/mcp)
