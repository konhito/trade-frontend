"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Clock,
  ArrowLeftRight,
  Lightbulb,
  Calendar,
  Bot,
  Hammer,
  Handshake,
  GraduationCap,
  Moon,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";

const navigationItems = [
  { name: "Dashboard", icon: Clock, active: true },
  { name: "Trades", icon: ArrowLeftRight, active: false },
  { name: "Strategies", icon: Lightbulb, active: false },
  { name: "Calendar", icon: Calendar, active: false },
  { name: "AI Summarizer", icon: Bot, active: false },
  { name: "Trade Journal 2026", icon: FileSpreadsheet, active: false },
  { name: "Tools", icon: Hammer, active: false },
  { name: "Affiliate", icon: Handshake, active: false },
  { name: "Tutorials", icon: GraduationCap, active: false },
];

export function TradeDiarySidebar() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <div className="w-64 h-screen bg-slate-800 flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">TJ</span>
          </div>
          <span className="text-white text-xl font-semibold">
            Trade Journal
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <Button
              key={index}
              variant={item.active ? "default" : "ghost"}
              className={`w-full justify-start text-left h-12 px-4 ${
                item.active
                  ? "bg-slate-700 text-white hover:bg-slate-600"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.name}</span>
            </Button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-700">
        <Button
          variant="ghost"
          className="w-full text-slate-300 hover:text-white hover:bg-slate-700 text-sm"
        >
          MORE VIDEOS
        </Button>
      </div>
    </div>
  );
}

export function TradeDiaryHeader() {
  return (
    <div className="h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6">
      {/* Left side - could be empty or have breadcrumbs */}
      <div></div>

      {/* Right side - Dark mode toggle and user profile */}
      <div className="flex items-center space-x-4">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <Moon className="w-5 h-5" />
        </Button>

        {/* User Profile */}
        <div className="flex items-center space-x-2 text-white">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">UT</span>
          </div>
          <span className="text-sm font-medium">UnU tech</span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
