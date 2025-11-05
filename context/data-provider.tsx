'use client'
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';

// Removed Prisma types; define light aliases for compatibility
type PrismaTrade = any
type PrismaGroup = any
type PrismaAccount = any
type PrismaPayout = any
type PrismaDashboardLayout = any
type PrismaSubscription = any

// Removed server actions; using backend services instead
type SharedParams = any
import {
  WidgetType,
  WidgetSize,
} from '@/app/[locale]/dashboard/types/dashboard';
import { listAccounts, upsertAccount, deleteAccount as deleteAccountApi } from '@/lib/services/accounts'
import { listGroups as listGroupsApi, createGroup as createGroupApi, renameGroup as renameGroupApi, deleteGroup as deleteGroupApi } from '@/lib/services/groups'
import { savePayout as savePayoutApi, deletePayout as deletePayoutApi } from '@/lib/services/payouts'
import { useAuth } from '@/context/auth-provider'
import { listTrades } from '@/lib/services/trades'
import { listStrategies } from '@/lib/services/strategies'
import { useUserStore } from '@/store/user-store';
import { useTickDetailsStore } from '@/store/tick-details-store';
import { useFinancialEventsStore } from '@/store/financial-events-store';
import { useTradesStore } from '@/store/trades-store';
import {
  endOfDay,
  isValid,
  parseISO,
  set,
  startOfDay
} from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { calculateStatistics, formatCalendarData } from '@/lib/utils';
import { useParams } from 'next/navigation';
// Tags features pending backend; remove server dependency
import { useRouter } from 'next/navigation';
import { useCurrentLocale } from '@/lib/i18n';
import { useMoodStore } from '@/store/mood-store';
import { useStripeSubscriptionStore } from '@/store/stripe-subscription-store';
// Subscription fetch pending backend

// Types from trades-data.tsx
type StatisticsProps = {
  cumulativeFees: number
  cumulativePnl: number
  winningStreak: number
  winRate: number
  nbTrades: number
  nbBe: number
  nbWin: number
  nbLoss: number
  totalPositionTime: number
  averagePositionTime: string
  profitFactor: number
  grossLosses: number
  grossWin: number
  totalPayouts: number
  nbPayouts: number
}

type CalendarData = {
  [date: string]: {
    pnl: number
    tradeNumber: number
    longNumber: number
    shortNumber: number
    trades: PrismaTrade[]
  }
}

interface DateRange {
  from: Date
  to: Date
}

interface TickRange {
  min: number | undefined
  max: number | undefined
}

interface PnlRange {
  min: number | undefined
  max: number | undefined
}


// Add new interface for time range
interface TimeRange {
  range: string | null
}

// Add new interface for tick filter
interface TickFilter {
  value: string | null
}

// Update WeekdayFilter interface to use numbers
interface WeekdayFilter {
  day: number | null
}

// Add new interface for hour filter
interface HourFilter {
  hour: number | null
}

// Add tag filter interface
interface TagFilter {
  tags: string[]
}

export interface Group extends PrismaGroup {
  accounts: PrismaAccount[]
}


// Update Account type to include payouts and balanceToDate
export interface Account extends Omit<PrismaAccount, 'payouts' | 'group'> {
  payouts?: PrismaPayout[]
  balanceToDate?: number
  group?: PrismaGroup | null
}

// Add after the interfaces and before the UserDataContext
export const defaultLayouts: PrismaDashboardLayout = {
  id: '',
  userId: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  desktop: [
    {
      "i": "widget1751403095730",
      "type": "calendarWidget",
      "size": "large",
      "x": 0,
      "y": 8,
      "w": 6,
      "h": 8
    },
    {
      "i": "widget1751715494609",
      "type": "tradeDistribution",
      "size": "small",
      "x": 6,
      "y": 0,
      "w": 3,
      "h": 4
    },
    {
      "i": "widget1751741589330",
      "type": "pnlChart",
      "size": "medium",
      "x": 0,
      "y": 16,
      "w": 6,
      "h": 4
    },
    {
      "i": "widget1752135357688",
      "type": "weekdayPnlChart",
      "size": "medium",
      "x": 0,
      "y": 4,
      "w": 6,
      "h": 4
    },
    {
      "i": "widget1752135359621",
      "type": "timeOfDayChart",
      "size": "medium",
      "x": 0,
      "y": 20,
      "w": 6,
      "h": 4
    },
    {
      "i": "widget1752135361015",
      "type": "timeInPositionChart",
      "size": "medium",
      "x": 6,
      "y": 4,
      "w": 6,
      "h": 4
    },
    {
      "i": "widget1752135363430",
      "type": "equityChart",
      "size": "large",
      "x": 6,
      "y": 8,
      "w": 6,
      "h": 8
    },
    {
      "i": "widget1752135365730",
      "type": "pnlBySideChart",
      "size": "medium",
      "x": 6,
      "y": 16,
      "w": 6,
      "h": 4
    },
    {
      "i": "widget1752135368429",
      "type": "tickDistribution",
      "size": "medium",
      "x": 6,
      "y": 20,
      "w": 6,
      "h": 4
    },
    {
      "i": "widget1752135370579",
      "type": "commissionsPnl",
      "size": "medium",
      "x": 6,
      "y": 24,
      "w": 6,
      "h": 4
    },
    {
      "i": "widget1752135378584",
      "type": "timeRangePerformance",
      "size": "medium",
      "x": 0,
      "y": 24,
      "w": 6,
      "h": 4
    },
    {
      "i": "widget1752135395916",
      "type": "riskRewardRatio",
      "size": "tiny",
      "x": 9,
      "y": 0,
      "w": 3,
      "h": 1
    },
    {
      "i": "widget1752135396857",
      "type": "statisticsWidget",
      "size": "medium",
      "x": 0,
      "y": 0,
      "w": 6,
      "h": 4
    },
    {
      "i": "widget1752135397611",
      "type": "profitFactor",
      "size": "tiny",
      "x": 9,
      "y": 1,
      "w": 3,
      "h": 1
    },
    {
      "i": "widget1752135401717",
      "type": "cumulativePnl",
      "size": "tiny",
      "x": 9,
      "y": 2,
      "w": 3,
      "h": 1
    }
  ],
  mobile: [
    {
      i: "calendarWidget",
      type: "calendarWidget" as WidgetType,
      size: "large" as WidgetSize,
      x: 0,
      y: 2,
      w: 12,
      h: 6
    },
    {
      i: "equityChart",
      type: "equityChart" as WidgetType,
      size: "medium" as WidgetSize,
      x: 0,
      y: 8,
      w: 12,
      h: 6
    },
    {
      i: "cumulativePnl",
      type: "cumulativePnl" as WidgetType,
      size: "tiny" as WidgetSize,
      x: 0,
      y: 0,
      w: 12,
      h: 1
    },
    {
      i: "tradePerformance",
      type: "tradePerformance" as WidgetType,
      size: "tiny" as WidgetSize,
      x: 0,
      y: 1,
      w: 12,
      h: 1
    }
  ]
};

// Combined Context Type
interface DataContextType {
  refreshTrades: () => Promise<void>
  isPlusUser: () => boolean
  isLoading: boolean
  isMobile: boolean
  isSharedView: boolean
  changeIsFirstConnection: (isFirstConnection: boolean) => void
  isFirstConnection: boolean
  setIsFirstConnection: (isFirstConnection: boolean) => void
  sharedParams: SharedParams | null
  setSharedParams: React.Dispatch<React.SetStateAction<SharedParams | null>>

  // Formatted trades and filters
  formattedTrades: PrismaTrade[]
  instruments: string[]
  setInstruments: React.Dispatch<React.SetStateAction<string[]>>
  accountNumbers: string[]
  setAccountNumbers: React.Dispatch<React.SetStateAction<string[]>>
  dateRange: DateRange | undefined
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>
  tickRange: TickRange
  setTickRange: React.Dispatch<React.SetStateAction<TickRange>>
  pnlRange: PnlRange
  setPnlRange: React.Dispatch<React.SetStateAction<PnlRange>>
  timeRange: TimeRange
  setTimeRange: React.Dispatch<React.SetStateAction<TimeRange>>
  tickFilter: TickFilter
  setTickFilter: React.Dispatch<React.SetStateAction<TickFilter>>
  weekdayFilter: WeekdayFilter
  setWeekdayFilter: React.Dispatch<React.SetStateAction<WeekdayFilter>>
  hourFilter: HourFilter
  setHourFilter: React.Dispatch<React.SetStateAction<HourFilter>>
  tagFilter: TagFilter
  setTagFilter: React.Dispatch<React.SetStateAction<TagFilter>>

  // Statistics and calendar
  statistics: StatisticsProps
  calendarData: CalendarData


  // Mutations
  // Trades
  updateTrades: (tradeIds: string[], update: Partial<PrismaTrade>) => Promise<void>
  groupTrades: (tradeIds: string[]) => Promise<void>
  ungroupTrades: (tradeIds: string[]) => Promise<void>

  // Accounts
  deleteAccount: (account: Account) => Promise<void>
  saveAccount: (account: Account) => Promise<void>

  // Groups
  saveGroup: (name: string) => Promise<Group | undefined>
  renameGroup: (groupId: string, name: string) => Promise<void>
  deleteGroup: (groupId: string) => Promise<void>
  moveAccountToGroup: (accountId: string, targetGroupId: string | null) => Promise<void>

  // Payouts
  savePayout: (payout: PrismaPayout) => Promise<void>
  deletePayout: (payoutId: string) => Promise<void>

  // Dashboard layout
  saveDashboardLayout: (layout: PrismaDashboardLayout) => Promise<void>
}


const DataContext = createContext<DataContextType | undefined>(undefined);

// Add this hook before the UserDataProvider component
function useIsMobileDetection() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 768px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mobileQuery = window.matchMedia('(max-width: 768px)');
    const checkMobile = (e: MediaQueryListEvent | MediaQueryList) => setIsMobile(e.matches);

    // Check immediately
    checkMobile(mobileQuery);

    // Add listener for changes
    mobileQuery.addEventListener('change', checkMobile);
    return () => mobileQuery.removeEventListener('change', checkMobile);
  }, []);

  return isMobile;
}


// Supabase removed; backend handles auth and data

export const DataProvider: React.FC<{
  children: React.ReactNode;
  isSharedView?: boolean;
  adminView?: {
    userId: string;
  };
}> = ({ children, isSharedView = false, adminView = null }) => {
  const router = useRouter()
  const params = useParams();
  const isMobile = useIsMobileDetection();

  // Get store values
  const user = useUserStore(state => state.user);
  const setUser = useUserStore(state => state.setUser);
  const setSubscription = useUserStore(state => state.setSubscription);
  const setTags = useUserStore(state => state.setTags);
  const setAccounts = useUserStore(state => state.setAccounts);
  const setGroups = useUserStore(state => state.setGroups);
  const setDashboardLayout = useUserStore(state => state.setDashboardLayout);
  const setMoods = useMoodStore(state => state.setMoods);
  const authUserFromStore = useUserStore(state => state.authUser);
  const { user: authUser } = useAuth()
  const timezone = useUserStore(state => state.timezone);
  const groups = useUserStore(state => state.groups);
  const accounts = useUserStore(state => state.accounts);
  const subscription = useUserStore(state => state.subscription);
  const setTickDetails = useTickDetailsStore(state => state.setTickDetails);
  const tickDetails = useTickDetailsStore(state => state.tickDetails);
  const setEvents = useFinancialEventsStore(state => state.setEvents);
  const trades = useTradesStore(state => state.trades);
  const setTrades = useTradesStore(state => state.setTrades);
  const dashboardLayout = useUserStore(state => state.dashboardLayout);
  const locale = useCurrentLocale()
  const isLoading = useUserStore(state => state.isLoading)
  const setIsLoading = useUserStore(state => state.setIsLoading)
  
  
  // Stripe subscription store
  const setStripeSubscription = useStripeSubscriptionStore(state => state.setStripeSubscription);
  const setStripeSubscriptionLoading = useStripeSubscriptionStore(state => state.setIsLoading);
  const setStripeSubscriptionError = useStripeSubscriptionStore(state => state.setError);

  // Local states
  const [sharedParams, setSharedParams] = useState<SharedParams | null>(null);

  // Filter states
  const [instruments, setInstruments] = useState<string[]>([]);
  const [accountNumbers, setAccountNumbers] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tickRange, setTickRange] = useState<TickRange>({ min: undefined, max: undefined });
  const [pnlRange, setPnlRange] = useState<PnlRange>({ min: undefined, max: undefined });
  const [timeRange, setTimeRange] = useState<TimeRange>({ range: null });
  const [tickFilter, setTickFilter] = useState<TickFilter>({ value: null });
  const [weekdayFilter, setWeekdayFilter] = useState<WeekdayFilter>({ day: null });
  const [hourFilter, setHourFilter] = useState<HourFilter>({ hour: null });
  const [tagFilter, setTagFilter] = useState<TagFilter>({ tags: [] });
  const [isFirstConnection, setIsFirstConnection] = useState(false);
  const [strategies, setStrategies] = useState<any[]>([]);

  // Load data from the server - always fetch fresh data
  const loadData = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true)
    
    try {
      if (isSharedView) {
        setIsLoading(false)
        return;
      }

      if (adminView) {
        setIsLoading(false)
        return;
      }

      // Use backend auth context (authUser is already defined at component level)
      if (!authUser?.id) {
        setIsLoading(false)
        return
      }
      const userId = String(authUser.id)

      // Always fetch fresh data
      const [freshTradesResult, strategiesResult] = await Promise.all([
        listTrades({ userId, forceRefresh: true }),
        listStrategies({ userId }).catch(() => ({ strategies: [] })), // Don't fail if strategies fail
      ])
      
      const freshTrades = freshTradesResult?.trades || []
      
      // Set strategies
      if (strategiesResult?.strategies) {
        setStrategies(strategiesResult.strategies)
      }
      
      if (Array.isArray(freshTrades)) {
        // Transform backend format to frontend format
        const transformedTrades = freshTrades.map((trade: any) => ({
          ...trade,
          instrument: trade.instrument || trade.symbol || '',
          side: trade.side || trade.direction || '',
          accountNumber: trade.accountNumber || '',
          entryDate: trade.entryDate || trade.entryDate || '',
          closeDate: trade.closeDate || trade.exitDate || trade.exitDate || '',
          entryPrice: trade.entryPrice || 0,
          closePrice: trade.closePrice || trade.exitPrice || 0,
          quantity: trade.quantity || 1,
          tags: trade.tags || [],
        }))
        setTrades(transformedTrades)
      }
      
      setIsLoading(false)
      



    } catch (error) {
      console.error('Error loading data:', error);
      // Optionally handle specific error cases here
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
      setIsLoading(false);
    }
  }, [isSharedView, params?.slug, timezone, authUser, isLoading, setIsLoading, setTrades, listTrades]);

  // Load data on mount and when isSharedView changes
  useEffect(() => {
    let mounted = true;

    const loadDataIfMounted = async () => {
      if (!mounted) return;
      await loadData();
      // Load Stripe subscription data
      // TODO: Implement getSubscriptionData or remove this call
      // try {
      //   setStripeSubscriptionLoading(true);
      //   const stripeSubscriptionData = await getSubscriptionData();
      //   setStripeSubscription(stripeSubscriptionData);
      //   setStripeSubscriptionError(null);
      // } catch (error) {
      //   console.error('Error loading Stripe subscription:', error);
      //   setStripeSubscriptionError(error instanceof Error ? error.message : 'Failed to load subscription');
      //   setStripeSubscription(null);
      // } finally {
      //   setStripeSubscriptionLoading(false);
      // }
    };

    loadDataIfMounted();

    return () => {
      mounted = false;
    };
  }, [isSharedView]); // Only depend on isSharedView

  // Track ongoing fetch to prevent duplicate requests
  const fetchingRef = useRef(false)
  const lastFetchTimeRef = useRef<number>(0)
  
  const refreshTrades = useCallback(async (forceRefresh: boolean = false, providedUserId?: string | number) => {
    // authUser is already defined at component level
    // Use provided userId if available, otherwise use authUser
    let userId: string | null = null
    
    if (providedUserId) {
      userId = String(providedUserId)
    } else if (authUser?.id) {
      userId = String(authUser.id)
    }
    
    console.log('[refreshTrades] Called with forceRefresh:', forceRefresh, 'authUser:', authUser, 'authUser?.id:', authUser?.id, 'providedUserId:', providedUserId, 'userId:', userId)
    
    // If no userId, wait a bit for auth to load, then try again
    if (!userId && typeof window !== 'undefined') {
      console.log('[refreshTrades] No userId yet, waiting 500ms for auth to load...')
      await new Promise(resolve => setTimeout(resolve, 500))
      // Check again after waiting
      if (providedUserId) {
        userId = String(providedUserId)
      } else if (authUser?.id) {
        userId = String(authUser.id)
      }
    }
    
    if (!userId) {
      console.warn('[refreshTrades] No userId available after all checks (authUser:', authUser, ', providedUserId:', providedUserId, '), cannot fetch trades')
      return
    }
    
    // Request deduplication: Prevent multiple simultaneous requests
    const now = Date.now()
    const timeSinceLastFetch = now - lastFetchTimeRef.current
    
    // Throttle: Don't fetch if we just fetched recently
    // - If forced: allow if > 1 second has passed (prevent spam but allow refresh)
    // - If not forced: allow if > 5 seconds has passed (more aggressive throttling)
    // - If lastFetchTimeRef is 0 (first load), always allow
    const throttleWindow = forceRefresh ? 1000 : 5000
    const isFirstLoad = lastFetchTimeRef.current === 0
    
    if (!isFirstLoad && timeSinceLastFetch < throttleWindow) {
      console.log('[refreshTrades] Throttled - last fetch was', timeSinceLastFetch, 'ms ago (window:', throttleWindow, 'ms)')
      return
    }
    
    if (isFirstLoad) {
      console.log('[refreshTrades] First load detected, bypassing throttle')
    }
    
    // Prevent duplicate concurrent requests
    if (fetchingRef.current) {
      console.log('[refreshTrades] Already fetching, skipping duplicate request')
      return
    }
    
    // Always fetch fresh data - no caching
    setIsLoading(true)
    
    fetchingRef.current = true
    lastFetchTimeRef.current = Date.now()
    
    try {
      const fetchFreshData = async () => {
        try {
          console.log('[refreshTrades] Fetching trades for userId:', userId, 'forceRefresh:', true)
          try {
            const result = await listTrades({ userId, forceRefresh: true })
            console.log('[refreshTrades] API response received:', {
              hasResult: !!result,
              hasTrades: !!(result?.trades),
              tradesCount: result?.trades?.length || 0,
              resultKeys: result ? Object.keys(result) : []
            })
            const freshTrades = result?.trades || []
            console.log('[refreshTrades] Fresh trades received:', freshTrades.length, 'Sample trade:', freshTrades[0])
            
            if (freshTrades.length === 0) {
              console.warn('[refreshTrades] No trades returned from API. This could mean:')
              console.warn('  - User has no trades in database')
              console.warn('  - API returned empty array')
              console.warn('  - Authentication issue')
            }
            
            // SWR: Update with fresh data (replaces stale cached data)
            // Transform backend format to frontend format
            // Backend uses: symbol, direction
            // Frontend expects: instrument, side
            const transformedTrades = Array.isArray(freshTrades) ? freshTrades.map((trade: any) => ({
              ...trade,
              // Map symbol -> instrument (if symbol exists and instrument doesn't)
              instrument: trade.instrument || trade.symbol || '',
              // Map direction -> side (if direction exists and side doesn't)
              side: trade.side || trade.direction || '',
              // Ensure accountNumber exists (use empty string if not present)
              accountNumber: trade.accountNumber || '',
              // Map entryDate/exitDate to entryDate/closeDate if needed
              entryDate: trade.entryDate || trade.entryDate || '',
              closeDate: trade.closeDate || trade.exitDate || trade.exitDate || '',
              // Map entryPrice/exitPrice to entryPrice/closePrice if needed
              entryPrice: trade.entryPrice || 0,
              closePrice: trade.closePrice || trade.exitPrice || 0,
              // Ensure quantity is a number
              quantity: trade.quantity || 1,
              // Ensure tags array exists
              tags: trade.tags || [],
            })) : []
            
            console.log('[refreshTrades] Transformed trades:', {
              count: transformedTrades.length,
              sample: transformedTrades[0],
              allHaveInstrument: transformedTrades.every((t: any) => t.instrument),
              allHaveEntryDate: transformedTrades.every((t: any) => t.entryDate)
            })
            
            if (Array.isArray(transformedTrades)) {
              console.log('[refreshTrades] About to set trades in store. Current trades count:', trades.length)
              setTrades(transformedTrades)
              console.log('[refreshTrades] Trades set successfully. New count should be:', transformedTrades.length)
              
              // Verify the store was updated (check after a small delay)
              setTimeout(() => {
                try {
                  const currentTrades = useTradesStore.getState().trades
                  console.log('[refreshTrades] Verification - trades in store after set:', currentTrades.length)
                  if (currentTrades.length !== transformedTrades.length) {
                    console.error('[refreshTrades] MISMATCH - Store has', currentTrades.length, 'but should have', transformedTrades.length)
                  }
                } catch (err) {
                  console.warn('[refreshTrades] Could not verify store state:', err)
                }
              }, 100)
            } else {
              console.warn('[refreshTrades] Trades is not an array after transformation:', transformedTrades)
            }
          } catch (apiError) {
            console.error('[refreshTrades] Error calling listTrades API:', apiError)
            throw apiError // Re-throw to be caught by outer catch
          }
          
          // Always await fresh data - no caching or background updates
          setIsLoading(false)
          fetchingRef.current = false
        } catch (fetchError) {
          console.error('[refreshTrades] Error fetching trades:', fetchError)
          setIsLoading(false)
          fetchingRef.current = false
          throw fetchError
        }
      }
      
      // Always fetch fresh data
      await fetchFreshData()
    } catch (error) {
      console.error('Error refreshing trades:', error)
      setIsLoading(false)
      fetchingRef.current = false // Reset fetching flag on error
    }
  }, [authUser, locale, setTrades, setUser, setSubscription, setTags, setGroups, setMoods, setEvents, setTickDetails, setAccounts])

  const formattedTrades = useMemo(() => {
    // Early return if no trades or if trades is not an array
    // Don't return empty just because isLoading is true - if we have trades, show them
    console.log('[formattedTrades] Processing trades:', { isLoading, tradesLength: trades?.length, isArray: Array.isArray(trades) })
    if (!trades || !Array.isArray(trades) || trades.length === 0) {
      console.log('[formattedTrades] Early return - no trades available')
      return [];
    }

    // Get hidden accounts for filtering
    const hiddenGroup = groups.find(g => g.name === "Hidden Accounts");
    const hiddenAccountNumbers = accounts
      .filter(a => a.groupId === hiddenGroup?.id)
      .map(a => a.number);

    // Apply all filters in a single pass
    const filtered = trades
      .filter((trade) => {
        // Skip trades from hidden accounts
        if (hiddenAccountNumbers.includes(trade.accountNumber)) {
          console.log('[formattedTrades] Filtered out hidden account:', trade.id)
          return false;
        }

        // Validate entry date
        if (!trade.entryDate) {
          console.warn('[formattedTrades] Trade missing entryDate:', trade.id, trade)
          return false
        }
        const entryDate = new Date(formatInTimeZone(
          new Date(trade.entryDate),
          timezone,
          'yyyy-MM-dd HH:mm:ssXXX'
        ));
        if (!isValid(entryDate)) {
          console.warn('[formattedTrades] Invalid entryDate:', trade.id, trade.entryDate)
          return false
        }

        // Instrument filter
        const tradeAny = trade as any;
        const instrument = tradeAny.instrument || tradeAny.symbol || '';
        if (instruments.length > 0 && !instruments.includes(instrument)) {
          return false;
        }

        // Account filter
        if (accountNumbers.length > 0 && trade.accountNumber && !accountNumbers.includes(trade.accountNumber)) {
          return false;
        }

        // Date range filter
        if (dateRange?.from && dateRange?.to) {
          const tradeDate = startOfDay(entryDate);
          const fromDate = startOfDay(dateRange.from);
          const toDate = endOfDay(dateRange.to);

          if (fromDate.getTime() === startOfDay(toDate).getTime()) {
            // Single day selection
            if (tradeDate.getTime() !== fromDate.getTime()) {
              return false;
            }
          } else {
            // Date range selection
            if (entryDate < fromDate || entryDate > toDate) {
              return false;
            }
          }
        }

        // PnL range filter - ensure P&L is properly parsed as number (handles negative values correctly)
        const tradePnL = typeof trade.pnl === 'number' ? trade.pnl : (trade.pnl !== undefined && trade.pnl !== null ? parseFloat(String(trade.pnl)) : 0)
        if (!isNaN(tradePnL)) {
          if ((pnlRange.min !== undefined && tradePnL < pnlRange.min) ||
            (pnlRange.max !== undefined && tradePnL > pnlRange.max)) {
            return false;
          }
        }

        // Tick filter
        if (tickFilter?.value) {
          // Fix ticker matching logic - sort by length descending to match longer tickers first
          // This prevents "ES" from matching "MES" trades
          const tradeAny = trade as any;
          const instrument = tradeAny.instrument || tradeAny.symbol || '';
          const matchingTicker = Object.keys(tickDetails)
            .sort((a, b) => b.length - a.length) // Sort by length descending
            .find(ticker => instrument.includes(ticker));
          const tickValue = matchingTicker ? (tickDetails[matchingTicker] as any).tickValue : 1;
          const pnlPerContract = Number(trade.pnl) / Number(trade.quantity);
          const tradeTicks = Math.round(pnlPerContract / tickValue);
          const filterValue = tickFilter.value;
          if (filterValue && tradeTicks !== Number(filterValue.replace('+', ''))) {
            return false;
          }
        }

        // Time range filter
        if (timeRange.range) {
          // Calculate timeInPosition from entryDate and closeDate/exitDate if not present
          const tradeAny = trade as any;
          let timeInPosition = tradeAny.timeInPosition;
          if (!timeInPosition && trade.entryDate) {
            const exitDate = tradeAny.closeDate || trade.exitDate;
            if (exitDate) {
              const entry = new Date(trade.entryDate);
              const close = new Date(exitDate);
              if (!isNaN(entry.getTime()) && !isNaN(close.getTime())) {
                timeInPosition = (close.getTime() - entry.getTime()) / 1000; // Convert to seconds
              }
            }
          }
          // Skip filter if timeInPosition cannot be calculated
          if (timeInPosition !== undefined && timeInPosition !== null && getTimeRangeKey(timeInPosition) !== timeRange.range) {
            return false;
          }
        }

        // Weekday filter
        if (weekdayFilter?.day !== null) {
          const dayOfWeek = entryDate.getDay();
          if (dayOfWeek !== weekdayFilter.day) {
            return false;
          }
        }

        // Hour filter
        if (hourFilter?.hour !== null) {
          const hour = entryDate.getHours();
          if (hour !== hourFilter.hour) {
            return false;
          }
        }

        // Tag filter
        if (tagFilter.tags.length > 0) {
          const tradeAny = trade as any;
          const tags = tradeAny.tags || [];
          if (!tags.some((tag: any) => tagFilter.tags.includes(tag))) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = a.entryDate ? parseISO(a.entryDate).getTime() : 0;
        const dateB = b.entryDate ? parseISO(b.entryDate).getTime() : 0;
        return dateA - dateB;
      });
  }, [
    trades,
    groups,
    accounts,
    instruments,
    accountNumbers,
    dateRange,
    pnlRange,
    tickFilter,
    tickDetails,
    timeRange,
    weekdayFilter,
    hourFilter,
    tagFilter,
    timezone
  ]);

  const statistics = useMemo(() => {
    // Ensure formattedTrades is always an array
    const trades = (formattedTrades || []) as any[];
    
    // Calculate statistics including strategies
    const stats = calculateStatistics(trades, accounts, strategies);

    // Calculate gross profits and gross losses including commissions (trades only)
    const grossProfits = trades.reduce((sum, trade) => {
      const totalPnL = (trade.pnl || 0) - (trade.commission || 0);
      return totalPnL > 0 ? sum + totalPnL : sum;
    }, 0);

    const grossLosses = Math.abs(trades.reduce((sum, trade) => {
      const totalPnL = (trade.pnl || 0) - (trade.commission || 0);
      return totalPnL < 0 ? sum + totalPnL : sum;
    }, 0));

    // Calculate profit factor including strategies
    // Add strategy P&L to gross profits and losses
    let strategyGrossProfits = 0
    let strategyGrossLosses = 0
    
    if (strategies && strategies.length > 0) {
      strategies.forEach((strategy: any) => {
        if (!strategy.historicalData) return
        
        let historicalData = strategy.historicalData
        if (typeof historicalData === 'string') {
          try {
            historicalData = JSON.parse(historicalData)
          } catch {
            return
          }
        }
        
        if (historicalData && historicalData.entries && Array.isArray(historicalData.entries)) {
          historicalData.entries.forEach((entry: any) => {
            if (entry.live === undefined || entry.live === null) return
            
            const pnl = typeof entry.live === 'number' ? entry.live : parseFloat(String(entry.live)) || 0
            if (!isNaN(pnl)) {
              if (pnl > 0) {
                strategyGrossProfits += pnl
              } else if (pnl < 0) {
                strategyGrossLosses += Math.abs(pnl)
              }
            }
          })
        }
      })
    }
    
    const totalGrossProfits = grossProfits + strategyGrossProfits
    const totalGrossLosses = grossLosses + strategyGrossLosses
    
    // Calculate profit factor (handle division by zero)
    const totalProfitFactor = totalGrossLosses === 0 ?
      totalGrossProfits > 0 ? Number.POSITIVE_INFINITY : 1 :
      totalGrossProfits / totalGrossLosses;

    return {
      ...stats,
      profitFactor: totalProfitFactor
    };
  }, [formattedTrades, accounts, strategies]);

  const calendarData = useMemo(() => formatCalendarData(formattedTrades || [], accounts), [formattedTrades, accounts]);

  const isPlusUser = () => {
    // Use Stripe subscription store for more accurate subscription status
    const stripeSubscription = useStripeSubscriptionStore.getState().stripeSubscription;
    if (stripeSubscription) {
      const planName = stripeSubscription.plan?.name?.toLowerCase() || '';
      return planName.includes('plus') || planName.includes('pro');
    }
    
    // Fallback to database subscription
    return Boolean(subscription?.status === 'active' && ['plus', 'pro'].includes(subscription?.plan?.split('_')[0].toLowerCase() || ''));
  };


  const saveAccount = useCallback(async (newAccount: Account) => {
    try {
      const { accounts } = useUserStore.getState()
      const currentAccount = accounts.find(acc => acc.number === newAccount.number) as Account
      const payload = { id: currentAccount?.id, userId: newAccount.userId, number: newAccount.number, groupId: newAccount.groupId ?? null, isActive: (newAccount as any).isActive ?? true }
      const res = await upsertAccount(payload as any)
      const saved = res.account
      if (!currentAccount) {
        setAccounts([...accounts, saved])
        if (saved.groupId) {
          setGroups(groups.map(group => group.id === saved.groupId ? { ...group, accounts: [...(group.accounts || []), saved] } : group))
        }
        return
      }
      const updatedAccounts = accounts.map((account: Account) => account.number === saved.number ? { ...account, ...saved } : account)
      setAccounts(updatedAccounts)
    } catch (error) {
      console.error('Error updating account:', error)
      throw error
    }
  }, [accounts, setAccounts, groups, setGroups])


  // Add createGroup function
  const saveGroup = useCallback(async (name: string) => {
    try {
      const userId = useUserStore.getState().user?.id as string
      const { group } = await createGroupApi({ userId: String(userId), name })
      setGroups(([...groups, group]))
      return group
    } catch (error) {
      console.error('Error creating group:', error)
      throw error
    }
  }, [groups, setGroups])

  const renameGroup = useCallback(async (groupId: string, name: string) => {
    try {
      const userId = useUserStore.getState().user?.id as string
      setGroups(groups.map(group => group.id === groupId ? { ...group, name } : group))
      await renameGroupApi({ id: groupId, userId: String(userId), name })
    } catch (error) {
      console.error('Error renaming group:', error)
      throw error
    }
  }, [groups, setGroups])

  // Add deleteGroup function
  const deleteGroup = useCallback(async (groupId: string) => {
    try {
      // Remove groupdId from accounts
      const updatedAccounts = accounts.map((account: Account) => {
        if (account.groupId === groupId) {
          return { ...account, groupId: null }
        }
        return account
      })
      setAccounts(updatedAccounts)
      setGroups(groups.filter(group => group.id !== groupId))
      await deleteGroupApi(groupId)
    } catch (error) {
      console.error('Error deleting group:', error)
      throw error
    }
  }, [accounts, setAccounts])

  // Add moveAccountToGroup function
  const moveAccountToGroup = useCallback(async (accountId: string, targetGroupId: string | null) => {
    try {
      if (!accounts || accounts.length === 0) {
        console.error('No accounts available to move');
        return;
      }

      // Update accounts state
      const updatedAccounts = accounts.map((account: Account) => {
        if (account.id === accountId) {
          return { ...account, groupId: targetGroupId }
        }
        return account
      })
      setAccounts(updatedAccounts)

      // Update groups state
      const accountToMove = accounts.find(acc => acc.id === accountId)
      if (accountToMove) {
        setGroups(groups.map(group => {
          // If this is the target group, add the account only if it's not already there
          if (group.id === targetGroupId) {
            const accountExists = group.accounts.some(acc => acc.id === accountId)
            return {
              ...group,
              accounts: accountExists ? group.accounts : [...group.accounts, accountToMove]
            }
          }
          // For all other groups, remove the account if it exists
          return { ...group, accounts: group.accounts.filter(acc => acc.id !== accountId) }
        }))
      }

      // Persist by updating the account
      const account = accounts.find(a => a.id === accountId)
      if (account) {
        await upsertAccount({ id: account.id, userId: account.userId, number: account.number, groupId: targetGroupId })
      }
    } catch (error) {
      console.error('Error moving account to group:', error)
      throw error
    }
  }, [accounts, setAccounts, setGroups, groups])

  // Add savePayout function
  const savePayout = useCallback(async (payout: PrismaPayout) => {
    if (isSharedView) return;

    try {
      const { payout: newPayout } = await savePayoutApi({ id: payout.id, userId: (useUserStore.getState().user as any)?.id, accountNumber: payout.accountNumber, amount: payout.amount })

      // Update local state
      setAccounts(accounts.map((account: Account) => {
        if (account.number === payout.accountNumber) {
          const existingPayouts = account.payouts || [];
          const isUpdate = payout.id && existingPayouts.some(p => p.id === payout.id);
          
          if (isUpdate) {
            // Update existing payout
            return {
              ...account,
              payouts: existingPayouts.map(p => p.id === payout.id ? newPayout : p)
            };
          } else {
            // Add new payout
            return {
              ...account,
              payouts: [...existingPayouts, newPayout]
            };
          }
        }
        return account;
      })
      );

    } catch (error) {
      console.error('Error saving payout:', error);
      throw error;
    }
  }, [isSharedView, accounts, setAccounts]);

  // Add deleteAccount function
  const deleteAccount = useCallback(async (account: Account) => {
    if (isSharedView) return;

    try {
      // Update local state
      setAccounts(accounts.filter(acc => acc.id !== account.id));
      // Delete from database
      await deleteAccountApi(account.id);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }, [isSharedView, accounts, setAccounts]);

  // Add deletePayout function
  const deletePayout = useCallback(async (payoutId: string) => {
    if (isSharedView) return;

    try {
      setAccounts(accounts.map((account: Account) => ({
        ...account,
        payouts: account.payouts?.filter(p => p.id !== payoutId) || []
      })
      ));

      // Delete from database
      await deletePayoutApi(payoutId);

    } catch (error) {
      console.error('Error deleting payout:', error);
      throw error;
    }
  }, [isSharedView, accounts, setAccounts]);

  const changeIsFirstConnection = useCallback(async (isFirstConnection: boolean) => {
    // authUser is already defined at component level
    if (!authUser?.id) return
    // Update local state
    setIsFirstConnection(isFirstConnection)
    // TODO: Update user isFirstConnection status via backend API if needed
    // This would require a backend endpoint like PUT /users/:id with { isFirstConnection }
  }, [authUser, setIsFirstConnection])

  const updateTrades = useCallback(async (tradeIds: string[], update: Partial<PrismaTrade>) => {
    const updatedTrades = trades.map(
      trade =>
        tradeIds.includes(trade.id) ? {
          ...trade,
          ...update
        } : trade
    )
    setTrades(updatedTrades)
    // Persist each trade (no bulk endpoint yet)
    const { updateTrade } = await import('@/lib/services/trades')
    await Promise.all(tradeIds.map(id => updateTrade({ id, ...update } as any)))
    
    // SMART CACHING: Mark trades as changed
  }, [trades, setTrades])

  const groupTrades = useCallback(async (tradeIds: string[]) => {
    setTrades(trades.map(trade => ({
      ...trade,
      groupId: tradeIds[0]
    })))
    // TODO: implement backend grouping
    
    // SMART CACHING: Mark trades as changed
  }, [trades, setTrades])

  const ungroupTrades = useCallback(async (tradeIds: string[]) => {
    setTrades(trades.map(trade => ({
      ...trade,
      groupId: null
    })))
    // TODO: implement backend ungrouping
    
    // SMART CACHING: Mark trades as changed
  }, [trades, setTrades])

  const saveDashboardLayout = useCallback(async (layout: PrismaDashboardLayout) => {
    try {
      // authUser is already defined at component level
      if (!authUser?.id) return
      
      setDashboardLayout(layout)
      // TODO: Save dashboard layout via backend API if needed
      // This would require a backend endpoint like PUT /users/:id/dashboard-layout
      
      // SMART CACHING: Mark dashboard layout as changed
    } catch (error) {
      console.error('Error saving dashboard layout:', error)
      throw error
    }
  }, [authUser, setDashboardLayout])

  const contextValue: DataContextType = {
    isPlusUser,
    isLoading,
    isMobile,
    isSharedView,
    sharedParams,
    setSharedParams,
    refreshTrades,
    changeIsFirstConnection,
    isFirstConnection,
    setIsFirstConnection,

    // Formatted trades and filters
    formattedTrades: formattedTrades || [],
    instruments,
    setInstruments,
    accountNumbers,
    setAccountNumbers,
    dateRange,
    setDateRange,
    tickRange,
    setTickRange,
    pnlRange,
    setPnlRange,

    // Time range related
    timeRange,
    setTimeRange,

    // Tick filter related
    tickFilter,
    setTickFilter,

    // Weekday filter related
    weekdayFilter,
    setWeekdayFilter,

    // Hour filter related
    hourFilter,
    setHourFilter,

    // Tag filter
    tagFilter,
    setTagFilter,

    // Statistics and calendar
    statistics,
    calendarData,

    // Mutations

    // Update trade
    updateTrades,
    groupTrades,
    ungroupTrades,

    // Accounts
    deleteAccount,
    saveAccount,

    // Group functions
    saveGroup,
    renameGroup,
    deleteGroup,
    moveAccountToGroup,

    // Payout functions
    deletePayout,
    savePayout,

    // Dashboard layout
    saveDashboardLayout,
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Add getTimeRangeKey function at the top level
function getTimeRangeKey(timeInPosition: number): string {
  const minutes = timeInPosition / 60 // Convert seconds to minutes
  if (minutes < 1) return 'under1min'
  if (minutes >= 1 && minutes < 5) return '1to5min'
  if (minutes >= 5 && minutes < 10) return '5to10min'
  if (minutes >= 10 && minutes < 15) return '10to15min'
  if (minutes >= 15 && minutes < 30) return '15to30min'
  if (minutes >= 30 && minutes < 60) return '30to60min'
  if (minutes >= 60 && minutes < 120) return '1to2hours'
  if (minutes >= 120 && minutes < 300) return '2to5hours'
  return 'over5hours'
}
