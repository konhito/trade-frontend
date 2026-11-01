export function getTrackerStatistics(points: { pnl: number }[]) {
  let grossProfit = 0
  let grossLoss = 0
  let balance = 0
  let peak = 0
  let maxDrawdown = 0
  let wins = 0
  let losses = 0
  let longestWinningStreak = 0
  let longestLosingStreak = 0

  for (const { pnl } of points) {
    grossProfit += Math.max(0, pnl)
    grossLoss += Math.max(0, -pnl)
    balance += pnl
    peak = Math.max(peak, balance)
    maxDrawdown = Math.max(maxDrawdown, peak - balance)
    wins = pnl > 0 ? wins + 1 : 0
    losses = pnl < 0 ? losses + 1 : 0
    longestWinningStreak = Math.max(longestWinningStreak, wins)
    longestLosingStreak = Math.max(longestLosingStreak, losses)
  }

  return { grossProfit, grossLoss, maxDrawdown, longestWinningStreak, longestLosingStreak }
}
