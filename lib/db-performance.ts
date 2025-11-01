/**
 * Database Performance Monitoring and Optimization Utilities
 */

import { prisma } from '@/lib/prisma'
import { performance } from 'perf_hooks'

export interface QueryMetrics {
  operation: string
  model: string
  duration: number
  rows?: number
  query: string
}

/**
 * Measure query performance
 */
export async function measureQuery<T>(
  label: string,
  queryFn: () => Promise<T>
): Promise<{ result: T; duration: number; metrics: QueryMetrics }> {
  const start = performance.now()
  
  try {
    const result = await queryFn()
    const duration = performance.now() - start
    
    const metrics: QueryMetrics = {
      operation: label,
      model: 'unknown',
      duration,
      query: label,
    }
    
    // Log if slow (>500ms)
    if (duration > 500) {
      console.warn(`[DB Performance] Slow query detected: ${label} took ${duration.toFixed(2)}ms`)
    }
    
    return { result, duration, metrics }
  } catch (error) {
    const duration = performance.now() - start
    console.error(`[DB Performance] Query failed after ${duration.toFixed(2)}ms:`, error)
    throw error
  }
}

/**
 * Analyze and suggest optimizations for slow queries
 */
export function analyzeQueryPerformance(metrics: QueryMetrics[]): void {
  const slowQueries = metrics.filter(m => m.duration > 1000)
  
  if (slowQueries.length > 0) {
    console.warn(`[DB Performance] Found ${slowQueries.length} slow queries (>1s):`)
    slowQueries.forEach(m => {
      console.warn(`  - ${m.operation}: ${m.duration.toFixed(2)}ms`)
    })
    
    // Suggest optimizations
    const operationsWithCount = slowQueries.filter(m => m.operation.includes('findMany'))
    if (operationsWithCount.length > 0) {
      console.warn(`[DB Performance] Suggestion: Consider adding indexes or using select to reduce data`)
    }
  }
}

/**
 * Get database connection status and performance metrics
 */
export async function getDatabaseHealth(): Promise<{
  connected: boolean
  latency: number
  queryTime: number
}> {
  const start = performance.now()
  
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`
    const queryTime = performance.now() - start
    
    return {
      connected: true,
      latency: queryTime,
      queryTime,
    }
  } catch (error) {
    return {
      connected: false,
      latency: -1,
      queryTime: -1,
    }
  }
}


