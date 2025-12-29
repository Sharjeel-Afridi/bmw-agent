import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { exchangeCodeForToken } from '../utils/googleCalendarService';
import { setAccessToken, setRefreshToken } from '../utils/googleAuth';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');

      if (errorParam) {
        setStatus('error');
        setError('Authorization was denied');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }

      if (!code) {
        setStatus('error');
        setError('No authorization code received');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        return;
      }

      try {
        const tokens = await exchangeCodeForToken(code);
        setAccessToken(tokens.access_token);
        if (tokens.refresh_token) {
          setRefreshToken(tokens.refresh_token);
        }
        setStatus('success');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } catch (err) {
        console.error('Token exchange error:', err);
        setStatus('error');
        const errorMessage = err instanceof Error ? err.message : 'Failed to complete authorization';
        setError(errorMessage);
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connecting to Google Calendar...
            </h2>
            <p className="text-gray-600 text-sm">
              Please wait while we complete the authorization
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Successfully Connected!
            </h2>
            <p className="text-gray-600 text-sm">
              Redirecting you back to the dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <p className="text-gray-500 text-xs">
              Redirecting you back to the dashboard...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
