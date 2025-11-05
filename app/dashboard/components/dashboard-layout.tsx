'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from '@/context/theme-provider'
import { useAuth } from '@/context/auth-provider'
import { 
  Clock, 
  ArrowLeftRight, 
  Lightbulb, 
  Calendar, 
  Bot, 
  Hammer, 
  Handshake,
  LogOut,
  User,
  ChevronLeft,
  ChevronRight,
  Menu,
  Settings
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatAvatarUrl, getUserInitials } from "@/lib/user-utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { effectiveTheme } = useTheme()
  const { isAuthenticated, isLoading, user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [activeItem, setActiveItem] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true) // Default to collapsed
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Redirect to signin if not authenticated (but wait if we have a fresh OAuth token)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const isFreshOAuthToken = typeof window !== 'undefined' ? localStorage.getItem('oauth_token_fresh') === 'true' : false
      
      // If we have a fresh OAuth token, wait a bit longer before redirecting
      if (token && isFreshOAuthToken) {
        console.log('[DashboardLayout] Waiting for OAuth token validation before redirecting...')
        const timeout = setTimeout(() => {
          // Only redirect if still not authenticated after waiting
          if (!isAuthenticated) {
            console.log('[DashboardLayout] OAuth token validation timeout, redirecting to signin')
            const signInUrl = `/signin?next=${encodeURIComponent(pathname || '/dashboard')}`
            router.replace(signInUrl)
          }
        }, 3000) // Wait 3 seconds for validation
        
        return () => clearTimeout(timeout)
      } else {
        // No token or not fresh - redirect immediately
        const signInUrl = `/signin?next=${encodeURIComponent(pathname || '/dashboard')}`
        router.replace(signInUrl)
      }
    }
  }, [isAuthenticated, isLoading, router, pathname])

  const navigationItems = [
    { name: 'Dashboard', icon: Clock, id: 'dashboard', path: '/dashboard' },
    { name: 'Trades', icon: ArrowLeftRight, id: 'trades', path: '/dashboard/trades' },
    { name: 'Strategies', icon: Lightbulb, id: 'strategies', path: '/dashboard/strategies' },
    { name: 'Calendar', icon: Calendar, id: 'calendar', path: '/dashboard/calendar' },
    { name: 'AI Summarizer', icon: Bot, id: 'ai', path: '/dashboard/ai-summarizer' },
    { name: 'Tools', icon: Hammer, id: 'tools', path: '/dashboard/tools' },
    { name: 'Profile', icon: User, id: 'profile', path: '/dashboard/profile' },
    { name: 'Contact Us', icon: Handshake, id: 'contact', path: '/contact' },
  ]

  // Set active item based on current pathname
  useEffect(() => {
    const currentItem = navigationItems.find(item => {
      if (item.path === '/dashboard') {
        return pathname === '/dashboard'
      }
        return pathname === item.path
    })
    
    if (currentItem) {
      setActiveItem(currentItem.id)
    }
  }, [pathname])

  const handleItemClick = (item: any) => {
    setActiveItem(item.id)
    if (item.path) {
      router.push(item.path)
    }
    setSidebarOpen(false) // Close mobile sidebar after navigation
  }

  // Prefetch route on hover for instant navigation
  const handleItemHover = (item: any) => {
    if (item.path) {
      router.prefetch(item.path)
    }
  }

  // Retry validation if we have a token but aren't authenticated yet (OAuth callback case)
  useEffect(() => {
    if (!isAuthenticated && !isLoading && typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      const isFreshOAuthToken = localStorage.getItem('oauth_token_fresh') === 'true'
      
      if (token && isFreshOAuthToken) {
        console.log('[DashboardLayout] Token exists but not authenticated - retrying validation')
        // Trigger validation by dispatching event
        window.dispatchEvent(new Event('auth-token-stored'))
      }
    }
  }, [isAuthenticated, isLoading])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen bg-background text-foreground items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated (redirect will happen)
  // But wait a bit longer if we have a fresh OAuth token
  if (!isAuthenticated) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const isFreshOAuthToken = typeof window !== 'undefined' ? localStorage.getItem('oauth_token_fresh') === 'true' : false
    
    // If we have a fresh OAuth token, show loading instead of redirecting immediately
    if (token && isFreshOAuthToken) {
      return (
        <div className="flex h-screen bg-background text-foreground items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">Signing you in...</p>
          </div>
        </div>
      )
    }
    
    return null
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={(e) => {
            // Don't close if clicking on dropdown menu
            const target = e.target as HTMLElement
            if (target.closest('[role="menu"]') || target.closest('[data-radix-portal]')) {
              return
            }
            setSidebarOpen(false)
          }}
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${sidebarCollapsed ? 'md:w-16' : 'md:w-64'} w-64 overflow-hidden`}>
        <div 
          className={`h-screen flex flex-col border-r border-sidebar-border/50 transition-all duration-300 backdrop-blur-xl ${sidebarCollapsed ? 'md:w-16 w-64' : 'w-64'}`} 
          style={{ 
            backgroundColor: effectiveTheme === 'dark' 
              ? 'rgba(15, 23, 42, 0.85)' 
              : 'rgba(255, 255, 255, 0.85)', 
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          {/* Logo Section */}
          <div className={`border-b border-sidebar-border ${sidebarCollapsed ? 'md:p-2' : 'p-4 md:p-6'}`}>
            <div 
              className={`flex items-center cursor-pointer ${sidebarCollapsed ? 'md:justify-center' : 'space-x-2'}`}
              onClick={() => router.push('/')}
            >
              <Logo className="fill-white flex-shrink-0 h-7 w-7 md:h-8 md:w-8" />
              {/* Mobile: Always show title */}
              <h1 className="text-base md:text-xl font-bold text-white whitespace-nowrap overflow-hidden md:hidden">My Trade Journal</h1>
              {/* Desktop: Show title only when not collapsed */}
              {!sidebarCollapsed && (
                <h1 className="hidden md:block text-xl font-bold text-white whitespace-nowrap overflow-hidden">My Trade Journal</h1>
              )}
            </div>
          </div>

          {/* Toggle Button - Desktop Only */}
          <div className={`hidden md:flex border-b border-sidebar-border ${sidebarCollapsed ? 'justify-center p-2' : 'justify-end p-2'}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 p-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${sidebarCollapsed ? 'md:p-2' : 'p-4'} space-y-2`}>
            {navigationItems.map((item, index) => {
              const Icon = item.icon
              const isActive = activeItem === item.id
              return (
                <Button
                  key={index}
                  variant="ghost"
                  onMouseEnter={() => handleItemHover(item)}
                  className={`w-full h-12 min-w-0 ${
                    sidebarCollapsed 
                      ? 'md:justify-center md:px-0 justify-start px-4' 
                      : 'justify-start px-4'
                  } ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                  onClick={() => handleItemClick(item)}
                  title={sidebarCollapsed ? item.name : undefined}
                >
                  <Icon className="flex-shrink-0 w-5 h-5" />
                  {/* Mobile: Always show text */}
                  <span className="font-medium ml-3 whitespace-nowrap truncate md:hidden">{item.name}</span>
                  {/* Desktop: Show text only when not collapsed */}
                  {!sidebarCollapsed && (
                    <span className="hidden md:inline font-medium ml-3 whitespace-nowrap truncate">{item.name}</span>
                  )}
                </Button>
              )
            })}
          </nav>

          {/* User Info and Dropdown Menu */}
          <div className={`border-t border-sidebar-border ${sidebarCollapsed ? 'md:p-2' : 'p-3 md:p-4'}`}>
            <DropdownMenu onOpenChange={(open) => {
              // On mobile, close sidebar when dropdown opens
              if (open && isMobile) {
                // Delay closing to allow dropdown to render
                setTimeout(() => setSidebarOpen(false), 100)
              }
            }}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full h-auto p-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
                    sidebarCollapsed 
                      ? 'md:justify-center md:px-0 justify-start px-0' 
                      : 'justify-start px-0'
                  }`}
                >
                  {/* Mobile: Always show full user info */}
                  <div className="flex items-center space-x-3 w-full p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors md:hidden">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={formatAvatarUrl(user?.avatar || null)} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 overflow-hidden text-left">
                      <p className="text-sm font-medium text-sidebar-foreground truncate">
                        {user?.firstName || user?.lastName 
                          ? [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email 
                          : user?.email || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">Trading Dashboard</p>
                    </div>
                  </div>
                  {/* Desktop: Show based on collapsed state */}
                  {!sidebarCollapsed ? (
                    <div className="hidden md:flex items-center space-x-3 w-full p-2 rounded-md hover:bg-sidebar-accent/50 transition-colors">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src={formatAvatarUrl(user?.avatar || null)} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 overflow-hidden text-left">
                        <p className="text-sm font-medium text-sidebar-foreground truncate">
                          {user?.firstName || user?.lastName 
                            ? [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email 
                            : user?.email || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">Trading Dashboard</p>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:flex md:justify-center md:items-center md:p-2 md:rounded-md md:hover:bg-sidebar-accent/50 md:transition-colors">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={formatAvatarUrl(user?.avatar || null)} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {getUserInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align={isMobile ? "start" : (sidebarCollapsed ? "start" : "end")} 
                side={isMobile ? "right" : (sidebarCollapsed ? "right" : "top")}
                className="w-56 bg-popover border-border text-popover-foreground"
                style={{ zIndex: 9999 }}
                onCloseAutoFocus={(e) => {
                  // Prevent focus trap on mobile
                  if (isMobile) {
                    e.preventDefault()
                  }
                }}
                onClick={(e) => {
                  // Prevent click from closing sidebar overlay
                  e.stopPropagation()
                }}
              >
                <DropdownMenuLabel className="text-foreground">
                  {user?.firstName || user?.lastName 
                    ? [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email 
                    : user?.email || 'User Account'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={() => {
                    router.push('/dashboard/profile')
                    setSidebarOpen(false)
                  }}
                  className="cursor-pointer text-foreground hover:bg-accent focus:bg-accent"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    router.push('/dashboard/settings')
                    setSidebarOpen(false)
                  }}
                  className="cursor-pointer text-foreground hover:bg-accent focus:bg-accent"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  onClick={() => {
                    logout()
                    setSidebarOpen(false)
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header with Menu Button */}
        <div className="md:hidden bg-card border-b border-border p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-foreground"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">My Trade Journal</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </div>

        {/* Desktop Header with Toggle */}
        <div className="hidden md:flex items-center bg-card border-b border-border p-4">
          {sidebarCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(false)}
              className="text-foreground mr-2"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <h1 className="text-lg font-semibold text-foreground">My Trade Journal</h1>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
