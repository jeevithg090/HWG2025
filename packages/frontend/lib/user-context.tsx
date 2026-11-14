"use client";

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./auth-context";
import type { AuthUser } from "./types";

export type UserRole = "freelancer" | "client" | "startup" | "admin";

/** View model of the signed-in user used by the dashboard UI. */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  bio?: string;
  skills: string[];
  joinedAt?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isClient: boolean;
  isFreelancer: boolean;
  isStartup: boolean;
  /** Clients, startups and admins may post gigs. */
  canPostGigs: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function toDashboardUser(authUser: AuthUser): User {
  const role = (authUser.type?.toLowerCase() || "freelancer") as UserRole;
  return {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    role,
    bio: authUser.bio ?? undefined,
    skills: authUser.skills ?? [],
    joinedAt: authUser.createdAt,
  };
}

/**
 * Derives the dashboard user from the auth session so both always agree
 * (previously this provider read localStorage once and went stale after login).
 */
export function UserProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isLoading, logout } = useAuth();

  const value = useMemo<UserContextType>(() => {
    const user = authUser ? toDashboardUser(authUser) : null;
    const role = user?.role;
    return {
      user,
      isLoading,
      isClient: role === "client",
      isFreelancer: role === "freelancer",
      isStartup: role === "startup",
      canPostGigs: role === "client" || role === "startup" || role === "admin",
      logout,
    };
  }, [authUser, isLoading, logout]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
