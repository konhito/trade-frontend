'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useUserStore } from '@/store/user-store'
import LoadingOverlay from '@/app/dashboard/components/loading-overlay'
import ImportButton from '@/app/dashboard/components/import/import-button'
// Using client-side signOut from useAuth hook
import PricingPlans from '@/components/pricing-plans'
import { redirect, useSearchParams } from 'next/navigation'
import OnboardingModal from './onboarding-modal'
import { AccountGroupBoard } from '@/app/dashboard/components/filters/account-group-board'
import { useModalStateStore } from '@/store/modal-state-store'
import { useTradesStore } from '@/store/trades-store'

const PAYWALL_COOLDOWN = 30 * 60 * 1000; // 30 minutes in milliseconds

export default function Modals() {
  const user = useUserStore((state) => state.user)
  const subscription = useUserStore((state) => state.subscription)
  const isLoading = useUserStore((state) => state.isLoading)
  const trades = useTradesStore((state) => state.trades)
  const [isPaywallOpen, setIsPaywallOpen] = useState(false)
  const [isAlreadySubscribedOpen, setIsAlreadySubscribedOpen] = useState(false)
  const [isTradesDialogOpen, setIsTradesDialogOpen] = useState(false)
  const searchParams = useSearchParams()
  const { accountGroupBoardOpen, setAccountGroupBoardOpen } = useModalStateStore()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error === 'already_subscribed') {
      setIsAlreadySubscribedOpen(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (!isLoading && !isPaywallOpen) {
      if (!trades) {
        console.warn('No trades available. Please add some trades to see the dashboard content.');
        setIsTradesDialogOpen(true)
      }
    }
  }, [trades, isPaywallOpen, isLoading])

  const handlePaywallClose = useCallback(() => {
    setIsPaywallOpen(false);
    // Update timestamp when user manually closes the modal
    localStorage.setItem('paywall_last_shown', Date.now().toString());
  }, []);

  if (!user) return null
  return (
    <>
      {isLoading && <LoadingOverlay />}
      <OnboardingModal />

      {/* Tooltip Portal for Sheet */}
      <div id="sheet-tooltip-portal" className="fixed inset-0 pointer-events-none z-[100]" />
      
      {/* Account Group Board */}
      <Sheet open={accountGroupBoardOpen} onOpenChange={setAccountGroupBoardOpen}>
        <SheetContent side="right" className="w-[90vw] sm:w-[800px] sm:max-w-[800px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Manage Accounts</SheetTitle>
            <SheetDescription>
              Group and organize your trading accounts
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <AccountGroupBoard/>
          </div>
        </SheetContent>
      </Sheet>
      

      <Dialog open={isAlreadySubscribedOpen} onOpenChange={setIsAlreadySubscribedOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Already Subscribed</DialogTitle>
            <DialogDescription>
              You already have an active subscription. Manage it from your billing settings.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button
              onClick={() => {
                setTimeout(() => {
                  redirect('/dashboard/billing')
                }, 100)
                  setIsAlreadySubscribedOpen(false)
              }}
            >
              Manage Subscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {!user?.isFirstConnection && (
        <Dialog open={isTradesDialogOpen} onOpenChange={setIsTradesDialogOpen}>
          <DialogContent>
            <DialogHeader>
            <DialogTitle>No Trades Available</DialogTitle>
            <DialogDescription>
              You don't have any trades yet. Import your trading data to get started.
            </DialogDescription>
          </DialogHeader>
          <ImportButton />
        </DialogContent>
      </Dialog>
      )}

      <Dialog 
        open={isPaywallOpen} 
        onOpenChange={handlePaywallClose}
      >
        <DialogContent className="sm:max-w-[1200px] w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl sm:text-3xl font-bold text-center">Choose Your Plan</DialogTitle>
            <DialogDescription className="text-center text-base sm:text-lg">
              Subscribe to access all features and unlock your trading potential
            </DialogDescription>
          </DialogHeader>
          
          <PricingPlans 
            isModal={true} 
            onClose={() => setIsPaywallOpen(false)} 
          />

          <div className="mt-4 text-center">
            <Button variant='link'>
              Change Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
