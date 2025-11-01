'use client'

import { TooltipProvider } from "@/components/ui/tooltip"
import { ReactNode } from "react"

interface DashboardTooltipWrapperProps {
  children: ReactNode
}

export function DashboardTooltipWrapper({ children }: DashboardTooltipWrapperProps) {
  return <TooltipProvider>{children}</TooltipProvider>
}


