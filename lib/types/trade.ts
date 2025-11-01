/**
 * Trade type definition (replaces @prisma/client Trade type)
 * Used for type checking in AI tools and other components
 */
export interface Trade {
  id: string
  userId: string
  symbol?: string | null
  instrument?: string | null
  direction?: string | null
  side?: string | null
  entryDate?: string | Date | null
  exitDate?: string | Date | null
  closeDate?: string | Date | null
  entryPrice?: number | string | null
  exitPrice?: number | string | null
  closePrice?: number | string | null
  quantity?: number | null
  pnl?: number | null
  pnlPercent?: number | string | null
  commission?: number | null
  strategy?: string | null
  accountNumber?: string | null
  status?: string | null
  psychology?: string | object | null
  imageBase64?: string | null
  imageBase64Second?: string | null
  timeInPosition?: string | number | null
  tags?: string[] | null
  [key: string]: any
}

