// Google OAuth Configuration
export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirectUri: `${window.location.origin}/auth/callback`,
  scope: [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/calendar.events',
  ].join(' '),
  authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
};

export function isConfigured(): boolean {
  return !!GOOGLE_CONFIG.clientId && GOOGLE_CONFIG.clientId !== '';
}

export function getGoogleAuthUrl(): string {
  if (!isConfigured()) {
    throw new Error('Google OAuth is not configured. Please set VITE_GOOGLE_CLIENT_ID in your .env file.');
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CONFIG.clientId,
    redirect_uri: GOOGLE_CONFIG.redirectUri,
    response_type: 'code',
    scope: GOOGLE_CONFIG.scope,
    access_type: 'offline',
    prompt: 'consent',
  });

  return `${GOOGLE_CONFIG.authUrl}?${params.toString()}`;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('google_access_token');
}

export function getAccessToken(): string | null {
  return localStorage.getItem('google_access_token');
}

export function setAccessToken(token: string): void {
  localStorage.setItem('google_access_token', token);
}

export function clearAccessToken(): void {
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_refresh_token');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('google_refresh_token');
}

export function setRefreshToken(token: string): void {
  localStorage.setItem('google_refresh_token', token);
}
