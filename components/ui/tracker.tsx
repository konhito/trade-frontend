"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface TrackerProps {
  data: Array<{ value: number; label: string; color: string }>
  hoverEffect?: boolean
  onSelectionChange?: (index: number) => void
  className?: string
}

export function Tracker({ 
  data, 
  hoverEffect = false, 
  onSelectionChange,
  className 
}: TrackerProps) {
  return (
    <div className={cn("flex items-center gap-1 w-full", className)}>
      {data.map((item, index) => (
        <button
          key={index}
          className={cn(
            "flex-1 h-2 rounded-full transition-all duration-200",
            hoverEffect && "hover:scale-110",
            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          )}
          style={{ backgroundColor: item.color }}
          onClick={() => onSelectionChange?.(index)}
          title={item.label}
        />
      ))}
    </div>
  )
}
