'use client'

import React from 'react'
import Link from 'next/link'
import { Calendar, Clock, Zap, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Logo } from '@/components/logo'

export default function AdminComingSoonPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Logo className="h-12 w-12 fill-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Admin Panel
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-2">
            Coming Soon
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're building powerful administrative tools to help manage and analyze your trading platform.
            Stay tuned for updates!
          </p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">User Management</h3>
              </div>
              <p className="text-muted-foreground">
                Comprehensive user administration and analytics dashboard
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">System Analytics</h3>
              </div>
              <p className="text-muted-foreground">
                Real-time platform metrics and performance monitoring
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Content Management</h3>
              </div>
              <p className="text-muted-foreground">
                Streamlined tools for managing platform content and features
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Advanced Controls</h3>
              </div>
              <p className="text-muted-foreground">
                Fine-grained configuration and control over platform settings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="inline-flex flex-col sm:flex-row gap-4 items-center">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              asChild
            >
              <a href="https://www.mytradejournal.co.in" target="_blank" rel="noopener noreferrer">
                Visit Main Site
              </a>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              asChild
            >
              <a href="https://www.mytradejournal.co.in/signin" target="_blank" rel="noopener noreferrer">
                Sign In
              </a>
            </Button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            For questions or access requests, please contact support
          </p>
        </div>
      </div>
    </div>
  )
}

