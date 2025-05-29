/**
 * Utility functions for authentication and token management
 */

import { toast } from 'sonner';

/**
 * Get the authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

/**
 * Set the authentication token in localStorage
 * @param token The token to store
 */
export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

/**
 * Remove the authentication token from localStorage
 */
export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
};

/**
 * Get the user data from localStorage
 * @returns The user data or null if not found
 */
export const getUserFromStorage = (): any | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

/**
 * Set the user data in localStorage
 * @param userData The user data to store
 */
export const setUserInStorage = (userData: any): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(userData));
};

/**
 * Remove the user data from localStorage
 */
export const removeUserFromStorage = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
};

/**
 * Check if the user is authenticated (token exists)
 * @returns True if the user is authenticated, false otherwise
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = (): void => {
  removeAuthToken();
  removeUserFromStorage();
};

/**
 * Get authorization headers with token for API requests
 * @param additionalHeaders Additional headers to include
 * @returns Headers object with Authorization header if token exists
 */
export const getAuthHeaders = (additionalHeaders: Record<string, string> = {}): HeadersInit => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders,
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Centralized error handler for API calls
 * @param error The error that occurred
 * @param fallbackMessage A fallback message to show if the error doesn't have a message
 * @param showToast Whether to show a toast notification (default: true)
 * @returns The error object with a formatted message
 */
export const handleApiError = async (error: any, fallbackMessage: string = 'Something went wrong', showToast: boolean = true): Promise<any> => {
  console.error('API Error:', error);
  
  // Try to extract error message from response
  let message = fallbackMessage;
  let status = error?.status || 500;
  
  // Handle fetch errors
  if (error instanceof Response) {
    try {
      const errorData = await error.json();
      message = errorData.message || fallbackMessage;
      status = error.status;
    } catch (jsonError) {
      message = error.statusText || 'Network error occurred';
    }
  } else if (error.message) {
    message = error.message;
  }
  
  // Show toast notification if requested
  if (showToast) {
    toast.error(message);
  }
  
  return { message, status, error };
};

/**
 * Check if a response is unauthorized (401)
 * @param response The response to check
 * @returns True if the response is unauthorized
 */
export const isUnauthorizedResponse = (response: Response): boolean => {
  return response.status === 401;
};

/**
 * Handle unauthorized response
 * Clears auth data and returns true if handled
 * @param response The response to check
 * @returns True if unauthorized and handled
 */
export const handleUnauthorizedResponse = (response: Response): boolean => {
  if (isUnauthorizedResponse(response)) {
    clearAuthData();
    toast.error('Your session has expired. Please log in again.');
    
    // Redirect to login if in browser environment
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    
    return true;
  }
  
  return false;
};
