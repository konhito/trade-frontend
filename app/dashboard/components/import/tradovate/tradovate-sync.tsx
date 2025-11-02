'use client'

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { TradovateCredentialsManager } from './tradovate-credentials-manager'
 

export function TradovateSync() {
  return (
    <div className="flex flex-col space-y-6 p-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-lg font-semibold">Tradovate Sync</h2>
        <p className="text-sm text-muted-foreground">
          Manage your Tradovate accounts and synchronize trading data
        </p>
      </div>
      <TradovateCredentialsManager />
    </div>
  )
} 