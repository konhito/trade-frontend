/**
 * Currency formatting utilities
 * Uses Indian Rupee (₹) as the default currency
 */

/**
 * Formats a number as Indian Rupee currency
 */
export function formatCurrency(
  value: number | string | null | undefined,
  options?: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    showSymbol?: boolean
  }
): string {
  if (value === null || value === undefined) {
    return '₹0'
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue)) {
    return '₹0'
  }
  
  const formatted = Math.abs(numValue).toLocaleString('en-IN', {
    minimumFractionDigits: options?.minimumFractionDigits ?? 0,
    maximumFractionDigits: options?.maximumFractionDigits ?? 2
  })
  
  const sign = numValue < 0 ? '-' : ''
  const symbol = options?.showSymbol !== false ? '₹' : ''
  
  return `${sign}${symbol}${formatted}`
}

/**
 * Formats currency without symbol (just the number)
 */
export function formatCurrencyValue(
  value: number | string | null | undefined,
  options?: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }
): string {
  return formatCurrency(value, { ...options, showSymbol: false })
}

/**
 * Gets the currency symbol
 */
export function getCurrencySymbol(): string {
  return '₹'
}

