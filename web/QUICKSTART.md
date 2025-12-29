# 🚀 Quick Start Guide - React Frontend

Get the BMW AI Productivity Agent frontend up and running in minutes!

## Prerequisites

1. **Backend Server Must Be Running**
   
   Make sure your backend API server is running on port 3000:
   
   ```bash
   # From the root directory (d:\code\bmw-agent)
   pnpm dev
   ```
   
   You should see:
   ```
   Server running on http://localhost:3000
   ```

2. **Dependencies Installed**
   
   If you haven't already:
   
   ```bash
   cd web
   pnpm install
   ```

## Starting the Frontend

### Option 1: Run Dev Server (Recommended for Development)

```bash
cd web
pnpm dev
```

The frontend will start at: **http://localhost:5173**

### Option 2: Build and Preview

```bash
cd web
pnpm build
pnpm preview
```

## Using the Application

1. Open your browser to **http://localhost:5173**

2. You'll see the chat interface with a welcome message

3. Try the example prompts or type your own:
   - "Schedule a team meeting tomorrow at 3pm for 1 hour"
   - "Block off time for deep work tomorrow morning"
   - "Create a 2-hour coding session after lunch"
   - "List all my calendar events"

## Project Structure

```
web/
├── src/
│   ├── components/          # React components
│   │   ├── ChatMessage.tsx  # Message display
│   │   └── EventsList.tsx   # Calendar events
│   ├── App.tsx             # Main app component
│   ├── types.ts            # TypeScript types
│   └── main.tsx            # Entry point
├── public/                 # Static assets
└── vite.config.ts          # Vite configuration
```

## Troubleshooting

### "Failed to connect to agent"

- Ensure the backend server is running on port 3000
- Check that you started it with `pnpm dev` from the root directory

### Port 5173 is already in use

Run on a different port:
```bash
pnpm dev -- --port 5174
```

### Build errors

Clean and reinstall:
```bash
rm -rf node_modules dist
pnpm install
pnpm build
```

## Development Tips

- **Hot Module Replacement (HMR)**: Edit any file and see changes instantly
- **TypeScript**: All components are type-safe
- **Proxy**: API calls to `/api` are automatically proxied to `http://localhost:3000`

## Next Steps

- Customize the UI in [src/App.css](src/App.css)
- Add new components in [src/components/](src/components/)
- Modify API integration in [src/App.tsx](src/App.tsx)
- Update types in [src/types.ts](src/types.ts)

## Commands Reference

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Run ESLint |

---

**Need help?** Check the full [README.md](README.md) for more details.
