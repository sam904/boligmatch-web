// src/lib/cookies.ts

/**
 * Set a cookie with expiration
 * @param name - Cookie name
 * @param value - Cookie value
 * @param days - Number of days until expiration
 */
export const setCookie = (name: string, value: string, days: number): void => {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

/**
 * Get a cookie value by name
 * @param name - Cookie name
 * @returns Cookie value or undefined if not found
 */
export const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  
  return undefined;
};

/**
 * Delete a cookie by setting it to expire immediately
 * @param name - Cookie name
 */
export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

