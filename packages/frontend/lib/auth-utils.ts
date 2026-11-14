/**
 * Utility functions for authentication token and user persistence.
 * All functions are safe to call during server rendering (they no-op).
 */

import type { AuthUser } from "./types";

export const AUTH_TOKEN_KEY = "auth_token";
export const AUTH_USER_KEY = "user";

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    // Access to localStorage can throw (e.g. disabled storage, privacy mode).
    return null;
  }
}

/** Returns the stored authentication token, or null. */
export const getAuthToken = (): string | null => {
  return getStorage()?.getItem(AUTH_TOKEN_KEY) ?? null;
};

export const setAuthToken = (token: string): void => {
  getStorage()?.setItem(AUTH_TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  getStorage()?.removeItem(AUTH_TOKEN_KEY);
};

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return typeof candidate.id === "string" && typeof candidate.email === "string";
}

/** Returns the stored user, or null if missing or malformed. */
export const getUserFromStorage = (): AuthUser | null => {
  const raw = getStorage()?.getItem(AUTH_USER_KEY);
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isAuthUser(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const setUserInStorage = (user: AuthUser): void => {
  getStorage()?.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const removeUserFromStorage = (): void => {
  getStorage()?.removeItem(AUTH_USER_KEY);
};

/** True when a token is stored (it may still be expired server-side). */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/** Removes both the token and the stored user. */
export const clearAuthData = (): void => {
  removeAuthToken();
  removeUserFromStorage();
};

/**
 * Builds JSON request headers, adding `Authorization: Bearer <token>` when a
 * token is passed explicitly or stored.
 */
export const getAuthHeaders = (
  additionalHeaders: Record<string, string> = {},
  token: string | null = getAuthToken(),
): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...additionalHeaders,
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};
