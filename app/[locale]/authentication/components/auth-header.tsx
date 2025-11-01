"use client"

import * as React from "react"

interface AuthHeaderProps {
  isRegisterMode?: boolean
}

export function AuthHeader({ isRegisterMode = false }: AuthHeaderProps) {
  return (
    <div className="flex flex-col space-y-2 text-center px-2">
      <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {isRegisterMode ? "Create an account" : "Sign in to your account"}
      </h1>
      <p className="text-xs text-muted-foreground sm:text-sm">
        {isRegisterMode 
          ? "Enter your email and password to create your account"
          : "Enter your email and password to sign in"}
      </p>
    </div>
  )
}

