import Link from 'next/link'

export default function MatchLineup({ lineups, homeTeam, awayTeam }) {
  const hasLineups = lineups.home.length > 0 && lineups.away.length > 0

  if (!hasLineups) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted">
        <span className="text-3xl">📋</span>
        <p className="text-sm">التشكيلة ستعلن قبل المباراة</p>
      </div>
    )
  }

  return (
    <div className="py-2">
      <div className="grid grid-cols-2 gap-4 px-4">
        {/* Home */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{homeTeam.flag}</span>
            <span className="text-sm font-bold text-text">{homeTeam.name}</span>
          </div>
          <div className="space-y-1">
            {lineups.home.map((player, i) => (
              <PlayerRow key={i} name={player} number={i + 1} />
            ))}
          </div>
        </div>

        {/* Away */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">{awayTeam.flag}</span>
            <span className="text-sm font-bold text-text">{awayTeam.name}</span>
          </div>
          <div className="space-y-1">
            {lineups.away.map((player, i) => (
              <PlayerRow key={i} name={player} number={i + 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlayerRow({ name, number }) {
  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-card transition-colors cursor-pointer active:scale-95">
      <span className="text-xs font-bold text-muted w-5 text-center">{number}</span>
      <span className="text-sm text-text truncate">{name}</span>
    </div>
  )
}
