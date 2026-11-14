"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { userApi } from "./api-client";
import {
  clearAuthData,
  getAuthToken,
  getUserFromStorage,
  setAuthToken,
  setUserInStorage,
} from "./auth-utils";
import type { AuthUser, SignupPayload } from "./types";

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (payload: SignupPayload) => Promise<boolean>;
  logout: () => void;
  /** Saves profile changes and refreshes the session user. Returns an error message on failure. */
  updateProfile: (changes: ProfileChanges) => Promise<string | null>;
}

export interface ProfileChanges {
  name?: string;
  bio?: string | null;
  skills?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore the session from storage, then validate it with the user service.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      setUser(getUserFromStorage());

      const result = await userApi.getUserProfile(storedToken);
      if (cancelled) return;

      if (result.success) {
        setUser(result.user);
        setUserInStorage(result.user);
      } else if (result.status === 401) {
        // Token missing, expired or invalid: the session is no longer usable.
        clearAuthData();
        setUser(null);
        setToken(null);
      }
      // Any other failure (network error, 5xx) keeps the cached session so a
      // temporarily unavailable user service does not log people out.
      setIsLoading(false);
    };

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await userApi.login({ email, password });
      if (!result.success || !result.token || !result.user) {
        toast.error(result.success ? "Login failed" : result.message || "Login failed");
        return false;
      }
      setToken(result.token);
      setUser(result.user);
      setAuthToken(result.token);
      setUserInStorage(result.user);
      toast.success("Login successful");
      return true;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (payload: SignupPayload): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await userApi.signup(payload);
      if (!result.success) {
        toast.error(result.message || "Sign up failed");
        return false;
      }
      toast.success("Account created successfully! Please log in.");
      return true;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearAuthData();
    toast.success("Logged out successfully");
  }, []);

  const updateProfile = useCallback(async (changes: ProfileChanges): Promise<string | null> => {
    const result = await userApi.updateProfile(changes);
    if (!result.success) return result.message || "Failed to update profile";
    setUser(result.user);
    setUserInStorage(result.user);
    return null;
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token,
      login,
      signup,
      logout,
      updateProfile,
    }),
    [user, token, isLoading, login, signup, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
