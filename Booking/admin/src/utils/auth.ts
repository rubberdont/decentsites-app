// ============================================================================
// Admin Portal Authentication Utilities
// ============================================================================

const TOKEN_KEY = 'admin_token';

/**
 * Get the stored authentication token from localStorage
 * Returns null if running on server or token doesn't exist
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Store the authentication token in localStorage
 * No-op if running on server
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove the authentication token from localStorage
 * No-op if running on server
 */
export function removeToken(): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Check if user is authenticated (has a valid token)
 * Returns false if running on server
 */
export function isAuthenticated(): boolean {
  return !!getToken();
}

/**
 * Parse JWT token payload (without verification)
 * Used for reading token expiration or user info
 */
export function parseToken(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if the current token is expired
 * Returns true if expired or invalid
 */
export function isTokenExpired(): boolean {
  const token = getToken();
  if (!token) return true;
  
  const payload = parseToken(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  
  // Token expiration is in seconds, Date.now() is in milliseconds
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  
  // Add 60 second buffer to account for clock skew
  return currentTime >= expirationTime - 60000;
}

/**
 * Get user ID from token if available
 */
export function getUserIdFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  
  const payload = parseToken(token);
  if (!payload) return null;
  
  return (payload.sub as string) || (payload.user_id as string) || null;
}
