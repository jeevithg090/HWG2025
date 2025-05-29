"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { getUserFromStorage, setUserInStorage, removeUserFromStorage, clearAuthData } from "./auth-utils"

export type UserRole = "freelancer" | "client" | "startup"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatar?: string
  company?: string
  verified: boolean
  joinedAt: string
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  isClient: boolean
  isFreelancer: boolean
  isStartup: boolean
  logout: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Get user data from auth context instead of using mock data
  useEffect(() => {
    // Using getUserFromStorage from auth-utils
    const userData = getUserFromStorage();
    if (userData) {
      try {
        // Transform backend user format to our User interface if needed
        const transformedUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.type?.toLowerCase() as UserRole,
          avatar: userData.avatar || undefined,
          company: userData.company || undefined,
          verified: userData.active || false,
          joinedAt: userData.createdAt || new Date().toISOString(),
        };
        setUser(transformedUser);
      } catch (e) {
        console.error('Failed to parse stored user data', e);
      }
    } else {
      // Default to null - user needs to sign up/sign in
      setUser(null)
    }
  }, [])

  const isClient = user?.role === "client"
  const isFreelancer = user?.role === "freelancer"
  const isStartup = user?.role === "startup"

  const saveUser = (userData: User | null) => {
    setUser(userData)
    if (userData) {
      setUserInStorage(userData)
    } else {
      removeUserFromStorage()
    }
  }

  const logout = () => {
    setUser(null)
    clearAuthData() // Clears both user data and auth token
  }

  return (
    <UserContext.Provider
      value={{
        user,
        setUser: saveUser,
        isClient,
        isFreelancer,
        isStartup,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
