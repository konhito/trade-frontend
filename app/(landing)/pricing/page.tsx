'use client'
import React from 'react'
import PricingPlans from '@/components/pricing-plans'
import { Check, Shield, Zap, BarChart3, Users, TrendingUp, Clock, FileText, Database, ArrowRight, Calendar } from 'lucide-react'

export default function PricingPage() {
  return (
    <div>
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">Pricing Plans</h1>
        <p className="text-xl text-center text-gray-600 dark:text-gray-400 mb-12">Choose the plan that works best for you</p>

        <PricingPlans />
      </main>

      {/* Statistics Section */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Traders Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-sm text-muted-foreground">Active Traders</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500K+</div>
              <div className="text-sm text-muted-foreground">Trades Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Succeed</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">Comprehensive trade analysis with detailed performance metrics and insights.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Trade Import</h3>
                <p className="text-muted-foreground">Import trades from multiple platforms including Tradovate, ATAS, and more.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">AI Summarizer</h3>
                <p className="text-muted-foreground">Get intelligent insights and summaries powered by advanced AI technology.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Trade Calendar</h3>
                <p className="text-muted-foreground">Visualize your trading activity with an intuitive calendar interface.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Unlimited Storage</h3>
                <p className="text-muted-foreground">Store unlimited trades and data with no restrictions.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Strategy Tracking</h3>
                <p className="text-muted-foreground">Track and analyze your trading strategies for better performance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <Shield className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">Your data is encrypted and stored securely. We never share your information.</p>
              </div>
              <div>
                <Clock className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Cancel Anytime</h3>
                <p className="text-sm text-muted-foreground">No long-term contracts. Cancel your subscription anytime with no questions asked.</p>
              </div>
              <div>
                <Users className="h-10 w-10 text-primary mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Trusted by Traders</h3>
                <p className="text-sm text-muted-foreground">Join thousands of successful traders who rely on our platform daily.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <details className="border-b pb-4">
              <summary className="font-semibold cursor-pointer hover:text-primary transition-colors">What payment methods do you accept?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through Stripe.</p>
            </details>
            <details className="border-b pb-4">
              <summary className="font-semibold cursor-pointer hover:text-primary transition-colors">Can I change my plan later?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.</p>
            </details>
            <details className="border-b pb-4">
              <summary className="font-semibold cursor-pointer hover:text-primary transition-colors">What happens if I cancel my subscription?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">You'll retain access to all features until the end of your current billing period. After that, you'll be moved to the free plan and can access basic features.</p>
            </details>
            <details className="border-b pb-4">
              <summary className="font-semibold cursor-pointer hover:text-primary transition-colors">Do you offer refunds?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.</p>
            </details>
            <details className="border-b pb-4">
              <summary className="font-semibold cursor-pointer hover:text-primary transition-colors">What platforms can I import trades from?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">We support imports from Tradovate, ATAS, TradingView, MT4, MT5, and many other popular trading platforms. You can also manually enter trades.</p>
            </details>
            <details className="border-b pb-4">
              <summary className="font-semibold cursor-pointer hover:text-primary transition-colors">Is my data safe and secure?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Absolutely. We use industry-standard encryption, secure servers, and regular backups. Your data is never shared with third parties.</p>
            </details>
            <details className="border-b pb-4">
              <summary className="font-semibold cursor-pointer hover:text-primary transition-colors">Can I use this on multiple devices?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Yes! Access your trading journal from any device - desktop, tablet, or mobile. Your data syncs automatically across all devices.</p>
            </details>
            <details className="border-b pb-4">
              <summary className="font-semibold cursor-pointer hover:text-primary transition-colors">What's the difference between Basic and Plus plans?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">The Basic plan includes essential features for tracking trades. Plus plan adds unlimited storage, advanced analytics, AI summarizer, strategy tracking, and priority support.</p>
            </details>
            <details className="border-b pb-4">
              <summary className="font-semibold cursor-pointer hover:text-primary transition-colors">Do you offer discounts for annual plans?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Yes! Our yearly plan saves you up to 50% compared to monthly billing. We also offer special lifetime access options.</p>
            </details>
            <details className="border-b pb-4">
              <summary className="font-semibold cursor-pointer hover:text-primary transition-colors">How do I get started?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Simply sign up for a free account and start tracking your trades immediately. Upgrade to Plus anytime to unlock advanced features.</p>
            </details>
          </div>
        </div>
      </section>
    </div>
  )
}