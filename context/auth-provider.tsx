'use client'

import { createContext, useContext } from 'react'
import { useAuth as useAuthHook } from '@/hooks/use-auth'

interface AuthContextType {
  isLoading: boolean
  isAuthenticated: boolean
  user: { 
    id: number
    email: string
    name?: string | null
    firstName?: string | null
    lastName?: string | null
    avatar?: string | null
    createdAt?: string
  } | null
  token: string | null
  logout: () => void
  login: (email: string, password: string) => Promise<{ 
    id: number
    email: string
    name?: string | null
    firstName?: string | null
    lastName?: string | null
    avatar?: string | null
    createdAt?: string
  }>
  register: (email: string, password: string, name?: string) => Promise<{ 
    id: number
    email: string
    name?: string | null
    firstName?: string | null
    lastName?: string | null
    avatar?: string | null
    createdAt?: string
  }>
  error: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loading, user, token, logout, login, register, error, isAuthenticated } = useAuthHook()

  return (
    <AuthContext.Provider
      value={{
        isLoading: loading,
        isAuthenticated,
        user,
        token,
        logout,
        login,
        register,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
