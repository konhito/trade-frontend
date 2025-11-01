import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/auth'
// TODO: ensureUserInDatabase removed - handled by backend
const ensureUserInDatabase = async () => {}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Verify the email with the token
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'signup'
    })

    if (error) {
      console.error('Email verification error:', error)
      return NextResponse.json({ 
        error: error.message || 'Email verification failed' 
      }, { status: 400 })
    }

    if (data.user) {
      // Ensure user exists in our database
      try {
        await ensureUserInDatabase(data.user)
      } catch (dbError) {
        console.error('Database error during verification:', dbError)
        // Continue even if DB sync fails
      }

      return NextResponse.json({ 
        success: true,
        message: 'Email verified successfully',
        user: {
          id: data.user.id,
          email: data.user.email
        }
      })
    }

    return NextResponse.json({ 
      error: 'Email verification failed' 
    }, { status: 400 })

  } catch (error) {
    console.error('Verification error:', error)
    return NextResponse.json({ 
      error: 'Failed to verify email. Please try again.' 
    }, { status: 500 })
  }
}

