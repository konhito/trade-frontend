import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from '@/lib/server-auth'
// TODO: All server imports from backend API
const getTradesAction = async () => { console.log('TODO: getTradesAction from backend API'); return [] }
const getUserData = async () => { console.log('TODO: getUserData from backend API'); return null }
const getDashboardLayout = async () => { console.log('TODO: getDashboardLayout from backend API'); return null }
const calculateAccountBalanceAction = async () => { console.log('TODO: calculateAccountBalanceAction from backend API'); return [] }
const getSubscriptionDetails = async () => { console.log('TODO: getSubscriptionDetails from backend API'); return null }
const ensureUserInDatabase = async () => { console.log('TODO: ensureUserInDatabase from backend API'); return null }
import { unstable_cache } from 'next/cache'

/**
 * Combined Dashboard Data API
 * Returns all data needed for dashboard in a single request
 * Reduces round trips from 3+ to 1
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId()
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('forceRefresh') === 'true'

    // Get subscription details for filtering
    const subscriptionDetails = await getSubscriptionDetails()
    
    // Fetch all dashboard data in parallel
    const [
      trades,
      userDataResponse,
      dashboardLayout
    ] = await Promise.all([
      // Fetch trades
      getTradesAction(userId, forceRefresh),
      
      // Fetch user data (accounts, groups, tags, etc.)
      getUserData(forceRefresh),
      
      // Fetch dashboard layout
      getDashboardLayout(userId)
    ])

    if (!userDataResponse) {
      return NextResponse.json({ error: 'User data not found' }, { status: 404 })
    }

    // Calculate account balances using already-fetched trades
    // This avoids an extra database query
    const accountsWithBalance = await calculateAccountBalanceAction(
      userDataResponse.accounts || [],
      trades as any[] // Pass trades to avoid re-querying
    )

    // Ensure user is in database
    const user = userDataResponse.userData
    if (user) {
      await ensureUserInDatabase(
        { id: user.authUserId || user.id } as any,
        'en'
      )
    }

    return NextResponse.json({
      trades,
      user: userDataResponse.userData,
      subscription: userDataResponse.subscription,
      accounts: accountsWithBalance,
      groups: userDataResponse.groups,
      tags: userDataResponse.tags,
      tickDetails: userDataResponse.tickDetails,
      financialEvents: userDataResponse.financialEvents,
      moodHistory: userDataResponse.moodHistory,
      dashboardLayout: dashboardLayout || null
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}


