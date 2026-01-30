/**
 * Get the base URL for API requests.
 * 
 * In development, returns localhost:3000.
 * In production, returns the NEXT_PUBLIC_BASE_URL environment variable with https:// prefix if missing.
 * 
 * @throws {Error} If NEXT_PUBLIC_BASE_URL is not set in production
 * @returns {string} The base URL with protocol
 */
export function getBaseUrl(): string {
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  
  // In production, get from environment variable
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_BASE_URL environment variable is required in production');
  }
  
  // Ensure protocol is included
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    return `https://${baseUrl}`;
  }
  
  return baseUrl;
}
