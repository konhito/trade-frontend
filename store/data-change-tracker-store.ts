/**
 * Data Change Tracker Store
 * 
 * Tracks if user has made any changes to data.
 * If no changes were made, we can skip refetching from database (smart caching).
 * 
 * Usage:
 * - Set isChanged = false when data loads successfully
 * - Set isChanged = true when user makes ANY change (save, update, delete, etc.)
 * - Skip refetching if isChanged === false
 */

import { create } from 'zustand'

interface DataChangeTrackerState {
  // Global change flag - true if ANY data was changed
  isChanged: boolean
  
  // Granular change tracking (optional - for future use)
  tradesChanged: boolean
  accountsChanged: boolean
  groupsChanged: boolean
  tagsChanged: boolean
  userDataChanged: boolean
  dashboardLayoutChanged: boolean
  
  // Actions
  setChanged: (changed: boolean) => void
  setTradesChanged: (changed: boolean) => void
  setAccountsChanged: (changed: boolean) => void
  setGroupsChanged: (changed: boolean) => void
  setTagsChanged: (changed: boolean) => void
  setUserDataChanged: (changed: boolean) => void
  setDashboardLayoutChanged: (changed: boolean) => void
  
  // Reset all change flags (call after successful data load)
  resetAll: () => void
  
  // Mark all as changed (call when user makes any change)
  markAllChanged: () => void
}

export const useDataChangeTracker = create<DataChangeTrackerState>((set) => ({
  isChanged: false,
  tradesChanged: false,
  accountsChanged: false,
  groupsChanged: false,
  tagsChanged: false,
  userDataChanged: false,
  dashboardLayoutChanged: false,
  
  setChanged: (changed) => set({ isChanged: changed }),
  
  setTradesChanged: (changed) => set((state) => ({
    tradesChanged: changed,
    isChanged: changed || state.accountsChanged || state.groupsChanged || 
               state.tagsChanged || state.userDataChanged || state.dashboardLayoutChanged
  })),
  
  setAccountsChanged: (changed) => set((state) => ({
    accountsChanged: changed,
    isChanged: changed || state.tradesChanged || state.groupsChanged || 
               state.tagsChanged || state.userDataChanged || state.dashboardLayoutChanged
  })),
  
  setGroupsChanged: (changed) => set((state) => ({
    groupsChanged: changed,
    isChanged: changed || state.tradesChanged || state.accountsChanged || 
               state.tagsChanged || state.userDataChanged || state.dashboardLayoutChanged
  })),
  
  setTagsChanged: (changed) => set((state) => ({
    tagsChanged: changed,
    isChanged: changed || state.tradesChanged || state.accountsChanged || 
               state.groupsChanged || state.userDataChanged || state.dashboardLayoutChanged
  })),
  
  setUserDataChanged: (changed) => set((state) => ({
    userDataChanged: changed,
    isChanged: changed || state.tradesChanged || state.accountsChanged || 
               state.groupsChanged || state.tagsChanged || state.dashboardLayoutChanged
  })),
  
  setDashboardLayoutChanged: (changed) => set((state) => ({
    dashboardLayoutChanged: changed,
    isChanged: changed || state.tradesChanged || state.accountsChanged || 
               state.groupsChanged || state.tagsChanged || state.userDataChanged
  })),
  
  resetAll: () => set({
    isChanged: false,
    tradesChanged: false,
    accountsChanged: false,
    groupsChanged: false,
    tagsChanged: false,
    userDataChanged: false,
    dashboardLayoutChanged: false,
  }),
  
  markAllChanged: () => set({
    isChanged: true,
    tradesChanged: true,
    accountsChanged: true,
    groupsChanged: true,
    tagsChanged: true,
    userDataChanged: true,
    dashboardLayoutChanged: true,
  }),
}))


