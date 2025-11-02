'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, 
  Phone, 
  MessageCircle, 
  Send, 
  Clock, 
  MapPin, 
  Users, 
  Zap,
  Shield,
  TrendingUp,
  CheckCircle,
  Star,
  ArrowRight,
  Globe,
  Heart
} from 'lucide-react'

export default function ContactPage() {

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const onChange = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Message sent successfully!')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Get detailed responses within 24 hours',
      value: 'anubhavsingh290@gmail.com',
      href: 'mailto:anubhavsingh290@gmail.com',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Speak directly with our support team',
      value: '+91 99776 42137',
      href: 'tel:+919977642137',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Quick responses via WhatsApp',
      value: 'wa.me/919977642137',
      href: 'https://wa.me/919977642137',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950'
    },
    {
      icon: Globe,
      title: 'Telegram',
      description: 'Join our community channel',
      value: 't.me/DECAYHUNTERS',
      href: 'https://t.me/DECAYHUNTERS',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    }
  ]

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast Support',
      description: 'Get responses within minutes, not hours'
    },
    {
      icon: Shield,
      title: 'Secure Communication',
      description: 'Your data is protected with enterprise-grade security'
    },
    {
      icon: TrendingUp,
      title: 'Expert Guidance',
      description: 'Get insights from professional traders and analysts'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Join thousands of traders in our growing community'
    }
  ]

  // Stats removed per request

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: isVisible ? 1 : 0.8, opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <Heart className="w-4 h-4" />
              We're here to help
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold text-foreground mb-6"
            >
              Get in <span className="text-primary">Touch</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12"
            >
              Have questions about trading strategies? Need help with your account? 
              Our expert team is ready to assist you 24/7.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Stats Section removed per request */}

      {/* Contact Methods */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Choose Your Preferred Contact Method</h2>
          <p className="text-muted-foreground">Multiple ways to reach us, all designed for your convenience</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactMethods.map((method, index) => {
            const Icon = method.icon
            return (
              <motion.a
                key={method.title}
                href={method.href}
                target={method.href.startsWith('http') ? '_blank' : undefined}
                rel={method.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                className={`group relative p-6 rounded-xl border border-border hover:shadow-xl transition-all duration-300 ${method.bgColor}`}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full bg-white dark:bg-gray-800 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${method.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                  <div className="text-sm font-medium text-primary break-all">{method.value}</div>
                </div>
                <ArrowRight className="absolute top-4 right-4 w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
              </motion.a>
            )
          })}
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="bg-muted/30 py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Our Support?</h2>
            <p className="text-muted-foreground">Experience world-class customer service designed for traders</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                  transition={{ duration: 0.6, delay: 1.0 + index * 0.1 }}
                  className="p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-all duration-300"
                >
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Contact Form */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
        transition={{ duration: 0.8, delay: 1.1 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <Card className="bg-card border-border shadow-xl">
          <CardHeader className="text-center pb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: isVisible ? 1 : 0.8, opacity: isVisible ? 1 : 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <CardTitle className="text-3xl font-bold text-foreground mb-4">
                Send us a Message
              </CardTitle>
              <p className="text-muted-foreground">
                Fill out the form below and we'll get back to you as soon as possible
              </p>
            </motion.div>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                >
                  <Label htmlFor="name" className="text-sm font-medium text-foreground">Full Name</Label>
                  <Input 
                    id="name" 
                    value={form.name} 
                    onChange={e => onChange('name', e.target.value)} 
                    required 
                    className="mt-2 h-12"
                    placeholder="Enter your full name"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                >
                  <Label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={form.email} 
                    onChange={e => onChange('email', e.target.value)} 
                    required 
                    className="mt-2 h-12"
                    placeholder="Enter your email address"
                  />
                </motion.div>
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 1.5 }}
              >
                <Label htmlFor="subject" className="text-sm font-medium text-foreground">Subject</Label>
                <Input 
                  id="subject" 
                  value={form.subject} 
                  onChange={e => onChange('subject', e.target.value)} 
                  className="mt-2 h-12"
                  placeholder="What's this about?"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 1.6 }}
              >
                <Label htmlFor="message" className="text-sm font-medium text-foreground">Message</Label>
                <Textarea 
                  id="message" 
                  rows={6} 
                  value={form.message} 
                  onChange={e => onChange('message', e.target.value)} 
                  required 
                  className="mt-2 resize-none"
                  placeholder="Tell us how we can help you..."
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
                transition={{ duration: 0.6, delay: 1.7 }}
                className="text-center"
              >
                <Button 
                  type="submit" 
                  disabled={loading}
                  size="lg"
                  className="px-8 py-3 text-lg font-medium"
                >
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </motion.div>
                    ) : (
                      <motion.div
                        key="send"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Send Message
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ Section */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
        transition={{ duration: 0.8, delay: 1.8 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Quick answers to common questions</p>
        </div>
        
        <div className="space-y-4">
          {[
            {
              question: "How quickly do you respond to messages?",
              answer: "We typically respond within 2 hours during business hours and within 24 hours for all other inquiries."
            },
            {
              question: "Do you offer phone support?",
              answer: "Yes! You can call us directly at +91 99776 42137 or reach us via WhatsApp for immediate assistance."
            },
            {
              question: "Is my trading data secure?",
              answer: "Absolutely. We use enterprise-grade encryption and security measures to protect all your trading data and personal information."
            },
            {
              question: "Can I get help with trading strategies?",
              answer: "Yes! Our team includes professional traders and analysts who can provide guidance on trading strategies and market analysis."
            }
          ].map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 1.9 + index * 0.1 }}
              className="p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-all duration-300"
            >
              <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
              <p className="text-muted-foreground">{faq.answer}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}


