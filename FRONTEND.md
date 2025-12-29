# Frontend Integration Guide

## 🌐 How to Use the Agent on Frontend

Your Mastra agent can be accessed from any frontend framework through a REST API.

---

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the API Server
```bash
npm run server
```

Server runs on: http://localhost:3000

### 3. Open the Demo Frontend
Open [src/server/public/index.html](src/server/public/index.html) in your browser

Or navigate to: http://localhost:3000 (if serving static files)

---

## 📡 API Endpoints

### POST `/api/agent/query`
Send a message to the agent and get a response.

**Request:**
```json
{
  "message": "Schedule a meeting tomorrow at 3pm",
  "threadId": "optional-conversation-id"
}
```

**Response:**
```json
{
  "success": true,
  "response": "I've scheduled a meeting for tomorrow at 3:00 PM.",
  "toolCalls": [
    {
      "tool": "createCalendarEvent",
      "args": { "title": "Meeting", "startTime": "...", "endTime": "..." }
    }
  ],
  "toolResults": [
    {
      "tool": "createCalendarEvent",
      "result": { "success": true, "eventId": "evt_123" }
    }
  ]
}
```

### POST `/api/agent/stream`
Get streaming responses using Server-Sent Events (SSE).

**Request:** Same as `/api/agent/query`

**Response:** Stream of events
```
data: {"type":"text","content":"I've"}
data: {"type":"text","content":" scheduled"}
data: {"type":"done"}
```

### GET `/api/calendar/events`
Get all calendar events.

**Response:**
```json
{
  "success": true,
  "count": 2,
  "events": [
    {
      "id": "evt_123",
      "title": "Meeting",
      "startTime": "2025-12-30T15:00:00Z",
      "endTime": "2025-12-30T16:00:00Z",
      "createdAt": "2025-12-29T10:00:00Z"
    }
  ]
}
```

---

## 🎨 Frontend Examples

### Vanilla JavaScript (HTML + Fetch)

See [src/server/public/index.html](src/server/public/index.html) for a complete working example.

**Basic Usage:**
```javascript
async function sendMessage(message) {
  const response = await fetch('http://localhost:3000/api/agent/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
  
  const data = await response.json();
  console.log(data.response); // Agent's response
}

sendMessage('Schedule a meeting at 3pm');
```

### React / Next.js

See [examples/react-integration.tsx](examples/react-integration.tsx) for a complete React component.

**Basic Hook:**
```typescript
import { useState } from 'react';

function useAgent() {
  const [loading, setLoading] = useState(false);
  
  const query = async (message: string) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      return await response.json();
    } finally {
      setLoading(false);
    }
  };
  
  return { query, loading };
}
```

### Vue.js

```vue
<script setup>
import { ref } from 'vue';

const message = ref('');
const response = ref('');
const loading = ref(false);

async function sendMessage() {
  loading.value = true;
  try {
    const res = await fetch('http://localhost:3000/api/agent/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: message.value }),
    });
    const data = await res.json();
    response.value = data.response;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div>
    <input v-model="message" @keyup.enter="sendMessage" />
    <button @click="sendMessage" :disabled="loading">Send</button>
    <p>{{ response }}</p>
  </div>
</template>
```

### Svelte

```svelte
<script>
  let message = '';
  let response = '';
  let loading = false;
  
  async function sendMessage() {
    loading = true;
    try {
      const res = await fetch('http://localhost:3000/api/agent/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      response = data.response;
    } finally {
      loading = false;
    }
  }
</script>

<input bind:value={message} on:keyup={e => e.key === 'Enter' && sendMessage()} />
<button on:click={sendMessage} disabled={loading}>Send</button>
<p>{response}</p>
```

---

## 🔄 Streaming Responses

For real-time streaming, use the `/api/agent/stream` endpoint with EventSource:

```javascript
async function streamMessage(message) {
  const response = await fetch('http://localhost:3000/api/agent/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6));
        if (data.type === 'text') {
          console.log(data.content); // Stream each word
        }
      }
    }
  }
}
```

---

## 🏗️ Architecture

```
┌─────────────────┐
│   Frontend      │
│  (React/Vue/    │
│   Vanilla JS)   │
└────────┬────────┘
         │ HTTP/Fetch
         ↓
┌─────────────────┐
│  Express API    │
│  (src/server/   │
│   api.ts)       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Mastra Agent   │
│  (orchestrator) │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Gemini API     │
│  (LLM)          │
└─────────────────┘
```

---

## 🛠️ Production Considerations

### 1. CORS Configuration
Currently allows all origins. For production:

```typescript
// src/server/api.ts
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true,
}));
```

### 2. Authentication
Add auth middleware:

```typescript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.post('/api/agent/query', authMiddleware, async (req, res) => {
  // ... existing code
});
```

### 3. Rate Limiting
```bash
npm install express-rate-limit
```

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. Environment Variables
```env
PORT=3000
GEMINI_API_KEY=your_key
ALLOWED_ORIGINS=https://yourdomain.com
NODE_ENV=production
```

### 5. Error Handling
Add global error handler:

```typescript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
  });
});
```

---

## 🚀 Deployment Options

### Option 1: Vercel (Frontend + API)
1. Add `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/src/server/api" }
  ]
}
```

2. Deploy: `vercel deploy`

### Option 2: Separate Deployments
- **Frontend**: Vercel, Netlify, CloudFlare Pages
- **Backend**: Railway, Render, Fly.io

### Option 3: Docker
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "server"]
```

---

## 📊 Testing the API

### Using cURL
```bash
curl -X POST http://localhost:3000/api/agent/query \
  -H "Content-Type: application/json" \
  -d '{"message":"Schedule a meeting at 3pm"}'
```

### Using Postman
1. Create new POST request
2. URL: `http://localhost:3000/api/agent/query`
3. Body: Raw JSON
```json
{
  "message": "Schedule a meeting at 3pm"
}
```

### Using JavaScript Console
Open browser console on any page:
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

## 🎯 Next Steps

1. **Start the server**: `npm run server`
2. **Test with cURL or Postman**
3. **Open the demo HTML** in your browser
4. **Integrate into your React/Vue/Next.js app**
5. **Customize the UI** to match your design

---

## 📚 Additional Resources

- **Express.js Docs**: https://expressjs.com/
- **CORS**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **Server-Sent Events**: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- **Fetch API**: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

---

## 🐛 Troubleshooting

**CORS errors:**
- Make sure server is running on port 3000
- Check CORS middleware is properly configured
- Use browser DevTools Network tab to inspect requests

**Connection refused:**
- Verify server is running: `npm run server`
- Check port 3000 is not in use
- Try `http://localhost:3000/health` to test

**Agent not responding:**
- Check `.env` has GEMINI_API_KEY
- Look at server console for errors
- Verify agent is properly initialized in mastra.ts

---

## ✅ You're Ready!

Your agent is now accessible from any frontend! 🎉

Start building your UI and integrate the agent seamlessly.
