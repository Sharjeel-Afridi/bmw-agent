import { Calendar, LogOut, AlertCircle, Settings } from 'lucide-react';
import { getGoogleAuthUrl, isAuthenticated, clearAccessToken, isConfigured } from '../utils/googleAuth';

interface GoogleCalendarAuthProps {
  onAuthChange: () => void;
}

export default function GoogleCalendarAuth({ onAuthChange }: GoogleCalendarAuthProps) {
  const authenticated = isAuthenticated();
  const configured = isConfigured();

  const handleLogin = () => {
    try {
      const authUrl = getGoogleAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to initiate Google sign-in');
    }
  };

  const handleLogout = () => {
    clearAccessToken();
    onAuthChange();
  };

  if (!configured) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="bg-yellow-100 p-3 rounded-lg shrink-0">
            <Settings className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">Google Calendar Setup Required</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>To connect your Google Calendar, you need to configure OAuth credentials:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Get credentials from <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                <li>Create <code className="bg-gray-100 px-1 rounded">web/.env</code> file</li>
                <li>Add: <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_CLIENT_ID=your-client-id</code></li>
                <li>Restart the dev server</li>
              </ol>
              <p className="mt-3">
                <a 
                  href="/GOOGLE_CALENDAR_SETUP.md" 
                  target="_blank" 
                  className="text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  View detailed setup guide →
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authenticated) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-50 p-3 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Google Calendar Connected</h3>
              <p className="text-sm text-gray-500">Your calendar is synced</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-sm border-2 border-dashed border-blue-200">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="bg-white p-4 rounded-full shadow-sm">
          <Calendar className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Connect Your Calendar</h3>
          <p className="text-sm text-gray-600 mb-4">
            Connect your Google Calendar to view and manage your events
          </p>
        </div>
        <button
          onClick={handleLogin}
          className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Sign in with Google
        </button>
        <div className="flex items-start gap-2 text-xs text-gray-500 max-w-md">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            We'll only access your calendar data. You can disconnect at any time.
          </p>
        </div>
      </div>
    </div>
  );
}
