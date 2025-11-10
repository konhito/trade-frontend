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
import { motion } from 'framer-motion'
import Navbar from '@/app/(landing)/components/navbar'
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
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const onChange = (key: keyof typeof form, value: string) => setForm(prev => ({ ...prev, [key]: value }))

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate required fields
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields')
      return
    }
    
    // Construct email body with all form values
    const emailBody = `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
    
    // Encode the subject and body for mailto URL
    const subject = encodeURIComponent(form.subject || 'Contact Form Message')
    const body = encodeURIComponent(emailBody)
    
    // Create mailto link
    const mailtoLink = `mailto:MyTradeJournal99@gmail.com?subject=${subject}&body=${body}`
    
    // Open email client
    window.location.href = mailtoLink
    
    // Show success message
    toast.success('Opening your email client...')
    
    // Clear form after a short delay
    setTimeout(() => {
      setForm({ name: '', email: '', subject: '', message: '' })
    }, 500)
  }

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'Get detailed responses within 24 hours',
      value: 'MyTradeJournal99@gmail.com',
      href: 'mailto:MyTradeJournal99@gmail.com',
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
      icon: Send,
      title: 'Telegram',
      description: 'Connect with us on Telegram',
      value: 't.me/DECAYHUNTERS',
      href: 'https://t.me/DECAYHUNTERS',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12 sm:pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're here to help! Reach out to us through any of the channels below.
          </p>
        </motion.div>

        {/* Contact Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
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
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="block"
              >
                <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer h-full ${method.bgColor}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${method.color} bg-white dark:bg-gray-800`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {method.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {method.description}
                    </p>
                    <p className={`text-sm font-medium ${method.color}`}>
                      {method.value}
                    </p>
                  </CardContent>
                </Card>
              </motion.a>
            )
          })}
        </div>

        {/* Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-foreground">
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name" className="text-foreground">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={(e) => onChange('name', e.target.value)}
                      className="mt-2 bg-background border-input text-foreground"
                      placeholder="Your full name"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-foreground">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => onChange('email', e.target.value)}
                      className="mt-2 bg-background border-input text-foreground"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-foreground">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      type="text"
                      value={form.subject}
                      onChange={(e) => onChange('subject', e.target.value)}
                      className="mt-2 bg-background border-input text-foreground"
                      placeholder="What's this about?"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-foreground">
                      Message <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => onChange('message', e.target.value)}
                      className="mt-2 bg-background border-input text-foreground"
                      placeholder="Tell us how we can help..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    size="lg"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">Within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">WhatsApp/Telegram</p>
                      <p className="text-sm text-muted-foreground">Usually within a few hours</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">Phone</p>
                      <p className="text-sm text-muted-foreground">Business hours (9 AM - 6 PM IST)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Why Contact Us?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                    <span className="text-sm text-muted-foreground">Technical support</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="text-sm text-muted-foreground">Feature requests</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-green-500 mr-2" />
                    <span className="text-sm text-muted-foreground">Account assistance</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-purple-500 mr-2" />
                    <span className="text-sm text-muted-foreground">Partnership inquiries</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 text-red-500 mr-2" />
                    <span className="text-sm text-muted-foreground">General feedback</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}




