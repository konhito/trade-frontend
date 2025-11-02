// Type definitions replacing Prisma client types

export type Trade = {
  id: string
  userId: string
  symbol: string
  direction?: string | null
  status: string
  entryPrice?: number | null
  exitPrice?: number | null
  pnl: number
  pnlPercent?: number | null
  strategy?: string | null
  entryDate?: string | null
  exitDate?: string | null
  duration?: string | null
  notes?: string | null
  psychology?: any
  accountNumber?: string | null
  commission?: number | null
  quantity?: number | null
  createdAt?: Date | string
}

export type User = {
  id: string
  email: string
  name?: string | null
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type Subscription = {
  id: string
  userId: string
  plan?: string | null
  status?: string | null
  endDate?: Date | string | null
  trialEndsAt?: Date | string | null
}

export type Tag = {
  id: string
  userId: string
  name: string
  color?: string | null
}

export type DashboardLayout = {
  id: string
  userId: string
  desktop: any[]
  mobile: any[]
  createdAt?: Date | string
  updatedAt?: Date | string
}

export type TickDetails = {
  id: string
  userId: string
  tradeId?: string | null
  timestamp?: Date | string | null
  price?: number | null
  volume?: number | null
  tickValue?: number
  tickSize?: number
}

export type FinancialEvent = {
  id: string
  userId: string
  type?: string | null
  importance?: string | null
  amount?: number | null
  date?: Date | string | null
  description?: string | null
}

export type Mood = {
  id: string
  userId: string
  day?: Date | string | null
  date?: Date | string | null
  mood?: string | null
  notes?: string | null
  createdAt?: Date | string | null
  updatedAt?: Date | string | null
}

export type Account = {
  id: string
  userId: string
  accountNumber: string
  name?: string | null
  balance?: number | null
  groupId?: string | null
}

