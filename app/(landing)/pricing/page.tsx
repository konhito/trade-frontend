'use client'
import React from 'react'
import PricingPlans from '@/components/pricing-plans'

export default function PricingPage() {
  return (
    <div>
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-4">Pricing Plans</h1>
        <p className="text-xl text-center text-gray-600 mb-12">Choose the plan that works best for you</p>

        <PricingPlans />
      </main>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <details className="border-b pb-4">
              <summary className="font-semibold cursor-pointer">What payment methods do you accept?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">We accept all major credit cards and PayPal.</p>
            </details>
            <details className="border-b pb-4">
              <summary className="font-semibold cursor-pointer">Can I change my plan later?</summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Yes, you can upgrade or downgrade your plan at any time.</p>
            </details>
          </div>
        </div>
      </section>
    </div>
  )
}