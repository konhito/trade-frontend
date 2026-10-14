import assert from 'node:assert/strict'
import test from 'node:test'
import { getWeeklyPnl } from './weekly-pnl.ts'

test('four Monday–Sunday weeks include this week and respect the weekday filter', () => {
  const points = [
    { date: '2026-09-14', pnl: 1000 }, // older than the window
    { date: '2026-09-21', pnl: 10 },
    { date: '2026-09-22', pnl: 5 },
    { date: '2026-09-28', pnl: -20 },
    { date: '2026-10-05', pnl: 30 },
    { date: '2026-10-11', pnl: 7 },
    { date: '2026-10-12', pnl: 40 },
    { date: '2026-10-13', pnl: -4 },
    { date: '2026-10-15', pnl: 1000 }, // future result
  ]

  assert.deepEqual(getWeeklyPnl(points, [], '2026-10-14').map(({ week, pnl }) => [week, pnl]), [
    ['Week 1', 15], ['Week 2', -20], ['Week 3', 37], ['This week', 36],
  ])
  assert.deepEqual(getWeeklyPnl(points, [1], '2026-10-14').map(({ pnl }) => pnl), [10, -20, 30, 40])
  assert.deepEqual(getWeeklyPnl(points, [3], '2026-10-14').map(({ pnl }) => pnl), [null, null, null, null])
  assert.equal(getWeeklyPnl(points, [], '2026-10-14')[3].range, '2026-10-12 – 2026-10-18')
})
