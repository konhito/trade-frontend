'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Plus, RefreshCw, MoreVertical } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { getAllTradovateTokens, storeTradovateToken, getTradovateTrades, initiateTradovateOAuth, removeTradovateToken } from './actions'
import { useTradovateSyncStore } from '@/store/tradovate-sync-store'
import { useData } from '@/context/data-provider'
import { useTradovateSyncContext } from '@/context/tradovate-sync-context'

interface TradovateAccount {
  accountId: string
  token: string
  tokenExpiresAt: string
  lastSyncedAt: string
  isExpired: boolean
  environment: 'demo' | 'live'
}

export function TradovateCredentialsManager() {
  const { performSyncForAccount, performSyncForAllAccounts, accounts, deleteAccount } = useTradovateSyncContext()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [syncingId, setSyncingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const tradovateStore = useTradovateSyncStore()



  const handleDelete = useCallback(async (accountId: string) => {
    try {
      // For now, we'll just remove from local state
      // In the future, we might want to add a deleteTradovateToken server action
      await deleteAccount(accountId)
      setIsDeleteDialogOpen(false)
      toast.success(`Account ${accountId} deleted successfully`)
    } catch (error) {
      toast.error(`Failed to delete account ${accountId}`)
      console.error('Delete error:', error)
    }
  }, [deleteAccount])


  const handleStartOAuth = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await initiateTradovateOAuth('default') // We'll determine the actual account ID from the token
      if (result.error || !result.authUrl || !result.state) {
        toast.error('Failed to initiate OAuth authentication')
        return
      }
      
      // Store the state for verification
      tradovateStore.setOAuthState(result.state)
      
      // Also store in sessionStorage as backup
      sessionStorage.setItem('tradovate_oauth_state', result.state)
      
      // Redirect to Tradovate OAuth
      window.location.href = result.authUrl
    } catch (error) {
      toast.error('Failed to initiate OAuth authentication')
    } finally {
      setIsLoading(false)
    }
  }, [tradovateStore])

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString()
  }


  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Saved Accounts</h2>
          <div className="flex gap-2 items-center">
            <Button 
              onClick={async () => {
              await performSyncForAllAccounts()
              }} 
              size="sm"
              variant="outline"
              disabled={syncingId !== null}
              className="h-8"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All
            </Button>
            <Button 
              onClick={handleStartOAuth} 
              disabled={isLoading} 
              size="sm"
              className="h-8"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add New
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Name</TableHead>
              <TableHead>Environment</TableHead>
              <TableHead>Last Sync</TableHead>
              <TableHead>Token Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.accountId}>
                <TableCell className="font-medium">{account.accountId}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    account.environment === 'live' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {account.environment}
                  </span>
                </TableCell>
                <TableCell>{formatDate(account.lastSyncedAt)}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded text-xs ${
                    account.isExpired 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {account.isExpired ? 'Expired' : 'Valid'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={async () => {
                        await performSyncForAccount(account.accountId)
                      }}
                      disabled={syncingId !== null || account.isExpired}
                    >
                      {syncingId === account.accountId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Popover modal>
                      <PopoverTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2" align="end">
                        <div className="flex flex-col space-y-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="justify-start text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedAccountId(account.accountId)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  No saved accounts
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete account {selectedAccountId}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedAccountId && handleDelete(selectedAccountId)}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
