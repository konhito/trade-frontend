'use client'

import React, { useState, useEffect } from 'react'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Logo } from "@/components/logo"
import { Moon, Sun, Github, FileText, Cpu, Users, Layers, BarChart3, Calendar, BookOpen, Database, LineChart, Menu, Globe, Laptop, User, Settings, LogOut, CreditCard } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { useTheme } from '@/context/theme-provider'
import { useAuth } from '@/context/auth-provider'
import { cn } from '@/lib/utils'
import { formatAvatarUrl, getUserInitials } from '@/lib/user-utils'
import { useRouter, usePathname } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a"> & {
        title: string;
        icon?: React.ReactNode;
    }
>(({ className, title, children, icon, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none flex items-center">
                        {icon}
                        <span className="ml-2">{title}</span>
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground mt-1">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"

const MobileNavItem = ({ href, children, onClick, className }: { href: string; children: React.ReactNode; onClick?: () => void, className?: string }) => (
    <li>
        <Link href={href} className={cn("block py-2 hover:text-primary transition-colors", className)} onClick={onClick}>
            {children}
        </Link>
    </li>
)

// Animation variants for mobile menu
const listVariant = {
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
        },
    },
    hidden: {
        opacity: 0,
    },
}

const itemVariant = {
    hidden: { 
        opacity: 0, 
        y: 20
    },
    show: { 
        opacity: 1, 
        y: 0
    },
}

export default function Component() {
    const { theme, setTheme } = useTheme()
    const { isAuthenticated, isLoading, user, logout } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [hoveredItem, setHoveredItem] = useState<string | null>(null)
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const router = useRouter()
    const pathname = usePathname()

    const toggleMenu = () => {
        setIsOpen(!isOpen)
    }

    const closeMenu = () => {
        setIsOpen(false)
    }

    // Add/remove data attribute when mobile menu visibility changes
    useEffect(() => {
        if (isOpen) {
            document.body.setAttribute('data-mobile-navbar', 'open')
        } else {
            document.body.removeAttribute('data-mobile-navbar')
        }
        
        // Cleanup on unmount
        return () => {
            document.body.removeAttribute('data-mobile-navbar')
        }
    }, [isOpen])

    // Lock/unlock body scroll when mobile menu is open
    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.body.style.overflow = isOpen ? 'hidden' : ''
        }
        
        // Cleanup on unmount
        return () => {
            if (typeof window !== 'undefined') {
                document.body.style.overflow = ''
            }
        }
    }, [isOpen])

    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100

                if (scrollPercent <= 25) {
                    setIsVisible(true)
                } else if (window.scrollY > lastScrollY) {
                    setIsVisible(false)
                } else {
                    setIsVisible(true)
                }

                setLastScrollY(window.scrollY)
            }
        }

        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', controlNavbar)

            return () => {
                window.removeEventListener('scroll', controlNavbar)
            }
        }
    }, [lastScrollY])


    const languages = [
        { value: 'en', label: 'English' },
        { value: 'fr', label: 'Français' },
        // Add more languages here
    ]

    const [themeOpen, setThemeOpen] = useState(false)
    const handleThemeChange = (value: string) => {
        setTheme(value as "light" | "dark" | "system")
        setThemeOpen(false)
    }

    const getThemeIcon = () => {
        if (theme === 'light') return <Sun className="h-5 w-5" />;
        if (theme === 'dark') return <Moon className="h-5 w-5" />;
        // For 'system' theme, we need to check the actual applied theme
        if (typeof window !== 'undefined') {
            const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            return isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />;
        }
        // Fallback to Laptop icon if we can't determine
        return <Laptop className="h-5 w-5" />;
    };

    const links = [
        {
            title: "Features",
            children: [
                {
                    path: "/#data-import",
                    title: "Data Import",
                    icon: <Database className="h-4 w-4" />,
                },
                {
                    path: "/#performance-visualization",
                    title: "Performance Visualization",
                    icon: <LineChart className="h-4 w-4" />,
                },
                {
                    path: "/#daily-performance",
                    title: "Daily Performance",
                    icon: <Calendar className="h-4 w-4" />,
                },
                {
                    path: "/#ai-journaling",
                    title: "AI Journaling",
                    icon: <BookOpen className="h-4 w-4" />,
                },
            ],
        },
        {
            title: "Pricing",
            path: "/pricing",
        },
        
    ]

    return (
        <>
            {/* Desktop hover backdrop */}
            <div className={`fixed inset-0 bg-background/80  backdrop-blur-sm z-40 transition-opacity duration-300 ${hoveredItem ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} />
            
            <span className={`h-14 fixed top-0 left-0 right-0 bg-background z-50 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}></span>
            <header className={`max-w-7xl mx-auto fixed top-0 left-0 right-0 px-4 lg:px-6 h-14 flex items-center justify-between z-50  text-foreground transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}>
                <Link href="/" className="flex items-center space-x-2">
                    <Logo width={64} height={64} />
                    <span className="font-bold text-xl">MyTradeJournal</span>
                </Link>
                <div className="hidden lg:block">
                    <NavigationMenu>
                        <NavigationMenuList className="list-none">
                            <NavigationMenuItem onMouseEnter={() => setHoveredItem('features')} onMouseLeave={() => setHoveredItem(null)}>
                                <NavigationMenuTrigger className='bg-transparent'>Features</NavigationMenuTrigger>
                                <NavigationMenuContent>
                                    <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr] list-none">
                                        <li className="row-span-3">
                                            <NavigationMenuLink asChild>
                                                <Link className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md" href="/">
                                                    <Logo width={48} height={48} />
                                                    <div className="mb-2 mt-4 text-lg font-medium">
                                                        MyTradeJournal
                                                    </div>
                                                    <p className="text-sm leading-tight text-muted-foreground">
                                                        Elevate your trading with AI-powered insights
                                                    </p>
                                                </Link>
                                            </NavigationMenuLink>
                                        </li>
                                        <ListItem href="/#data-import" title="Data Import" icon={<Database className="h-4 w-4" />}>
                                            Import your trading data from various platforms
                                        </ListItem>
                                        <ListItem href="/#performance-visualization" title="Performance Visualization" icon={<LineChart className="h-4 w-4" />}>
                                            Visualize your trading performance with comprehensive charts
                                        </ListItem>
                                        <ListItem href="/#daily-performance" title="Daily Performance" icon={<Calendar className="h-4 w-4" />}>
                                            Track your daily trading results and progress
                                        </ListItem>
                                        <div className='col-span-2'>
                                            <ListItem href="/#ai-journaling" title="AI Journaling" icon={<BookOpen className="h-4 w-4" />}>
                                                Get AI-powered insights and analysis of your trading performance
                                            </ListItem>
                                        </div>
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                            <NavigationMenuItem>
                                <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), 'bg-transparent')} href="/pricing">
                                    Pricing
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                            
                        </NavigationMenuList>
                        <Separator orientation="vertical" className="h-6 mx-4" />
                        {isLoading ? (
                            <Button variant="ghost" className="text-sm font-medium" disabled>
                                Loading...
                            </Button>
                        ) : isAuthenticated && user ? (
                            <Button variant="ghost" className="text-sm font-medium hover:text-accent-foreground" asChild>
                                <Link href={"/dashboard"}>Dashboard</Link>
                            </Button>
                        ) : (
                            <Button variant="ghost" className="text-sm font-medium hover:text-accent-foreground" asChild>
                                <Link href={"/signin"}>Sign In</Link>
                            </Button>
                        )}
                    </NavigationMenu>
                </div>

                <div className="flex items-center space-x-4">
                    <Popover modal>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" className="hidden lg:inline-flex h-9 w-9 px-0">
                                {getThemeIcon()}
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" align="end">
                            <Command>
                                <CommandList>
                                    <CommandGroup>
                                        <CommandItem onSelect={() => handleThemeChange("light")}>
                                            <Sun className="mr-2 h-4 w-4" />
                                            <span>Light</span>
                                        </CommandItem>
                                        <CommandItem onSelect={() => handleThemeChange("dark")}>
                                            <Moon className="mr-2 h-4 w-4" />
                                            <span>Dark</span>
                                        </CommandItem>
                                        <CommandItem onSelect={() => handleThemeChange("system")}>
                                            <Laptop className="mr-2 h-4 w-4" />
                                            <span>System</span>
                                        </CommandItem>
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                    
                    {/* Profile Dropdown - Only show if authenticated */}
                    {isAuthenticated && user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="hidden lg:inline-flex h-9 w-9 px-0 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={formatAvatarUrl(user?.avatar || null)} />
                                        <AvatarFallback className="uppercase text-xs bg-primary text-primary-foreground">
                                            {getUserInitials(user)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="sr-only">Open user menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    {user?.firstName || user?.lastName 
                                      ? [user?.firstName, user?.lastName].filter(Boolean).join(' ') 
                                      : 'My Account'}
                                </DropdownMenuLabel>
                                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                    {user?.email}
                                </div>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard" className="flex items-center w-full">
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/profile" className="flex items-center w-full">
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings" className="flex items-center w-full">
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/billing" className="flex items-center w-full">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        <span>Billing</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={() => {
                                        logout()
                                        router.push('/')
                                    }}
                                    className="flex items-center text-destructive focus:text-destructive cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    
                    <button
                        type="button"
                        className="ml-auto lg:hidden p-2"
                        onClick={toggleMenu}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={18}
                            height={13}
                            fill="none"
                        >
                            <path
                                fill="currentColor"
                                d="M0 12.195v-2.007h18v2.007H0Zm0-5.017V5.172h18v2.006H0Zm0-5.016V.155h18v2.007H0Z"
                            />
                        </svg>
                    </button>
                </div>
            </header>

            {isOpen && (
                <motion.div
                    className="fixed bg-background -top-[2px] right-0 left-0 bottom-0 h-screen z-50 px-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ 
                        duration: 0.3,
                        ease: "easeOut"
                    }}
                >
                    <motion.div 
                        className="mt-4 flex justify-between p-3 px-4 relative ml-[1px]"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                            duration: 0.3,
                            ease: "easeOut",
                            delay: 0.1
                        }}
                    >
                        <motion.button 
                            type="button" 
                            onClick={closeMenu}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                        >
                            <span className="sr-only">MyTradeJournal Logo</span>
                            <Logo width={64} height={64} />
                        </motion.button>

                        <motion.button
                            type="button"
                            className="ml-auto lg:hidden p-2 absolute right-[10px] top-2"
                            onClick={closeMenu}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={24}
                                height={24}
                                className="fill-primary"
                            >
                                <path fill="none" d="M0 0h24v24H0V0z" />
                                <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                            </svg>
                        </motion.button>
                    </motion.div>

                    <div className="h-screen pb-[150px] overflow-auto">
                        <motion.ul
                            initial="hidden"
                            animate="show"
                            className="px-3 pt-8 text-xl text-[#878787] space-y-8 mb-8 overflow-auto"
                            variants={listVariant}
                        >
                            {links.map(({ path, title, children }, index) => {
                                const isActive = path === "/updates" ? pathname.includes("updates") : path === pathname;

                                if (path) {
                                    return (
                                        <motion.li variants={itemVariant} key={path}>
                                            <motion.div
                                                whileHover={{ x: 4 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <Link
                                                    href={path}
                                                    className={cn(isActive && "text-primary", "block")}
                                                    onClick={closeMenu}
                                                >
                                                    {title}
                                                </Link>
                                            </motion.div>
                                        </motion.li>
                                    );
                                }

                                return (
                                    <motion.li key={title} variants={itemVariant}>
                                        <Accordion collapsible type="single">
                                            <AccordionItem value={`item-${index}`} className="border-none">
                                                <AccordionTrigger className="flex items-center justify-between w-full font-normal p-0 hover:no-underline">
                                                    <span className="text-[#878787]">{title}</span>
                                                </AccordionTrigger>

                                                {children && (
                                                    <AccordionContent className="text-xl">
                                                        <motion.ul 
                                                            className="space-y-8 ml-4 mt-6"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            {children.map((child, childIndex) => {
                                                                return (
                                                                    <motion.li 
                                                                        key={child.path}
                                                                        initial={{ opacity: 0, x: -10 }}
                                                                        animate={{ opacity: 1, x: 0 }}
                                                                        transition={{ 
                                                                            duration: 0.2,
                                                                            delay: childIndex * 0.05
                                                                        }}
                                                                    >
                                                                        <motion.div
                                                                            whileHover={{ x: 4 }}
                                                                            transition={{ duration: 0.2 }}
                                                                        >
                                                                            <Link
                                                                                onClick={closeMenu}
                                                                                href={child.path}
                                                                                className="text-[#878787] flex items-center space-x-2"
                                                                            >
                                                                                <span>{child.icon}</span>
                                                                                <span>{child.title}</span>
                                                                            </Link>
                                                                        </motion.div>
                                                                    </motion.li>
                                                                );
                                                            })}
                                                        </motion.ul>
                                                    </AccordionContent>
                                                )}
                                            </AccordionItem>
                                        </Accordion>
                                    </motion.li>
                                );
                            })}

                            {/* Profile Section - Only show if authenticated */}
                            {isAuthenticated && user && (
                                <motion.li
                                    className="mt-auto border-t-[1px] pt-8"
                                    variants={itemVariant}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-3 px-2">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={formatAvatarUrl(user?.avatar || null)} />
                                                <AvatarFallback className="uppercase text-sm bg-primary text-primary-foreground">
                                                    {getUserInitials(user)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-foreground truncate">
                                                    {user?.firstName || user?.lastName 
                                                      ? [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email 
                                                      : user?.email || 'User'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Link
                                                className="block text-lg text-foreground hover:text-primary transition-colors"
                                                href="/dashboard"
                                                onClick={closeMenu}
                                            >
                                                Dashboard
                                            </Link>
                                            <Link
                                                className="block text-lg text-foreground hover:text-primary transition-colors"
                                                href="/dashboard/profile"
                                                onClick={closeMenu}
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                className="block text-lg text-foreground hover:text-primary transition-colors"
                                                href="/dashboard/settings"
                                                onClick={closeMenu}
                                            >
                                                Settings
                                            </Link>
                                            <Link
                                                className="block text-lg text-foreground hover:text-primary transition-colors"
                                                href="/dashboard/billing"
                                                onClick={closeMenu}
                                            >
                                                Billing
                                            </Link>
                                            <button
                                                className="block text-lg text-destructive hover:text-destructive/80 transition-colors w-full text-left"
                                                onClick={() => {
                                                    logout()
                                                    closeMenu()
                                                    router.push('/')
                                                }}
                                            >
                                                Log Out
                                            </button>
                                        </div>
                                    </div>
                                </motion.li>
                            )}
                            
                            {/* Sign In link - Only show if not authenticated */}
                            {!isAuthenticated && (
                                <motion.li
                                    className="mt-auto border-t-[1px] pt-8"
                                    variants={itemVariant}
                                >
                                    {isLoading ? (
                                        <span className="text-xl text-muted-foreground">Loading...</span>
                                    ) : (
                                        <Link
                                            className="text-xl text-primary"
                                            href="/signin"
                                            onClick={closeMenu}
                                        >
                                            Sign In
                                        </Link>
                                    )}
                                </motion.li>
                            )}

                            <motion.li variants={itemVariant}>
                                <motion.div 
                                    className="py-4 border-t"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                        duration: 0.3,
                                        ease: "easeOut",
                                        delay: 0.2
                                    }}
                                >
                                    <Accordion collapsible type="single">
                                        <AccordionItem value="theme" className="border-none">
                                            <AccordionTrigger className="flex items-center justify-between w-full font-normal p-0 hover:no-underline">
                                                <span className="text-[#878787] flex items-center space-x-2">
                                                    <div className="flex items-center justify-center w-5 h-5">
                                                        <AnimatePresence mode="wait">
                                                            <motion.div
                                                                key={theme}
                                                                initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
                                                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                                                exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
                                                                transition={{ 
                                                                    duration: 0.4,
                                                                    ease: "easeInOut"
                                                                }}
                                                                className="flex items-center justify-center"
                                                            >
                                                                {getThemeIcon()}
                                                            </motion.div>
                                                        </AnimatePresence>
                                                    </div>
                                                    <span>Change Theme</span>
                                                </span>
                                            </AccordionTrigger>
                                            <AccordionContent className="text-xl">
                                                <motion.ul 
                                                    className="space-y-8 ml-4 mt-6"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <motion.li 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2, delay: 0.05 }}
                                                    >
                                                        <motion.div
                                                            whileHover={{ x: 4 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <button
                                                                onClick={() => handleThemeChange("light")}
                                                                className={`flex items-center space-x-2 w-full text-left ${
                                                                    theme === 'light' ? 'text-primary' : 'text-[#878787]'
                                                                }`}
                                                            >
                                                                <Sun className="h-4 w-4" />
                                                                <span>Light</span>
                                                                {theme === 'light' && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="ml-auto"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </motion.div>
                                                                )}
                                                            </button>
                                                        </motion.div>
                                                    </motion.li>
                                                    <motion.li 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2, delay: 0.1 }}
                                                    >
                                                        <motion.div
                                                            whileHover={{ x: 4 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <button
                                                                onClick={() => handleThemeChange("dark")}
                                                                className={`flex items-center space-x-2 w-full text-left ${
                                                                    theme === 'dark' ? 'text-primary' : 'text-[#878787]'
                                                                }`}
                                                            >
                                                                <Moon className="h-4 w-4" />
                                                                <span>Dark</span>
                                                                {theme === 'dark' && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="ml-auto"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </motion.div>
                                                                )}
                                                            </button>
                                                        </motion.div>
                                                    </motion.li>
                                                    <motion.li 
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ duration: 0.2, delay: 0.15 }}
                                                    >
                                                        <motion.div
                                                            whileHover={{ x: 4 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <button
                                                                onClick={() => handleThemeChange("system")}
                                                                className={`flex items-center space-x-2 w-full text-left ${
                                                                    theme === 'system' ? 'text-primary' : 'text-[#878787]'
                                                                }`}
                                                            >
                                                                <Laptop className="h-4 w-4" />
                                                                <span>System</span>
                                                                {theme === 'system' && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="ml-auto"
                                                                    >
                                                                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </motion.div>
                                                                )}
                                                            </button>
                                                        </motion.div>
                                                    </motion.li>
                                                </motion.ul>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
                                </motion.div>
                            </motion.li>
                        </motion.ul>
                    </div>
                </motion.div>
            )}

            {/* Mobile navbar overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-background z-40" />
            )}
        </>
    )
}