'use server'

import { NextResponse } from "next/server";
import { getWebsiteURL } from "@/lib/auth";
import { backendBaseUrl } from "@/lib/api";

// Lazy load stripe to avoid build errors if STRIPE_SECRET_KEY is missing
let stripe: any = null;
function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    const Stripe = require('stripe').default;
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    });
  }
  return stripe;
}
async function handleCheckoutSession(lookup_key: string, user: any, websiteURL: string, referral?: string | null) {
    // Subscription check removed - handled by backend
    const subscriptionDetails = null;

    if (subscriptionDetails?.isActive) {
        return NextResponse.redirect(
            `${websiteURL}dashboard?error=already_subscribed`,
            303
        );
    }

    const stripeClient = getStripe();
    if (!stripeClient) {
      return NextResponse.json({ message: "Stripe not configured" }, { status: 500 });
    }
    
    // First, try to find existing customer
    const existingCustomers = await stripeClient.customers.list({
        email: user.email,
        limit: 1,
    });

    let customerId: string;
    let isFirstOrder = false;

    if (existingCustomers.data.length > 0) {
        // Use existing customer
        customerId = existingCustomers.data[0].id;
        
        // Check if customer has any previous subscriptions
        const subscriptions = await stripeClient.subscriptions.list({
            customer: customerId,
            status: 'all', // Include all subscription statuses
            limit: 1
        });
        
        isFirstOrder = subscriptions.data.length === 0;
    } else {
        // Create new customer if none exists
        const newCustomer = await stripeClient.customers.create({
            email: user.email,
        });
        customerId = newCustomer.id;
        isFirstOrder = true;
    }

    const prices = await stripeClient.prices.list({
        lookup_keys: [lookup_key],
        expand: ['data.product'],
    });

    if (!prices.data.length) {
        return NextResponse.json({ message: "Price not found" }, { status: 404 });
    }

    const price = prices.data[0];
    const isLifetimePlan = price.type === 'one_time' || lookup_key.includes('lifetime');

    // Calculate remaining trial days if there was a previous trial (only for recurring plans)
    let trialDays = 0;
    
    if (!isLifetimePlan && subscriptionDetails?.trialEndsAt) {
        const now = new Date();
        const trialEnd = new Date(subscriptionDetails.trialEndsAt);
        
        if (trialEnd > now) {
            // If trial end is in future, calculate remaining days
            const remainingDays = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            trialDays = Math.min(remainingDays, trialDays);
        } else {
            // If trial has ended, no new trial
            trialDays = 0;
        }
    }

    // Create session with appropriate mode based on price type
    const sessionConfig: any = {
        customer: customerId,
        metadata: {
            plan: lookup_key,
        },
        line_items: [
            {
                price: price.id,
                quantity: 1,
            },
        ],
        success_url: `${websiteURL}dashboard?success=true`,
        cancel_url: `${websiteURL}pricing?canceled=true`,
        allow_promotion_codes: true,
    };

    if (isLifetimePlan) {
        // One-time payment mode for lifetime plans
        sessionConfig.mode = 'payment';
    } else {
        // Subscription mode for recurring plans
        sessionConfig.mode = 'subscription';
        sessionConfig.payment_method_collection = 'if_required';
        
        // Add subscription-specific configuration
        if (trialDays > 0) {
            sessionConfig.subscription_data = {
                trial_period_days: trialDays,
            };
        }
    }

    const session = await stripeClient.checkout.sessions.create(sessionConfig);

    return NextResponse.redirect(session.url as string, 303);
}

export async function POST(req: Request) {
    const body = await req.formData();
    const websiteURL = await getWebsiteURL();

    if (!body.get('lookup_key')) {
        return NextResponse.json({ message: "Lookup key is required" }, { status: 400 });
    }

    const lookup_key = body.get('lookup_key') as string;
    const referral = body.get('referral') as string | null;

    // Get user from auth token
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || body.get('token') as string;
    
    let user: any = null;
    if (token) {
      try {
        const res = await fetch(`${backendBaseUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          user = await res.json();
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
    
    if (!user) {
        return NextResponse.redirect(
            `${websiteURL}authentication?subscription=true&lookup_key=${lookup_key}`,
            303
        );
    }

    return handleCheckoutSession(lookup_key, user, websiteURL, referral);
}

export async function GET(req: Request) {
    const websiteURL = await getWebsiteURL();
    const { searchParams } = new URL(req.url);
    const lookup_key = searchParams.get('lookup_key');

    if (!lookup_key) {
        return NextResponse.json({ message: "Lookup key is required" }, { status: 400 });
    }

    // Get user from auth token
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || searchParams.get('token');
    
    let user: any = null;
    if (token) {
      try {
        const res = await fetch(`${backendBaseUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          user = await res.json();
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }
    
    if (!user) {
        return NextResponse.redirect(
            `${websiteURL}authentication?subscription=true&lookup_key=${lookup_key}`,
            303
        );
    }

    return handleCheckoutSession(lookup_key, user, websiteURL);
}