"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { login, register, signInWithDiscord, signInWithGoogle } from "@/server/auth"
import { z } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { useI18n } from "@/locales/client"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { AuthHeader } from "./auth-header"

const loginFormSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
})

const registerFormSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

type AuthMethod = 'email' | 'discord' | 'google' | null

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [isRegisterMode, setIsRegisterMode] = React.useState<boolean>(false)
    const [authMethod, setAuthMethod] = React.useState<AuthMethod>(null)
    const [nextUrl, setNextUrl] = React.useState<string | null>(null)
    const router = useRouter()
    const t = useI18n()

    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search)
        const next = urlParams.get('next')
        setNextUrl(next)
    }, [])

    const loginForm = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const registerForm = useForm<z.infer<typeof registerFormSchema>>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmitLogin(values: z.infer<typeof loginFormSchema>) {
        setIsLoading(true)
        setAuthMethod('email')
        try {
            await login(values.email, values.password)
            toast({
                title: "Success",
                description: "You have been signed in successfully.",
            })
            router.push(nextUrl || '/en/dashboard')
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Invalid email or password. Please try again.",
                variant: "destructive",
            })
            setAuthMethod(null)
        } finally {
            setIsLoading(false)
        }
    }

    async function onSubmitRegister(values: z.infer<typeof registerFormSchema>) {
        setIsLoading(true)
        setAuthMethod('email')
        try {
            await register(values.email, values.password)
            toast({
                title: "Success",
                description: "Account created successfully. You are now signed in.",
            })
            router.push(nextUrl || '/en/dashboard')
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create account. Please try again.",
                variant: "destructive",
            })
            setAuthMethod(null)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleDiscordSignIn() {
        setIsLoading(true)
        setAuthMethod('discord')
        try {
            await signInWithDiscord(nextUrl)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Discord sign-in is not available yet.",
                variant: "destructive",
            })
            setAuthMethod(null)
            setIsLoading(false)
        }
    }

    async function handleGoogleSignIn() {
        setIsLoading(true)
        setAuthMethod('google')
        try {
            await signInWithGoogle(nextUrl)
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Google sign-in is not available yet.",
                variant: "destructive",
            })
            setAuthMethod(null)
            setIsLoading(false)
        }
    }

    return (
        <>
            <AuthHeader isRegisterMode={isRegisterMode} />
            <div className={cn("grid gap-6", className)} {...props}>
                {!isRegisterMode ? (
                <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onSubmitLogin)}>
                        <div className="grid gap-4">
                            <FormField
                                control={loginForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="name@example.com"
                                                autoCapitalize="none"
                                                autoComplete="email"
                                                autoCorrect="off"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={loginForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button disabled={isLoading} type="submit" className="w-full">
                                {isLoading && authMethod === 'email' ? (
                                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Sign In
                            </Button>
                        </div>
                    </form>
                    <div className="text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <button
                            type="button"
                            onClick={() => setIsRegisterMode(true)}
                            className="text-primary hover:underline"
                            disabled={isLoading}
                        >
                            Sign up
                        </button>
                    </div>
                </Form>
            ) : (
                <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onSubmitRegister)}>
                        <div className="grid gap-4">
                            <FormField
                                control={registerForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="email"
                                                placeholder="name@example.com"
                                                autoCapitalize="none"
                                                autoComplete="email"
                                                autoCorrect="off"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={registerForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="At least 8 characters"
                                                autoComplete="new-password"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={registerForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="Confirm your password"
                                                autoComplete="new-password"
                                                disabled={isLoading}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button disabled={isLoading} type="submit" className="w-full">
                                {isLoading && authMethod === 'email' ? (
                                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Create Account
                            </Button>
                        </div>
                    </form>
                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => setIsRegisterMode(false)}
                            className="text-primary hover:underline"
                            disabled={isLoading}
                        >
                            Sign in
                        </button>
                    </div>
                </Form>
            )}

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        Or continue with
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading || authMethod !== null}
                    className="w-full"
                >
                    {authMethod === 'google' ? (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Icons.google className="mr-2 h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Google</span>
                    <span className="sm:hidden">Continue with Google</span>
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleDiscordSignIn}
                    disabled={isLoading || authMethod !== null}
                    className="w-full"
                >
                    {authMethod === 'discord' ? (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Icons.discord className="mr-2 h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Discord</span>
                    <span className="sm:hidden">Continue with Discord</span>
                </Button>
            </div>
        </div>
        </>
    )
}
