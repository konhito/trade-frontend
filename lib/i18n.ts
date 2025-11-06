'use client'

import React from 'react'

// Translations dictionary
const translations: Record<string, string> = {
  // Pricing - Basic Plan
  'pricing.basic.name': 'Basic Plan',
  'pricing.basic.description': 'Perfect for getting started with trade tracking',
  'pricing.basic.feature1': 'Unlimited trade entries',
  'pricing.basic.feature2': 'Basic trade analytics',
  'pricing.basic.feature3': 'Trade calendar view',
  'pricing.basic.feature4': 'Export trade data',
  'pricing.basic.feature5': 'Community support',
  
  // Pricing - Free
  'pricing.free.name': 'Free',
  
  // Pricing - Plus Plan
  'pricing.plus.name': 'Plus Plan',
  'pricing.plus.description': 'Advanced features for serious traders',
  'pricing.plus.feature1': 'Everything in Basic',
  'pricing.plus.feature2': 'Advanced analytics & insights',
  'pricing.plus.feature4': 'AI-powered trade summaries',
  'pricing.plus.feature6': 'Priority support',
  
  // Pricing - Billing
  'pricing.monthly': 'Monthly',
  'pricing.quarterly': 'Quarterly',
  'pricing.yearly': 'Yearly',
  'pricing.monthlyFlexibility': 'Maximum flexibility, cancel anytime',
  'pricing.lifetimeAccess': 'Lifetime Access',
  'pricing.new': 'NEW',
  'pricing.fullVersion': 'Full Version',
  'pricing.billingPeriod': 'Choose billing period',
  'pricing.month': 'month',
  'pricing.billedYearly': 'Billed yearly',
  'pricing.billedQuarterly': 'Billed quarterly',
  'pricing.trialPeriod': 'Start Free Trial',
  'pricing.upgradeToLifetime': 'Upgrade to Lifetime',
  'pricing.lifetimeDisclaimer1': 'One-time payment for lifetime access',
  'pricing.lifetimeDisclaimer2': 'Includes all current and future features',
  'pricing.lifetimeUpgrade.title': 'Upgrade to Lifetime Access',
  'pricing.lifetimeUpgrade.description': 'Are you sure you want to upgrade to lifetime access?',
  'pricing.lifetimeUpgrade.warning': 'This will cancel your current subscription',
  'pricing.lifetimeUpgrade.warningPoints.currentPlan': 'Your current subscription will be cancelled',
  'pricing.lifetimeUpgrade.warningPoints.immediateCancel': 'Access will continue until end of billing period',
  'pricing.lifetimeUpgrade.warningPoints.oneTimePayment': 'One-time payment of $300',
  'pricing.lifetimeUpgrade.currentSubscription': 'Current Subscription',
  'pricing.lifetimeUpgrade.cancel': 'Cancel',
  'pricing.lifetimeUpgrade.confirm': 'Confirm Upgrade',
  
  // Pricing - Actions
  'pricing.keepBasic': 'Keep Basic Plan',
  'pricing.startBasic': 'Get Started Free',
  
  // Billing
  'billing.currentPlan': 'Current Plan',
  'billing.changePlan': 'Change Plan',
  'billing.switching': 'Switching...',
  'billing.planSwitched': 'Plan Switched',
  'billing.planSwitchedDescription': 'Your plan has been successfully switched',
  'billing.error': 'Error',
  'billing.alreadyOnPlan': 'You are already on this plan',
  'billing.lifetimeNoDowngrade': 'Lifetime users cannot downgrade to recurring plans',
  'billing.lifetimeAlreadyOwned': 'You already have lifetime access',
  'billing.lifetimeActive': 'Lifetime access is active',
  'billing.lifetimeOwned': 'Lifetime Owned',
  'billing.lifetimeUpgrade': 'Upgrading...',
  'billing.billingPeriod': 'Billing Period',
  'billing.status.active': 'Active',
  
  // Terms
  'terms.pricing.disclaimer': 'By continuing, you agree to our ',
  'terms.pricing.termsOfService': 'Terms of Service',
}

// Simple i18n stub - internationalization removed for Edge compatibility
export function useI18n() {
  return (key: string, params?: any) => {
    // Return translation if available, otherwise return the key
    return translations[key] || key
  }
}

export function useCurrentLocale() {
  return 'en'
}

export function useChangeLocale() {
  return () => {}
}

export function I18nProviderClient({ children }: { children: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children)
}

// Server-side stub
export function getCurrentLocale() {
  return 'en'
}

export function getI18n() {
  return (key: string, params?: any) => key
}

export function getScopedI18n() {
  return (key: string, params?: any) => key
}

export function getStaticParams() {
  return [{ locale: 'en' }]
}
