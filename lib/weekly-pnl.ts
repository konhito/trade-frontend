type Point = { date: string; pnl: number }

export function getWeeklyPnl(points: Point[], weekdays: number[], today: string) {
  const monday = new Date(`${today}T00:00:00Z`)
  monday.setUTCDate(monday.getUTCDate() - (monday.getUTCDay() + 6) % 7)

  return Array.from({ length: 4 }, (_, index) => {
    const start = new Date(monday)
    start.setUTCDate(start.getUTCDate() - (3 - index) * 7)
    const end = new Date(start)
    end.setUTCDate(end.getUTCDate() + 6)
    const from = start.toISOString().slice(0, 10)
    const to = end.toISOString().slice(0, 10)
    const matches = points.filter(({ date }) => date >= from && date <= to && date <= today &&
      (weekdays.length === 0 || weekdays.includes(new Date(`${date}T00:00:00Z`).getUTCDay())))

    return {
      week: index === 3 ? 'This week' : `Week ${index + 1}`,
      range: `${from} – ${to}`,
      pnl: matches.length ? matches.reduce((total, point) => total + point.pnl, 0) : null,
    }
  })
}
