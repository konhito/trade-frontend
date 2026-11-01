import assert from 'node:assert/strict'
import test from 'node:test'
import { getTrackerStatistics } from './tracker-statistics.ts'

test('weekly statistics include initial losses, recovery and breakeven streak resets', () => {
  const points = [-20, -10, 50, 20, 0, 10, -40].map(pnl => ({ pnl }))
  assert.deepEqual(getTrackerStatistics(points), {
    grossProfit: 80, grossLoss: 70, maxDrawdown: 40,
    longestWinningStreak: 2, longestLosingStreak: 2,
  })
  assert.deepEqual(getTrackerStatistics(points.map(({ pnl }) => ({ pnl: pnl * 3 }))), {
    grossProfit: 240, grossLoss: 210, maxDrawdown: 120,
    longestWinningStreak: 2, longestLosingStreak: 2,
  })
})

test('empty, winning-only and losing-only histories are handled', () => {
  assert.deepEqual(getTrackerStatistics([]), {
    grossProfit: 0, grossLoss: 0, maxDrawdown: 0,
    longestWinningStreak: 0, longestLosingStreak: 0,
  })
  assert.equal(getTrackerStatistics([{ pnl: 10 }, { pnl: 20 }]).maxDrawdown, 0)
  assert.equal(getTrackerStatistics([{ pnl: -10 }, { pnl: -20 }]).maxDrawdown, 30)
})
