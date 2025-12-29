# Google Calendar OAuth Setup Guide

This guide will help you set up Google Calendar integration for your AI Productivity Agent.

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Name it something like "AI Productivity Agent"

## Step 2: Enable Google Calendar API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google Calendar API"
3. Click on it and press **Enable**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: **AI Productivity Agent**
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Add scopes: Skip for now (we'll add them programmatically)
   - Test users: Add your email
   - Click **Save and Continue**

4. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: **AI Productivity Agent Web Client**
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production URL (when deploying)
   - Authorized redirect URIs:
     - `http://localhost:5173/auth/callback` (for development)
     - Your production callback URL (when deploying)
   - Click **Create**

5. Copy the **Client ID** and **Client Secret**

## Step 4: Configure Environment Variables

### Frontend (.env in web/ folder)

Create `web/.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

### Backend (.env in root folder)

Update your root `.env` file:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

## Step 5: Install Dependencies (if needed)

The project already has all necessary dependencies installed.

## Step 6: Start the Application

### Terminal 1: Start Backend
```bash
pnpm dev
```

### Terminal 2: Start Frontend
```bash
cd web
pnpm dev
```

## Step 7: Connect Your Calendar

1. Open http://localhost:5173 in your browser
2. You'll see a **"Connect Your Calendar"** card
3. Click **"Sign in with Google"**
4. Authorize the application to access your calendar
5. You'll be redirected back to the dashboard
6. Your Google Calendar events will now be displayed!

## How It Works

### OAuth Flow

1. **User clicks "Sign in with Google"**
   - Redirects to Google's OAuth consent screen
   - User authorizes access to their calendar

2. **Google redirects back with authorization code**
   - URL: `http://localhost:5173/auth/callback?code=...`
   - Frontend captures the code

3. **Exchange code for access token**
   - Frontend sends code to backend: `POST /api/auth/google/callback`
   - Backend exchanges code with Google for access token
   - Returns tokens to frontend

4. **Store tokens**
   - Access token stored in localStorage
   - Used for subsequent API calls

5. **Fetch calendar events**
   - Frontend calls Google Calendar API directly
   - Uses stored access token
   - Displays events in MeetingsCard

### Security Notes

- **Access tokens** are stored in localStorage (client-side)
- **Client Secret** is only on the backend (never exposed to client)
- Token exchange happens on the backend for security
- Consider implementing refresh token logic for production

## Troubleshooting

### "OAuth credentials not configured" error

- Make sure you've added the environment variables
- Restart both backend and frontend servers
- Check that the variables are properly loaded

### "Redirect URI mismatch" error

- Ensure the redirect URI in Google Cloud Console matches exactly:
  - `http://localhost:5173/auth/callback` (no trailing slash)
- Check for http vs https
- Verify the port number

### Events not showing up

- Make sure you have events in your Google Calendar
- Check browser console for errors
- Verify the access token is stored (check localStorage)
- Try disconnecting and reconnecting

### Token expired

- Currently, tokens expire after 1 hour
- You'll need to reconnect when the token expires
- For production, implement refresh token logic

## Production Deployment

When deploying to production:

1. **Update OAuth settings in Google Cloud Console**:
   - Add your production domain to authorized origins
   - Add your production callback URL to redirect URIs

2. **Update environment variables**:
   - Set production URLs in `.env`
   - Keep secrets secure (use environment variable management)

3. **Implement refresh token logic**:
   - Store refresh tokens securely
   - Auto-refresh access tokens when expired
   - Handle token refresh on 401 errors

4. **Security enhancements**:
   - Use HTTPS in production
   - Implement CSRF protection
   - Consider server-side token storage
   - Add rate limiting

## Features

✅ **OAuth 2.0 Authentication** - Secure Google sign-in
✅ **Calendar Access** - Read and view your events
✅ **Real-time Sync** - Fetches latest events from Google
✅ **Upcoming Meetings** - Shows next meetings with timeline
✅ **Connect/Disconnect** - Easy account management
✅ **Fallback Support** - Falls back to local calendar if Google unavailable

## API Scopes Used

- `https://www.googleapis.com/auth/calendar.readonly` - Read calendar events
- `https://www.googleapis.com/auth/calendar.events` - Manage calendar events

## Next Steps

- [ ] Implement refresh token rotation
- [ ] Add webhook support for real-time updates
- [ ] Support multiple calendars
- [ ] Add event creation via AI agent
- [ ] Implement calendar event modification
- [ ] Add calendar sharing features

---

**Need help?** Check the [Google Calendar API documentation](https://developers.google.com/calendar/api/guides/overview) for more details.
