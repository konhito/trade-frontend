'use server'

import { getUser } from '@/lib/server-auth'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function generateEtpToken() {
  const user = await getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  try {
    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex')
    
    // TODO: Store token in backend database
    // For now, just return the token
    console.log('ETP token generated for user:', user.id)

    revalidatePath('/dashboard')
    return { token }
  } catch (error) {
    console.error('Failed to generate ETP token:', error)
    return { error: 'Failed to generate token' }
  }
}

export async function getEtpToken() {
  const user = await getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  try {
    // TODO: Fetch token from backend database
    // For now, return null
    return { token: null }
  } catch (error) {
    console.error('Failed to get ETP token:', error)
    return { error: 'Failed to get token' }
  }
} 