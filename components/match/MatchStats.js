export default function MatchStats({ stats, homeTeam, awayTeam }) {
  if (!stats) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted">
        <span className="text-3xl">📊</span>
        <p className="text-sm">الإحصائيات ستظهر بعد بدء المباراة</p>
      </div>
    )
  }

  const rows = [
    { label: 'الاستحواذ',       home: `${stats.possession[0]}%`, away: `${stats.possession[1]}%`, homeVal: stats.possession[0], awayVal: stats.possession[1] },
    { label: 'التسديدات',       home: stats.shots[0],           away: stats.shots[1],            homeVal: stats.shots[0],       awayVal: stats.shots[1]       },
    { label: 'على المرمى',      home: stats.shotsOnTarget[0],   away: stats.shotsOnTarget[1],    homeVal: stats.shotsOnTarget[0], awayVal: stats.shotsOnTarget[1] },
    { label: 'الركنيات',        home: stats.corners[0],         away: stats.corners[1],          homeVal: stats.corners[0],     awayVal: stats.corners[1]     },
    { label: 'الأخطاء',         home: stats.fouls[0],           away: stats.fouls[1],            homeVal: stats.fouls[0],       awayVal: stats.fouls[1]       },
  ]

  return (
    <div className="py-2 space-y-5">
      {rows.map(row => (
        <StatRow key={row.label} row={row} />
      ))}
    </div>
  )
}

function StatRow({ row }) {
  const total   = Number(row.homeVal) + Number(row.awayVal)
  const homePct = total > 0 ? (Number(row.homeVal) / total) * 100 : 50

  return (
    <div className="px-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-bold text-text">{row.home}</span>
        <span className="text-xs font-medium text-muted">{row.label}</span>
        <span className="text-sm font-bold text-text">{row.away}</span>
      </div>

      {/* Dual bar */}
      <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-border">
        <div className="stat-bar-home rounded-full" style={{ width: `${homePct}%` }} />
        <div className="stat-bar-away rounded-full flex-1" />
      </div>
    </div>
  )
}
