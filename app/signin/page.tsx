'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SignInForm } from '../authentication/components/sign-in-form'
import { useAuth } from '@/context/auth-provider'
import { Loader2, Quote } from 'lucide-react'
import { Logo } from '@/components/logo'

// Trading quotes for the overlay
const existingTradingQuotes = [
  {
    quote: "The goal of a successful trader is to make the best trades. Money is secondary.",
    author: "Alexander Elder"
  },
  {
    quote: "Risk comes from not knowing what you're doing.",
    author: "Warren Buffett"
  },
  {
    quote: "The market can remain irrational longer than you can remain solvent.",
    author: "John Maynard Keynes"
  },
  {
    quote: "In trading, consistency beats perfection every time.",
    author: "Professional Trader"
  },
  {
    quote: "The best traders have no ego. You have to swallow your pride and get out of a losing position.",
    author: "Paul Tudor Jones"
  },
  {
    quote: "It's not whether you're right or wrong that's important, but how much money you make when you're right and how much you lose when you're wrong.",
    author: "George Soros"
  },
  {
    quote: "The most important thing in trading is to preserve capital. Profits will follow.",
    author: "Trading Wisdom"
  },
  {
    quote: "Plan your trade and trade your plan. Discipline is the bridge between goals and accomplishment.",
    author: "Trading Mantra"
  }
]

const additionalTradingQuotes = [
  // Risk and position sizing
  "A small position gives a good idea room to prove itself.",
  "Capital survives first; opinions can be replaced.",
  "Risk is a number before an entry, not an excuse after.",
  "Size positions so one wrong forecast stays routine.",
  "An uncertain setup deserves a smaller position.",
  "Your stop belongs where the thesis fails, not where fear begins.",
  "Every trade has a price for being wrong; know it first.",
  "Risk limits make tomorrow's decisions possible.",
  "A portfolio is safer when risks do not all rhyme.",
  "Leverage turns small errors into loud lessons.",
  "A good entry can still carry a bad amount of risk.",
  "Respect gap risk when a stop cannot guarantee its price.",
  "Protecting principal keeps compounding in the game.",
  "Recalculate exposure when volatility changes the distance to risk.",
  "Concentration can reward conviction and punish certainty.",
  "The risk you cannot see deserves more attention than the risk you can name.",
  "Keep cash for opportunities you cannot schedule.",
  "Risk belongs in the plan before profit enters the picture.",
  "No single trade should decide your financial future.",
  "Know the worst reasonable outcome before buying the best possible story.",
  // Discipline and process
  "A written plan outlasts a strong mood.",
  "Repeatable decisions make results easier to understand.",
  "Discipline is following your rules when the chart argues back.",
  "A checklist turns memory into process.",
  "Review the decision separately from its outcome.",
  "Good process can lose; bad process can win.",
  "Consistency comes from controls, not confidence.",
  "Trade the setup you prepared, not the story unfolding.",
  "A plan is useful only when it names an exit.",
  "A journal reveals habits that a balance hides.",
  "Patience is part of execution, not a pause before it.",
  "Set rules while calm so panic has less to decide.",
  "The best trade may be the one your rules exclude.",
  "A missed trade costs less than an unplanned one.",
  "Use alerts to protect attention, not to manufacture urgency.",
  "Preparation narrows the choices you must make live.",
  "Separate a market signal from your wish to act.",
  "A review turns yesterday's result into tomorrow's input.",
  "Follow a method long enough to learn where it fails.",
  "Discipline protects a strategy from its owner.",
  // Probability and uncertainty
  "A forecast is a scenario, not a promise.",
  "Probabilities guide decisions; they do not guarantee outcomes.",
  "A single trade cannot grade a strategy.",
  "Expect losing streaks inside a profitable system.",
  "The market owes no setup a follow-through.",
  "Uncertainty is part of the price of participation.",
  "Think in ranges when precision is invented.",
  "A thesis can be sound and still arrive too early.",
  "Confidence should describe your process, not the next candle.",
  "Good odds still need good sizing.",
  "Change your mind when the evidence changes.",
  "Risk and probability belong in the same sentence.",
  "A high win rate can hide a costly loss.",
  "Sample size turns anecdotes into evidence.",
  "A scenario tree is more honest than a single target.",
  "Backtests describe assumptions as much as markets.",
  "Historical patterns are clues, not contracts.",
  "If the thesis depends on certainty, it depends on fiction.",
  "Let outcomes update probabilities, not rewrite the past.",
  "There is no certainty premium worth paying blindly.",
  // Losses and exits
  "Take a planned loss before it becomes a forced decision.",
  "A small loss preserves room for a better idea.",
  "An exit is part of the trade, not its defeat.",
  "Hope is not an order type.",
  "Cut exposure when the reason for holding disappears.",
  "Admit a thesis broke before the account proves it.",
  "The cost of a mistake rises when you refuse to name it.",
  "No recovery plan is safer than a limit set beforehand.",
  "A loss can be tuition if the lesson changes the process.",
  "Never average down without a fresh thesis and a fresh risk limit.",
  "Exit rules keep regret from managing the position.",
  "Closing a trade does not require closing your mind.",
  "A loss you planned is easier to review than one you hid.",
  "Avoid turning a short-term trade into a long-term explanation.",
  "The market does not know your entry price.",
  "Protect the account before defending a prediction.",
  "Loss aversion can make a bad position feel familiar.",
  "A stop is a tool, not a guarantee against every gap.",
  "If you cannot explain the exit, you may not have an exit.",
  "Accepting a loss is cheaper than bargaining with it.",
  // Profits and edge
  "Let winners work only while the thesis still works.",
  "An edge is a measured advantage, not a memorable win.",
  "Profit is useful; repeatability is more useful.",
  "A winning trade does not prove a winning method.",
  "Take profits according to the plan you tested.",
  "Better execution can matter more than a better forecast.",
  "A strategy earns trust through many decisions.",
  "The next trade is a new distribution, not a sequel.",
  "Treat unrealized gains with the same risk discipline.",
  "Sustainable returns prefer boring math to dramatic stories.",
  "A small edge needs careful costs and steady execution.",
  "Gains grow more reliably when risk stays bounded.",
  "A good trade can be one that loses within plan.",
  "Keep the process when a lucky result flatters you.",
  "Profit targets are hypotheses that need context.",
  "Winning often is not the same as earning well.",
  "Measure expectancy across a meaningful sample.",
  "A good exit converts possibility into a booked result.",
  "Protect the edge from fees, haste, and overtrading.",
  "Let evidence, not excitement, define a strategy's size.",
  // Capital and liquidity
  "Capital is time and choice stored in an account.",
  "Liquidity buys flexibility when plans become stale.",
  "Cash can be a position with a purpose.",
  "Emergency savings belong outside market risk.",
  "A reserve can keep a temporary shock from becoming a permanent sale.",
  "Avoid borrowing against a future you cannot guarantee.",
  "Financial resilience begins before the next market surprise.",
  "Keep near-term goals away from long-term volatility.",
  "The strongest balance sheet can wait for better terms.",
  "Liquidity has value even when it earns no applause.",
  "Capital preservation is a strategy for staying present.",
  "Match an investment's time horizon to the money's purpose.",
  "A portfolio should leave room for real life.",
  "Solvency matters more than being right eventually.",
  "Leverage borrows not only money, but also time.",
  "Fund investments with money you can leave invested.",
  "Financial freedom grows from margin between income and spending.",
  "Cash flow makes a portfolio easier to hold.",
  "Reserves turn a crisis into a decision.",
  "Build the runway before testing a new strategy.",
  // Volatility and market behavior
  "Volatility changes position size before it changes your opinion.",
  "Wide ranges call for wider patience and clearer limits.",
  "Quiet markets can still carry hidden risk.",
  "Volatility is movement; risk is what movement costs you.",
  "A fast market punishes slow assumptions.",
  "Liquidity can disappear exactly when everyone needs it.",
  "Price gaps remind us that stops are not promises.",
  "A calm chart is not proof of a calm portfolio.",
  "When volatility expands, reduce the amount you can lose.",
  "Market noise grows louder when your timeframe is unclear.",
  "Do not confuse a large candle with new information.",
  "Thin liquidity can magnify an ordinary order.",
  "A range can be a market's honest answer.",
  "Volatility rewards preparation and charges improvisation.",
  "Fast price action shortens the time available to decide.",
  "Correlations tend to matter most when stress arrives.",
  "Markets can trend and reverse without asking your permission.",
  "A breakout needs follow-through, not just a headline.",
  "A pullback can be normal and still exceed your budget.",
  "Risk limits should travel with market conditions.",
  // Investing and valuation
  "Price is visible; value is a model with assumptions.",
  "A cheap asset can remain cheap for a long time.",
  "Valuation is a range shaped by uncertain cash flows.",
  "Revenue growth matters less when margins keep disappearing.",
  "Cash flow can test the quality of reported earnings.",
  "A strong company can still be a weak investment at the wrong price.",
  "Diversification reduces dependence on any single forecast.",
  "Ownership is a claim on future business outcomes.",
  "Invest in a thesis you can explain without a chart.",
  "Returns depend on the purchase price as well as the business.",
  "An attractive story still needs numbers that work.",
  "Debt changes how much of a business belongs to equity.",
  "A durable advantage should show up in customer behavior.",
  "Growth without discipline can dilute shareholder value.",
  "Prefer clear assumptions to precise-looking estimates.",
  "A valuation model is a map, never the territory.",
  "Diversify by sources of risk, not only by ticker symbols.",
  "Patience can be an investment edge when fundamentals stay intact.",
  "Revisit the thesis when the business changes.",
  "An investment plan begins with a reason to own.",
  // Compounding and time
  "Compounding rewards time more than dramatic timing.",
  "Small fees repeat just as returns do.",
  "Reinvested gains need years, not slogans.",
  "Consistency gives compounding something to multiply.",
  "A high return cannot compound if capital leaves the game.",
  "Time in a sound plan beats constant rearrangement.",
  "Compounding works both ways on debt and fees.",
  "Growth becomes visible after many quiet periods.",
  "Patience is an input to long-term returns.",
  "Start with a savings rate you can sustain.",
  "Reinvestment makes yesterday's gains part of tomorrow's base.",
  "Compounding favors a steady contribution over a perfect entry.",
  "Avoid interrupting a plan for every market headline.",
  "A long horizon is useful only if the asset can last.",
  "Small advantages become meaningful when repeated.",
  "Let time help a process, not excuse a weak investment.",
  "Compounding is math with a behavioral requirement.",
  "Returns are uncertain; saving consistently is controllable.",
  "A patient portfolio still needs occasional maintenance.",
  "Boring contributions can build remarkable optionality.",
  // Personal finance
  "A budget gives each rupee a job before it disappears.",
  "Spending plans turn income into choices.",
  "Save for shocks before investing for returns.",
  "A goal becomes useful when it has a date and amount.",
  "Financial plans should survive ordinary bad months.",
  "Track cash flow before chasing portfolio complexity.",
  "High-interest debt can outpace a careful investment return.",
  "The best financial plan is one you can keep.",
  "Separate essential money from experimental capital.",
  "A safety net gives investments time to recover.",
  "Net worth is a snapshot; cash flow is a movie.",
  "Good money habits reduce the pressure to predict markets.",
  "Match risk to the goal, not the mood.",
  "Review insurance before the emergency.",
  "Automate saving when willpower is busy.",
  "Avoid building a budget that depends on perfect discipline.",
  "Financial confidence grows when spending matches priorities.",
  "Know your obligations before estimating investable cash.",
  "A plan can be simple and still be complete.",
  "Measure progress by goals funded, not headlines followed.",
  // Economics and macro
  "Interest rates change the price of waiting.",
  "Inflation quietly edits every long-term target.",
  "Real returns subtract the cost of rising prices.",
  "Monetary policy affects markets through many uneven paths.",
  "An economic forecast should carry a margin of humility.",
  "Employment data is a signal, not a whole economy.",
  "Currency moves can change an overseas return.",
  "Fiscal choices reach markets with lags and tradeoffs.",
  "Bond prices respond when expected rates shift.",
  "Yield is only one part of a bond's risk.",
  "Credit spreads reveal how investors price uncertainty.",
  "Inflation hedges can disappoint when their assumptions fail.",
  "A recession is an outcome, not a trading signal by itself.",
  "GDP summarizes activity; it does not describe every household.",
  "Interest expense matters more as refinancing approaches.",
  "Macro narratives travel faster than their evidence.",
  "Data revisions deserve space in a confident forecast.",
  "Real wages matter more than nominal headlines to a household.",
  "Policy risk is part of valuation, even when hard to model.",
  "Avoid treating one data point as a new regime.",
  // Research and measurement
  "A spreadsheet cannot rescue a question asked badly.",
  "Clean data makes weak assumptions easier to spot.",
  "Backtest costs that live trading will actually charge.",
  "Separate in-sample stories from out-of-sample evidence.",
  "A strategy should survive more than its favorite period.",
  "Record the rules before measuring the result.",
  "Benchmarks give performance a useful reference point.",
  "A chart is evidence only when its scale is honest.",
  "Historical averages can hide painful sequences.",
  "Test sensitivity to fees, slippage, and missing data.",
  "Good research keeps its assumptions visible.",
  "The smallest sample often tells the loudest story.",
  "Look for what would disprove your thesis.",
  "Data quality is part of investment quality.",
  "A model should show where it is most fragile.",
  "Compare like with like before ranking performance.",
  "Write down what you expect before seeing the result.",
  "Outliers can expose a model's hidden dependence.",
  "A good forecast includes what would change it.",
  "Learn from the trades you did not take as well.",
  // Execution and costs
  "Fees are certain; returns are not.",
  "Slippage turns a paper edge into a smaller live one.",
  "Use limit orders when price matters more than certainty of fill.",
  "A filled order is not automatically a good decision.",
  "Execution quality includes what happens after the click.",
  "Reduce unnecessary trades before optimizing the order type.",
  "Every extra transaction asks the edge to pay again.",
  "Speed matters only when the plan requires it.",
  "Check the spread before blaming the strategy.",
  "A market order trades certainty of fill for price uncertainty.",
  "Automation follows rules literally, so write rules carefully.",
  "A trading system is only as robust as its failure handling.",
  "Review rejects and partial fills, not just completed trades.",
  "Operational mistakes belong in performance analysis.",
  "Keep records before memory starts editing the trade.",
  "Reconcile the account before trusting a report.",
  "A small fee repeated daily becomes a strategy variable.",
  "Do not turn a delayed fill into a new thesis.",
  "A clear order plan lowers execution stress.",
  "Simplicity helps when markets move quickly.",
  // Psychology and resilience
  "Fear shrinks the view to the next tick.",
  "Euphoria can make risk limits feel optional.",
  "Confidence improves when it survives a written review.",
  "A trading break can be a risk control.",
  "FOMO is a feeling, not a market signal.",
  "Protect attention from price checks without purpose.",
  "Losses hurt less when they were budgeted.",
  "Emotional control starts with position size.",
  "A calm process beats a brave impulse.",
  "Do not let one result define your skill.",
  "The market tests habits that success can hide.",
  "Reset after a loss before making another decision.",
  "A crowded mind is a costly execution tool.",
  "Boredom is not evidence that a trade is missing.",
  "Patience means waiting without inventing confirmation.",
  "Confidence and caution can share the same plan.",
  "Be curious about mistakes and strict about repeated ones.",
  "Protect sleep from positions sized too large.",
  "Success should not erase the limits that enabled it.",
  "Reflection turns emotion into information.",
  // Trading practice
  "A watchlist is a boundary around your attention.",
  "Fewer, clearer setups are easier to evaluate.",
  "Every market has a time when your edge is absent.",
  "Do not confuse activity with progress.",
  "A trading routine should include a stopping point.",
  "The best signal is useless if you cannot afford its risk.",
  "Keep strategy rules aligned with the timeframe.",
  "A setup needs context, trigger, invalidation, and size.",
  "Market structure is a tool, not an oracle.",
  "An indicator can summarize price without explaining it.",
  "Let volume add context; never let it promise direction.",
  "News can change price before it clarifies value.",
  "A watchlist should prioritize, not predict.",
  "Observe first when conditions are outside your playbook.",
  "Do not force a trend onto a sideways market.",
  "Trading frequency should follow opportunity, not boredom.",
  "A clean setup is easier to manage than a perfect story.",
  "Keep one risk budget across strategies that share exposure.",
  "The best market read includes a plan to do nothing.",
  "Stay in the game long enough to learn what works."
]

const tradingQuotes = [
  ...existingTradingQuotes,
  ...additionalTradingQuotes.map((quote) => ({ quote, author: 'MyTradeJournal' }))
]

function SignInContent() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasRedirected = useRef(false)
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  const getRedirectUrl = () => {
    let nextUrl = searchParams.get('next') || '/dashboard'
    // Decode the next URL if it exists and is not the default
    if (nextUrl && nextUrl !== '/dashboard') {
      try {
        nextUrl = decodeURIComponent(nextUrl)
        // Ensure it's a valid path starting with /
        if (!nextUrl.startsWith('/')) {
          nextUrl = '/dashboard'
        }
      } catch {
        // If decoding fails, default to dashboard
        nextUrl = '/dashboard'
      }
    }
    return nextUrl
  }

  // Handle OAuth callback token
  useEffect(() => {
    const token = searchParams.get('token')
    if (token && typeof window !== 'undefined') {
      // Store token from OAuth callback
      localStorage.setItem('token', token)
      // Dispatch event to notify auth system
      window.dispatchEvent(new Event('auth-token-stored'))
      // Remove token from URL
      const newUrl = window.location.pathname + (searchParams.get('next') ? `?next=${encodeURIComponent(searchParams.get('next')!)}` : '')
      window.history.replaceState({}, '', newUrl)
      // Redirect will happen via auth-token-stored event
      return
    }
  }, [searchParams])

  useEffect(() => {
    // If already authenticated, redirect to dashboard or next URL
    // Only redirect if we're actually authenticated (not just loading state)
    if (!isLoading && isAuthenticated && !hasRedirected.current) {
      // Check if we actually have a valid token before redirecting
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        hasRedirected.current = true
        const redirectUrl = getRedirectUrl()
        // Use router.push instead of window.location to avoid full page reload loops
        router.replace(redirectUrl)
      }
    }
  }, [isAuthenticated, isLoading, router, searchParams])

  // Also listen for auth token stored event (fired immediately after login)
  useEffect(() => {
    const handleAuthTokenStored = () => {
      if (!hasRedirected.current) {
        // Verify token actually exists before redirecting
        const token = localStorage.getItem('token')
        if (token) {
          hasRedirected.current = true
          // Small delay to ensure auth state is fully updated
          setTimeout(() => {
            const redirectUrl = getRedirectUrl()
            router.replace(redirectUrl)
          }, 300)
        }
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('auth-token-stored', handleAuthTokenStored)
      return () => window.removeEventListener('auth-token-stored', handleAuthTokenStored)
    }
  }, [router, searchParams])

  // Pick one quote per local calendar day, then update at the next midnight.
  useEffect(() => {
    let quoteTimeout: ReturnType<typeof setTimeout>
    const updateDailyQuote = () => {
      const now = new Date()
      const dayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000)
      setCurrentQuoteIndex(dayNumber % tradingQuotes.length)

      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      quoteTimeout = setTimeout(updateDailyQuote, nextMidnight.getTime() - now.getTime())
    }

    updateDailyQuote()
    return () => clearTimeout(quoteTimeout)
  }, [])

  // Show loading state while checking authentication (but don't show loading if we have a token)
  // This prevents showing loading screen after successful login
  const hasToken = typeof window !== 'undefined' && localStorage.getItem('token')
  if (isLoading && !hasToken) {
    return (
      <div className="container relative flex min-h-screen flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render the form if already authenticated (redirect will happen)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center p-4 md:grid md:h-screen md:p-0 lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900">
          <img
            src="/auth-background.jpeg"
            alt="Authentication background"
            className="h-full w-full object-cover"
          />
        </div>
        {/* Overlay with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/90 via-zinc-900/80 to-zinc-900/90" />
        
        {/* Additional overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40" />
        
        <div className="relative z-20 flex items-center gap-0.5 font-medium">
          <Logo width={100} height={100} className="pt-2" />
          <span className="text-white text-2xl font-bold pt-4">MyTradeJournal</span>
        </div>
        
        {/* Trading Quotes Overlay */}
        <div className="relative z-20 flex-1 flex items-center justify-center">
          <div className="max-w-lg px-4">
            <div className="mb-6 flex items-center justify-center">
              <Quote className="h-8 w-8 text-white/60" />
            </div>
            <div 
              key={currentQuoteIndex}
              className="quote-slide"
            >
              <blockquote className="space-y-4">
                <p className="text-xl md:text-2xl font-medium leading-relaxed text-white drop-shadow-lg">
                  &ldquo;{tradingQuotes[currentQuoteIndex].quote}&rdquo;
                </p>
                <footer className="text-sm md:text-base text-white/70 italic">
                  — {tradingQuotes[currentQuoteIndex].author}
                </footer>
              </blockquote>
            </div>
            
            <style>{`
              .quote-slide {
                animation: fadeInUp 0.6s ease-in-out;
              }
              
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
            
            <p className="mt-8 text-center text-xs text-white/60">A new market insight each day</p>
          </div>
        </div>
      </div>
      <div className="w-full p-4 md:p-8 lg:p-8">
        <div className="mx-auto flex w-full max-w-[350px] flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center px-2">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Sign in to your account
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              Enter your email and password to sign in
            </p>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="container relative flex min-h-screen flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}

