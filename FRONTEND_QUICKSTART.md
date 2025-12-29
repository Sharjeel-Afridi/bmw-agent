# 🌐 Frontend Integration - Quick Reference

## ✅ Setup Complete!

Your agent now has:
1. ✅ REST API server with Express
2. ✅ Demo HTML frontend
3. ✅ React component example
4. ✅ CORS enabled
5. ✅ Streaming support

---

## 🚀 How to Run

### Start the API Server
```bash
npm run server
```

Server will start on: **http://localhost:3000**

### Test It

**Option 1: Use the Demo HTML**
Open your browser to: http://localhost:3000

**Option 2: Use cURL**
```bash
curl -X POST http://localhost:3000/api/agent/query \
  -H "Content-Type: application/json" \
  -d '{"message":"Schedule a meeting at 3pm"}'
```

**Option 3: Browser Console**
```javascript
fetch('http://localhost:3000/api/agent/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Schedule a meeting at 3pm' })
})
.then(r => r.json())
.then(console.log);
```

---

## 📂 New Files Created

| File | Purpose |
|------|---------|
| [src/server/api.ts](src/server/api.ts) | Express API server |
| [src/server/public/index.html](src/server/public/index.html) | Demo frontend UI |
| [examples/react-integration.tsx](examples/react-integration.tsx) | React component example |
| [FRONTEND.md](FRONTEND.md) | Complete integration guide |

---

## 🔌 API Endpoints

### 1. Query Agent
**POST** `/api/agent/query`

Send a message, get a complete response.

```javascript
const response = await fetch('http://localhost:3000/api/agent/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Schedule a meeting at 3pm',
    threadId: 'optional-for-conversations'
  })
});

const data = await response.json();
// {
//   success: true,
//   response: "I've scheduled a meeting...",
//   toolCalls: [...],
//   toolResults: [...]
// }
```

### 2. Stream Agent Response
**POST** `/api/agent/stream`

Get word-by-word streaming (like ChatGPT).

```javascript
const response = await fetch('http://localhost:3000/api/agent/stream', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Schedule a meeting' })
});

// Read SSE stream
const reader = response.body.getReader();
// ... see FRONTEND.md for full example
```

### 3. Get Calendar Events
**GET** `/api/calendar/events`

```javascript
const response = await fetch('http://localhost:3000/api/calendar/events');
const data = await response.json();
// { success: true, count: 2, events: [...] }
```

---

## 🎨 Framework Integration

### React / Next.js

Copy [examples/react-integration.tsx](examples/react-integration.tsx) to your project:

```bash
# In your React/Next.js project
cp examples/react-integration.tsx src/components/ProductivityAgent.tsx
```

Then use it:
```tsx
import ProductivityAgent from '@/components/ProductivityAgent';

export default function Home() {
  return <ProductivityAgent />;
}
```

### Vue.js

```vue
<script setup>
const sendMessage = async (message) => {
  const res = await fetch('http://localhost:3000/api/agent/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  return await res.json();
};
</script>
```

### Vanilla JavaScript

Open [src/server/public/index.html](src/server/public/index.html) - it's a complete working example!

---

## 🏗️ Architecture Flow

```
┌──────────────┐
│   Browser    │ ← Your React/Vue/HTML frontend
│  (Frontend)  │
└──────┬───────┘
       │ HTTP POST
       │ /api/agent/query
       ↓
┌──────────────┐
│  Express API │ ← src/server/api.ts
│  (Port 3000) │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Orchestrator │ ← src/agents/orchestrator-agent.ts
│    Agent     │
└──────┬───────┘
       │
       ↓
┌──────────────┐
│ Gemini 1.5   │ ← Google's LLM
│    Flash     │
└──────────────┘
```

---

## 📱 Example: Simple Chat Interface

```html
<input id="msg" placeholder="Ask me something..." />
<button onclick="send()">Send</button>
<div id="response"></div>

<script>
async function send() {
  const msg = document.getElementById('msg').value;
  const res = await fetch('http://localhost:3000/api/agent/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: msg })
  });
  const data = await res.json();
  document.getElementById('response').textContent = data.response;
}
</script>
```

---

## 🔐 Production Checklist

Before deploying:

- [ ] Set CORS to specific origin (not `*`)
- [ ] Add authentication middleware
- [ ] Add rate limiting
- [ ] Use HTTPS
- [ ] Set proper environment variables
- [ ] Add error logging (Sentry, etc.)
- [ ] Add request validation

See [FRONTEND.md](FRONTEND.md) for detailed examples.

---

## 🚀 Next Steps

1. **Start server**: `npm run server`
2. **Open demo**: http://localhost:3000
3. **Test API** with browser console or cURL
4. **Copy React example** to your project
5. **Build your UI**!

---

## 📚 Full Documentation

- **Complete Guide**: [FRONTEND.md](FRONTEND.md)
- **React Example**: [examples/react-integration.tsx](examples/react-integration.tsx)
- **Demo UI**: [src/server/public/index.html](src/server/public/index.html)
- **API Code**: [src/server/api.ts](src/server/api.ts)

---

## 🎯 Common Use Cases

**Chat Widget**
```javascript
// Embed in any website
const response = await fetch('http://localhost:3000/api/agent/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userInput })
});
```

**Slack Bot**
```javascript
// In Slack webhook handler
app.post('/slack/events', async (req, res) => {
  const message = req.body.event.text;
  const agentResponse = await fetch('http://localhost:3000/api/agent/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  // Send to Slack...
});
```

**Discord Bot**
```javascript
// In Discord message handler
client.on('messageCreate', async message => {
  const response = await fetch('http://localhost:3000/api/agent/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message.content })
  });
  const data = await response.json();
  message.reply(data.response);
});
```

---

## ✅ You're Ready!

Your agent is now fully accessible from any frontend framework! 🎉

**Quick Links:**
- 🖥️ Demo: http://localhost:3000
- 📖 Full Guide: [FRONTEND.md](FRONTEND.md)
- ⚛️ React Example: [examples/react-integration.tsx](examples/react-integration.tsx)
- 🔧 API Code: [src/server/api.ts](src/server/api.ts)
