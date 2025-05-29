"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

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

  // Mock user data - in real app, this would come from authentication
  useEffect(() => {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem("techcollab_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    } else {
      // Default to null - user needs to sign up/sign in
      setUser(null)
    }
  }, [])

  const isClient = user?.role === "client"
  const isFreelancer = user?.role === "freelancer"
  const isStartup = user?.role === "startup"

  const saveUser = (userData: User) => {
    setUser(userData)
    localStorage.setItem("techcollab_user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("techcollab_user")
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
