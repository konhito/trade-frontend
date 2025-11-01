import { create } from 'zustand'
import { Trade } from '@/lib/types'
import { persist } from 'zustand/middleware'
import { StoreApi, UseBoundStore } from 'zustand'

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S,
) => {
  const store = _store as WithSelectors<typeof _store>
  store.use = {}
  for (const k of Object.keys(store.getState())) {
    ; (store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
  }

  return store
}

interface TradesState {
  // Trades data
  trades: Trade[]
  setTrades: (trades: Trade[]) => void
}
export const useTradesStore = createSelectors(create<TradesState>()((set) => ({
  trades: [],
  setTrades: (trades: Trade[]) => set({ trades }),
}))) as UseBoundStore<StoreApi<TradesState>>
