# Quick Start: Google Calendar Integration

## Setup (5 minutes)

### 1. Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:5173/auth/callback`
4. Copy Client ID and Client Secret

### 2. Configure Environment

**Create `web/.env`:**
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Update root `.env`:**
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

### 3. Start Application

```bash
# Terminal 1: Backend
pnpm dev

# Terminal 2: Frontend  
cd web
pnpm dev
```

### 4. Connect Calendar

1. Open http://localhost:5173
2. Click "Sign in with Google"
3. Authorize access
4. Done! Your events now show up

## Features

✅ **OAuth 2.0 Sign-in** - Secure Google authentication
✅ **Real Calendar Events** - Fetches from your Google Calendar
✅ **Auto-sync** - Updates when auth state changes
✅ **Connect/Disconnect** - Easy account management
✅ **Fallback** - Uses local calendar if not connected

## Architecture

```
User clicks "Sign in"
    ↓
Google OAuth consent
    ↓
Redirect to /auth/callback?code=...
    ↓
Exchange code for token (backend)
    ↓
Store token in localStorage
    ↓
Fetch events from Google Calendar API
    ↓
Display in MeetingsCard
```

## Files Created

- `utils/googleAuth.ts` - OAuth config and helpers
- `utils/googleCalendarService.ts` - Calendar API integration
- `components/GoogleCalendarAuth.tsx` - Auth UI component
- `components/AuthCallback.tsx` - OAuth callback handler
- `server/api.ts` - Updated with `/api/auth/google/callback`

## Security

- Client Secret never exposed to frontend
- Token exchange on backend only
- Access tokens in localStorage (client-side)
- Tokens expire after 1 hour

## Need Help?

See [GOOGLE_CALENDAR_SETUP.md](./GOOGLE_CALENDAR_SETUP.md) for detailed setup instructions.
