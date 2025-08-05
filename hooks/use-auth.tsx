"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  username: string
  avatar_url?: string
  title?: string
  company?: string
  location?: string
  bio?: string
  skills?: string[]
  github?: string
  linkedin?: string
  twitter?: string
  website?: string
}

interface AuthContextType {
  user: User | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: { name: string; username: string }) => Promise<void>
  signOut: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
  updateAvatar: (file: File) => Promise<void>
  isAuthenticated: boolean
  showAuthModal: boolean
  setShowAuthModal: (show: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    // Check if user is already signed in
    const savedUser = localStorage.getItem("devconnect_current_user")
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setIsAuthenticated(true)
      setShowAuthModal(false)
    } else {
      // Show auth modal if no user is signed in
      setShowAuthModal(true)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Check if user exists
    const existingUsers = JSON.parse(localStorage.getItem("devconnect_users") || "{}")
    const userKey = email.toLowerCase()

    if (existingUsers[userKey]) {
      const userData = existingUsers[userKey]
      setUser(userData)
      setIsAuthenticated(true)
      setShowAuthModal(false)
      localStorage.setItem("devconnect_current_user", JSON.stringify(userData))
    } else {
      throw new Error("User not found")
    }
  }

  const signUp = async (email: string, password: string, userData: { name: string; username: string }) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: email,
      username: userData.username,
      title: "Developer",
      skills: [],
    }

    // Save user to users database
    const existingUsers = JSON.parse(localStorage.getItem("devconnect_users") || "{}")
    const userKey = email.toLowerCase()
    existingUsers[userKey] = newUser
    localStorage.setItem("devconnect_users", JSON.stringify(existingUsers))

    // Set as current user
    setUser(newUser)
    setIsAuthenticated(true)
    setShowAuthModal(false)
    localStorage.setItem("devconnect_current_user", JSON.stringify(newUser))
  }

  const signOut = () => {
    setUser(null)
    setIsAuthenticated(false)
    setShowAuthModal(true)
    localStorage.removeItem("devconnect_current_user")
  }

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)

    // Update in users database
    const existingUsers = JSON.parse(localStorage.getItem("devconnect_users") || "{}")
    const userKey = user.email.toLowerCase()
    existingUsers[userKey] = updatedUser
    localStorage.setItem("devconnect_users", JSON.stringify(existingUsers))

    // Update current user
    localStorage.setItem("devconnect_current_user", JSON.stringify(updatedUser))
  }

  const updateAvatar = async (file: File) => {
    if (!user) return

    // Simulate file upload
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create a fake URL for the avatar (in real app, this would be uploaded to a service)
    const avatarUrl = `/placeholder.svg?height=100&width=100&text=${user.name.charAt(0)}`

    const updatedUser = { ...user, avatar_url: avatarUrl }
    setUser(updatedUser)

    // Update in users database
    const existingUsers = JSON.parse(localStorage.getItem("devconnect_users") || "{}")
    const userKey = user.email.toLowerCase()
    existingUsers[userKey] = updatedUser
    localStorage.setItem("devconnect_users", JSON.stringify(existingUsers))

    // Update current user
    localStorage.setItem("devconnect_current_user", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updateAvatar,
        isAuthenticated,
        showAuthModal,
        setShowAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
