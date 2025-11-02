'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, AlertCircle, CheckCircle2, CalendarDays, Clock, CreditCard, History, Receipt, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { updateSubscription, collectSubscriptionFeedback, type SubscriptionWithPrice } from "../../actions/billing"
import { useToast } from "@/hooks/use-toast"
import PricingPlans from "@/components/pricing-plans"
import Link from "next/link"
import { useStripeSubscriptionStore } from "@/store/stripe-subscription-store"


type SubscriptionStatus = 
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "paused"
  | "trialing"
  | "unpaid"

interface PlanPrice {
  yearly: number
  monthly: number
}

interface Plan {
  name: string
  description: string
  price: PlanPrice
  features: string[]
  isPopular?: boolean
  isComingSoon?: boolean
}

type Plans = {
  [key: string]: Plan
}

export default function BillingManagement() {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")
  const [feedback, setFeedback] = useState("")
  const { toast } = useToast()
  const locale = 'en'
  
  // Use store instead of local state
  const subscription = useStripeSubscriptionStore(state => state.stripeSubscription)
  const isLoading = useStripeSubscriptionStore(state => state.isLoading)
  const refreshSubscription = useStripeSubscriptionStore(state => state.refreshSubscription)

  // Add helper function for safe date formatting
  function formatStripeDate(
    timestamp: number | null | undefined, 
    options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    }
  ): string {
    if (!timestamp) return 'N/A'
    // Stripe timestamps are in seconds, JavaScript needs milliseconds
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString(locale, options)
  }

  // Subscription data is now loaded by DataProvider

  const handleSubscriptionAction = async (action: 'pause' | 'resume' | 'cancel') => {
    if (!subscription?.id) return

    try {
      const result = await updateSubscription(action, subscription.id)
      
      if (result.success) {
        // If cancelling, collect feedback
        if (action === 'cancel' && subscription?.plan?.name) {
          await collectSubscriptionFeedback(
            'cancellation',
            cancellationReason,
            feedback
          )
        }

        // Refresh subscription data
        await refreshSubscription()
        
        toast({
          title: "Success",
          description: `Successfully ${action}ed your subscription`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} subscription. Please try again.`,
        variant: "destructive",
      })
    }
  }


  return (
    <div className="w-full space-y-6">
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle>Current Plan</CardTitle>
          <div className="mt-1.5 text-sm text-muted-foreground flex items-center gap-2">
            {isLoading ? (
              <>
                <Skeleton className="h-4 w-[120px]" />
                <span className="text-muted-foreground">•</span>
                <Skeleton className="h-4 w-[100px]" />
              </>
            ) : (
              <>
                <span>
                  {subscription?.plan?.interval === 'lifetime' 
                    ? 'Plus Lifetime'
                    : subscription?.plan?.name || 'Basic'
                  }
                </span>
                <span className="text-muted-foreground">•</span>
                {subscription?.status === 'active' ? (
                  <span className="text-green-500 dark:text-green-400 inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active
                  </span>
                ) : subscription?.cancel_at_period_end ? (
                  <span className="text-yellow-500 dark:text-yellow-400 inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Scheduled to Cancel
                  </span>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    {subscription?.status ? (() => {
                      const status = subscription.status as SubscriptionStatus
                      switch (status) {
                        case 'active':
                          return 'Active'
                        case 'canceled':
                          return 'Canceled'
                        case 'incomplete':
                          return 'Incomplete'
                        case 'incomplete_expired':
                          return 'Incomplete Expired'
                        case 'past_due':
                          return 'Past Due'
                        case 'paused':
                          return 'Paused'
                        case 'trialing':
                          return 'Trialing'
                        case 'unpaid':
                          return 'Unpaid'
                        default:
                          return 'N/A'
                      }
                    })() : 'N/A'}
                  </span>
                )}
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <div className="rounded-lg border bg-card p-6 space-y-6">
            {/* Current Plan Details */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              {isLoading ? (
                <>
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-[140px]" />
                    <Skeleton className="h-4 w-[160px]" />
                  </div>
                  <Skeleton className="h-8 w-[200px]" />
                </>
              ) : (
                <>
                  <div>
                    {subscription?.plan?.interval === 'lifetime' ? (
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          Lifetime Access
                        </div>
                        <p className="text-sm text-muted-foreground">
                          One-time payment
                        </p>
                      </div>
                    ) : subscription?.promotion ? (
                      <div className="space-y-1">
                        <div className="text-2xl font-bold flex items-center gap-2">
                          <span className="text-muted-foreground line-through">
                            €{(subscription.plan.amount / 100).toFixed(2)}
                          </span>
                          <span>
                            €{((subscription.plan.amount - (subscription.promotion.amount_off || (subscription.promotion.percent_off ? subscription.plan.amount * subscription.promotion.percent_off / 100 : 0))) / 100).toFixed(2)}
                            <span className="text-lg font-normal text-gray-500">
                              /{subscription.plan.interval}
                            </span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                            {subscription.promotion.percent_off 
                              ? `${subscription.promotion.percent_off}% OFF`
                              : `€${(subscription.promotion.amount_off / 100).toFixed(2)} OFF`}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {subscription.promotion.duration.duration === 'forever' && (
                              <span className="ml-1">(Forever)</span>
                            )}
                            {subscription.promotion.duration.duration === 'once' && (
                              <span className="ml-1">(Once)</span>
                            )}
                            {subscription.promotion.duration.duration === 'repeating' && subscription.promotion.duration.duration_in_months && (
                              <span className="ml-1">(For {subscription.promotion.duration.duration_in_months} months)</span>
                            )}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-2xl font-bold">
                        {subscription?.plan?.amount 
                          ? (
                            <>
                              €{(subscription.plan.amount / 100).toFixed(2)}
                              <span className="text-lg font-normal text-gray-500">
                                /{subscription.plan.interval === 'year' ? 'year' : subscription.plan.interval === 'month' ? 'month' : subscription.plan.interval === 'quarter' ? 'quarter' : 'lifetime'}
                              </span>
                            </>
                          )
                          : 'Free'}
                      </div>
                    )}
                    {/* {subscription?.plan?.interval !== 'lifetime' && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {subscription?.plan?.interval === 'year' 
                          ? t('pricing.currentlyYearly') 
                          : t('pricing.currentlyMonthly')}
                      </p>
                    )} */}
                  </div>
                  {subscription?.trial_end && new Date(subscription.trial_end * 1000) > new Date() && (
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-md text-sm">
                      Trial ends on {formatStripeDate(subscription.trial_end)}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Subscription Timeline */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {isLoading ? (
                  <>
                    <div className="flex items-start gap-2">
                      <History className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="w-full">
                        <div className="font-medium">Active Since</div>
                        <Skeleton className="h-4 w-[180px] mt-1" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div className="w-full">
                        <div className="font-medium">Current Period</div>
                        <Skeleton className="h-4 w-[240px] mt-1" />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-start gap-2">
                      <History className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">
                          Active since {formatStripeDate(subscription?.created)}
                        </p>
                      </div>
                    </div>
                    {subscription?.plan?.interval === 'lifetime' ? (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Lifetime subscription - no expiration date
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-2">
                        <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">
                            Current period: {formatStripeDate(subscription?.current_period_start)} - {formatStripeDate(subscription?.current_period_end)}
                          </p>
                        </div>
                      </div>
                    )}
                    {subscription?.trial_start && subscription?.trial_end && (
                      <div className="flex items-start gap-2">
                        <CreditCard className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium">Trial Period</p>
                          <p className="text-sm text-muted-foreground">
                            {formatStripeDate(subscription.trial_start)} - {formatStripeDate(subscription.trial_end)}
                          </p>
                        </div>
                      </div>
                    )}
                    {subscription?.cancel_at && (
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-destructive">Cancellation Date</p>
                          <p className="text-sm text-destructive/80">
                            {formatStripeDate(subscription.cancel_at)}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Management */}
      {!isLoading && (subscription?.status === 'active' || subscription?.status === 'trialing') && subscription?.plan?.interval !== 'lifetime' && (
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="px-0">
            <div className="flex flex-col gap-4">
              {!subscription.cancel_at_period_end && (
                <div className="flex flex-wrap items-center gap-4">
                  <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        className="sm:w-auto"
                      >
                        Cancel Subscription
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cancel Subscription</DialogTitle>
                        <DialogDescription>
                          Are you sure you want to cancel your subscription?
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <p className="text-sm font-medium">
                          By canceling, you will lose access to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                          {[
                            'Advanced analytics and insights',
                            'Priority support',
                            'Premium features'
                          ].map((feature, index) => (
                            <li key={index} className="text-sm text-muted-foreground">
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label htmlFor="cancellationReason" className="text-sm font-medium">
                              Cancellation Reason
                            </label>
                            <select
                              id="cancellationReason"
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                              value={cancellationReason}
                              onChange={(e) => setCancellationReason(e.target.value)}
                            >
                              <option value="">Select a reason</option>
                              <option value="too_expensive">Too expensive</option>
                              <option value="missing_features">Missing features</option>
                              <option value="not_using">Not using the service</option>
                              <option value="switching">Switching to another service</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="feedback" className="text-sm font-medium">
                              Additional Feedback
                            </label>
                            <textarea
                              id="feedback"
                              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                              rows={3}
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="Please share any additional feedback..."
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsCancelDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            handleSubscriptionAction('cancel')
                            setIsCancelDialogOpen(false)
                          }}
                        >
                          Confirm Cancellation
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    className="sm:w-auto"
                    asChild
                  >
                    <Link href={process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL || ""}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Payment Method
                    </Link>
                  </Button>
                </div>
              )}
              {subscription.cancel_at_period_end && (
                <div className="flex flex-wrap items-center gap-4">
                  <Button 
                    onClick={() => handleSubscriptionAction('resume')} 
                    className="sm:w-auto"
                  >
                    Resume Subscription
                  </Button>
                  <Button
                    variant="outline"
                    className="sm:w-auto"
                    asChild
                  >
                    <Link href={process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL || ""}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Manage Payment Method
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle>Available Plans</CardTitle>
          <CardDescription>Choose a plan that works for you</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <PricingPlans currentSubscription={subscription} />
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card className="border-none shadow-none bg-transparent">
        <CardHeader className="px-0">
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View your payment history and invoices</CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="rounded-lg border bg-card">
            {isLoading ? (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[140px]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-[100px]" />
                      <Skeleton className="h-8 w-[120px]" />
                      <Skeleton className="h-8 w-[120px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : subscription?.invoices && subscription.invoices.length > 0 ? (
              <div className="divide-y">
                {subscription.invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        €{(invoice.amount_paid / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatStripeDate(invoice.created)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {invoice.status === 'paid' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          Succeeded
                        </Badge>
                      )}
                      <div className="flex items-center gap-2">
                        {invoice.hosted_invoice_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => invoice.hosted_invoice_url && window.open(invoice.hosted_invoice_url, '_blank')}
                          >
                            <Receipt className="h-4 w-4 mr-2" />
                            View Invoice
                          </Button>
                        )}
                        {invoice.invoice_pdf && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => invoice.invoice_pdf && window.open(invoice.invoice_pdf, '_blank')}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No payment history available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 