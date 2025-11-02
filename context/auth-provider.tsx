'use client'

import { createContext, useContext } from 'react'
import { useAuth as useAuthHook } from '@/hooks/use-auth'

interface AuthContextType {
  isLoading: boolean
  isAuthenticated: boolean
  user: { id: number; email: string; name?: string | null } | null
  token: string | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { loading, user, token, logout } = useAuthHook()

  return (
    <AuthContext.Provider
      value={{
        isLoading: loading,
        isAuthenticated: !!user,
        user,
        token,
        logout,
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
