import Link from 'next/link'

export default function GroupTable({ group }) {
  const sorted = [...group.teams].sort((a, b) => {
    if (b.pts !== a.pts)    return b.pts - a.pts
    const gdA = a.gf - a.ga
    const gdB = b.gf - b.ga
    if (gdB !== gdA) return gdB - gdA
    return b.gf - a.gf
  })

  return (
    <div className="card overflow-hidden">
      {/* Group header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <span className="text-base font-black text-primary">{group.name}</span>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[1fr_32px_32px_32px_32px_36px] gap-1 px-4 py-2 border-b border-border">
        <span className="text-xs text-muted">الفريق</span>
        {['ل','ف','ت','خ','ن'].map(h => (
          <span key={h} className="text-xs text-muted text-center">{h}</span>
        ))}
      </div>

      {/* Rows */}
      {sorted.map((entry, i) => (
        <TableRow key={entry.team.id} entry={entry} rank={i + 1} qualify={i < 2} />
      ))}
    </div>
  )
}

function TableRow({ entry, rank, qualify }) {
  const { team, played, won, draw, lost, pts } = entry
  const gd = entry.gf - entry.ga

  return (
    <div className={`
      grid grid-cols-[1fr_32px_32px_32px_32px_36px] gap-1 px-4 py-3 items-center
      border-b border-border last:border-b-0
      ${qualify ? 'bg-primary/5' : ''}
      transition-colors hover:bg-card-hover
    `}>
      {/* Team */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-muted w-4">{rank}</span>
        {qualify && <div className="w-1 h-5 bg-primary rounded-full" />}
        <span className="text-lg">{team.flag}</span>
        <span className="text-sm font-semibold text-text truncate">{team.name}</span>
      </div>

      <span className="text-xs text-muted-light text-center">{played}</span>
      <span className="text-xs text-muted-light text-center">{won}</span>
      <span className="text-xs text-muted-light text-center">{draw}</span>
      <span className="text-xs text-muted-light text-center">{lost}</span>
      <span className="text-sm font-black text-text text-center">{pts}</span>
    </div>
  )
}
