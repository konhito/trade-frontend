'use server'

import { getUserId } from '@/lib/auth'
import crypto from 'crypto'
// Prisma removed - using backend API instead

export async function generateThorToken() {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  try {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex')
    
    // TODO: Store token in backend database
    console.log('Thor token generated for user:', userId)

    return { token }
  } catch (error) {
    console.error('Failed to generate Thor token:', error)
    return { error: 'Failed to generate token' }
  }
}

export async function getThorToken() {
  const userId = await getUserId()
  if (!userId) {
    throw new Error('Unauthorized')
  }

  try {
    // TODO: Fetch token from backend database
    return { token: null }
  } catch (error) {
    console.error('Failed to get Thor token:', error)
    return { error: 'Failed to get token' }
  }
} 