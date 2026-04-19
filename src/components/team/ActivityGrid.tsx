'use client'

interface DayActivity {
  date: string
  count: number
}

interface ActivityGridProps {
  days: DayActivity[]
  totalTasks: number
}

export default function ActivityGrid({ days }: ActivityGridProps) {
  const today = new Date()
  const WEEKS = 52

  const countMap: Record<string, number> = {}
  for (const d of days) {
    countMap[d.date] = (countMap[d.date] ?? 0) + d.count
  }

  // Build grid starting from (today - 364 days), aligned to Monday
  const startDate = new Date(today)
  startDate.setDate(startDate.getDate() - WEEKS * 7 + 1)
  const dow = startDate.getDay()
  const toMon = dow === 0 ? 6 : dow - 1
  startDate.setDate(startDate.getDate() - toMon)

  const todayStr = today.toISOString().split('T')[0]

  const grid: { date: string; count: number; isToday: boolean; isFuture: boolean }[] = []
  for (let i = 0; i < WEEKS * 7; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    grid.push({
      date: dateStr,
      count: countMap[dateStr] ?? 0,
      isToday: dateStr === todayStr,
      isFuture: dateStr > todayStr,
    })
  }

  const maxCount = Math.max(...grid.map(g => g.count), 1)

  function getColor(count: number, isFuture: boolean): string {
    if (isFuture) return 'rgba(187,225,250,0.03)'
    if (count === 0) return 'rgba(187,225,250,0.07)'
    const t = count / maxCount
    if (t < 0.25) return 'rgba(50,130,184,0.3)'
    if (t < 0.5)  return 'rgba(50,130,184,0.55)'
    if (t < 0.75) return 'rgba(50,130,184,0.75)'
    return '#3282b8'
  }

  // Month label for the first week it appears
  const monthLabels: Record<number, string> = {}
  let lastMonth = -1
  for (let w = 0; w < WEEKS; w++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + w * 7)
    if (d.getMonth() !== lastMonth) {
      lastMonth = d.getMonth()
      monthLabels[w] = d.toLocaleString('default', { month: 'short' })
    }
  }

  const DAY_LABELS = ['M', '', 'W', '', 'F', '', '']

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Month labels row */}
      <div style={{ display: 'flex', paddingLeft: '18px', marginBottom: '4px', gap: '2px' }}>
        {Array.from({ length: WEEKS }).map((_, w) => (
          <div key={w} style={{ width: '11px', flexShrink: 0 }}>
            {monthLabels[w] && (
              <span style={{ fontSize: '9px', color: 'rgba(187,225,250,0.4)', whiteSpace: 'nowrap' }}>
                {monthLabels[w]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', gap: '2px' }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px' }}>
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              style={{
                width: '12px',
                height: '11px',
                fontSize: '8px',
                color: 'rgba(187,225,250,0.35)',
                lineHeight: '11px',
                textAlign: 'right',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {Array.from({ length: WEEKS }).map((_, w) => (
          <div key={w} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {Array.from({ length: 7 }).map((_, d) => {
              const cell = grid[w * 7 + d]
              if (!cell) return <div key={d} style={{ width: '11px', height: '11px' }} />
              return (
                <div
                  key={d}
                  title={cell.isFuture ? '' : `${cell.date}: ${cell.count} task${cell.count !== 1 ? 's' : ''} completed`}
                  style={{
                    width: '11px',
                    height: '11px',
                    borderRadius: '2px',
                    background: getColor(cell.count, cell.isFuture),
                    border: cell.isToday ? '1px solid rgba(187,225,250,0.5)' : 'none',
                    cursor: cell.count > 0 ? 'default' : 'default',
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', justifyContent: 'flex-end' }}>
        <span style={{ fontSize: '9px', color: 'rgba(187,225,250,0.35)' }}>Less</span>
        {[0, 0.3, 0.55, 0.75, 1].map((v, i) => (
          <div
            key={i}
            style={{
              width: '11px',
              height: '11px',
              borderRadius: '2px',
              background: getColor(Math.round(v * maxCount), false),
            }}
          />
        ))}
        <span style={{ fontSize: '9px', color: 'rgba(187,225,250,0.35)' }}>More</span>
      </div>
    </div>
  )
}
