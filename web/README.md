# BMW Agent - React Frontend

React TypeScript frontend for the BMW AI Productivity Agent, powered by Mastra & Google Gemini.

## Features

- 💬 **Interactive Chat Interface** - Communicate with the AI agent using natural language
- 📅 **Calendar Management** - Schedule events, meetings, and manage your calendar
- 🔧 **Tool Visibility** - See which tools the agent uses to complete your requests
- ⚡ **Real-time Updates** - Automatically refreshes calendar events when modified
- 🎨 **Modern UI** - Clean, gradient-based design with smooth animations

## Tech Stack

- **React 19** - Latest React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **CSS3** - Modern styling with animations

## Getting Started

### Prerequisites

Make sure the backend API server is running on port 3000:

```bash
# From the root directory
pnpm dev
```

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start the dev server (runs on port 5173 by default)
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Create production build
pnpm build
```

### Preview

```bash
# Preview production build
pnpm preview
```

## Project Structure

```
web/
├── src/
│   ├── components/
│   │   ├── ChatMessage.tsx        # Individual chat message component
│   │   ├── ChatMessage.css
│   │   ├── EventsList.tsx         # Calendar events display
│   │   └── EventsList.css
│   ├── App.tsx                    # Main application component
│   ├── App.css                    # Main application styles
│   ├── main.tsx                   # Application entry point
│   ├── index.css                  # Global styles
│   └── types.ts                   # TypeScript type definitions
├── public/                        # Static assets
├── index.html                     # HTML template
├── vite.config.ts                 # Vite configuration
└── package.json
```

## API Integration

The frontend communicates with the backend API at `http://localhost:3000/api`. The Vite dev server is configured with a proxy to handle API requests seamlessly.

### API Endpoints Used

- `POST /api/agent/query` - Send messages to the AI agent
- `GET /api/calendar/events` - Fetch calendar events

## Usage Examples

Try these commands in the chat:

- "Schedule a team meeting tomorrow at 3pm for 1 hour"
- "Block off time for deep work tomorrow morning"
- "Create a 2-hour coding session after lunch"
- "List all my calendar events"

## Development Notes

- The app uses React hooks (useState, useEffect, useRef) for state management
- TypeScript provides type safety for API responses and component props
- CSS animations provide smooth transitions for messages and UI elements
- The chat automatically scrolls to the latest message
- Loading states are handled with visual feedback

## Configuration

The API URL can be configured in [src/App.tsx](src/App.tsx):

```typescript
const API_URL = '/api'; // Uses Vite proxy in development
```

For production, update this to point to your deployed backend API.
