'use client'

export default function MatchLineup({ lineups, homeTeam, awayTeam, playerStats }) {
  // دعم الصيغة الجديدة {formation,coach,players:[]} والقديمة []
  const home = Array.isArray(lineups?.home)
    ? { formation: '', coach: '', players: lineups.home.map((n, i) => ({ id: String(i), name: n, number: i + 1, pos: '', grid: '' })) }
    : (lineups?.home || { formation: '', coach: '', players: [] })
  const away = Array.isArray(lineups?.away)
    ? { formation: '', coach: '', players: lineups.away.map((n, i) => ({ id: String(i), name: n, number: i + 1, pos: '', grid: '' })) }
    : (lineups?.away || { formation: '', coach: '', players: [] })

  const hasLineups = home.players.length > 0 && away.players.length > 0

  if (!hasLineups) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted">
        <span className="text-3xl">📋</span>
        <p className="text-sm">التشكيلة ستعلن قبل المباراة</p>
      </div>
    )
  }

  return (
    <div className="pb-4">

      {/* Formation badges */}
      <div className="flex items-center justify-between px-4 mb-3">
        <FormationBadge team={homeTeam} formation={home.formation} coach={home.coach} />
        <span className="text-xs font-bold text-muted">VS</span>
        <FormationBadge team={awayTeam} formation={away.formation} coach={away.coach} right />
      </div>

      {/* ── Mini Pitch ── */}
      <div className="mx-4 mb-4 rounded-2xl overflow-hidden shadow-lg">
        <MiniPitch
          homePlayers={home.players}
          awayPlayers={away.players}
          homeFormation={home.formation}
          awayFormation={away.formation}
        />
      </div>

      {/* ── الأساسيون ── */}
      <div className="grid grid-cols-2 gap-2 px-4">
        <PlayerColumn
          team={homeTeam}
          players={home.players}
          playerStats={playerStats?.[homeTeam?.id]}
          align="right"
        />
        <PlayerColumn
          team={awayTeam}
          players={away.players}
          playerStats={playerStats?.[awayTeam?.id]}
          align="left"
        />
      </div>

      {/* ── الدكة (الاحتياطيون) ── */}
      {(home.bench?.length > 0 || away.bench?.length > 0) && (
        <div className="px-4 mt-3 pb-2">
          <div className="flex items-center gap-2 mb-2 px-1">
            <span className="text-sm">🪑</span>
            <span className="text-xs font-black text-muted uppercase tracking-wide">الاحتياطيون</span>
            <div className="flex-1 h-px bg-border" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <PlayerColumn
              team={homeTeam}
              players={home.bench || []}
              playerStats={playerStats?.[homeTeam?.id]}
              align="right"
              isBench
            />
            <PlayerColumn
              team={awayTeam}
              players={away.bench || []}
              playerStats={playerStats?.[awayTeam?.id]}
              align="left"
              isBench
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Formation Badge ────────────────────────────────────────────────────────────

function FormationBadge({ team, formation, coach, right }) {
  return (
    <div className={`flex flex-col gap-0.5 ${right ? 'items-end' : 'items-start'}`}>
      <div className={`flex items-center gap-1.5 ${right ? 'flex-row-reverse' : ''}`}>
        <span className="text-xl">{team?.flag}</span>
        <span className="text-xs font-bold text-text">{team?.name}</span>
      </div>
      {formation && (
        <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{formation}</span>
      )}
      {coach && (
        <span className="text-[9px] text-muted">🧑‍💼 {coach}</span>
      )}
    </div>
  )
}

// ─── Mini Pitch SVG ─────────────────────────────────────────────────────────────

function MiniPitch({ homePlayers, awayPlayers, homeFormation, awayFormation }) {
  const homeRows = buildRows(homeFormation, homePlayers)
  const awayRows = buildRows(awayFormation, awayPlayers)

  const numHomeRows = Math.max(homeRows.length, 1)
  const numAwayRows = Math.max(awayRows.length, 1)

  // Y للصفوف: away = أعلى [28..200], home = أسفل [230..402]
  const awayRowY = (i) => numAwayRows === 1 ? 28 : 28 + i * 172 / (numAwayRows - 1)
  const homeRowY = (i) => numHomeRows === 1 ? 402 : 402 - i * 172 / (numHomeRows - 1)

  // X: توزيع اللاعبين أفقياً بالتساوي
  const playerX = (colIdx, total) => {
    const spacing = 260 / (total + 1)
    return 20 + (colIdx + 1) * spacing
  }

  return (
    <svg viewBox="0 0 300 430" className="w-full" style={{ display: 'block' }}>
      <PitchBackground />

      {/* Away team – يلعب نحو الأسفل */}
      {awayRows.map((row, ri) =>
        row.map((player, ci) => player && (
          <PlayerDot
            key={`a-${ri}-${ci}`}
            x={playerX(ci, row.length)}
            y={awayRowY(ri)}
            player={player}
            color="#ef4444"
          />
        ))
      )}

      {/* Home team – يلعب نحو الأعلى */}
      {homeRows.map((row, ri) =>
        row.map((player, ci) => player && (
          <PlayerDot
            key={`h-${ri}-${ci}`}
            x={playerX(ci, row.length)}
            y={homeRowY(ri)}
            player={player}
            color="#3b82f6"
          />
        ))
      )}
    </svg>
  )
}

function PitchBackground() {
  return (
    <>
      {/* خلفية الملعب */}
      <rect width="300" height="430" fill="#1a6b2f" />

      {/* خطوط الملعب المتناوبة */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <rect key={i} x="0" y={i * 72} width="300" height="36" fill="#1d7d34" opacity="0.55" />
      ))}

      {/* الحدود الخارجية */}
      <rect x="8" y="8" width="284" height="414" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.55" rx="2" />

      {/* خط منتصف الملعب */}
      <line x1="8" y1="215" x2="292" y2="215" stroke="white" strokeWidth="1.5" strokeOpacity="0.55" />

      {/* دائرة المنتصف */}
      <circle cx="150" cy="215" r="38" fill="none" stroke="white" strokeWidth="1.5" strokeOpacity="0.55" />
      <circle cx="150" cy="215" r="3" fill="white" fillOpacity="0.55" />

      {/* منطقة جزاء الفريق المضيف (أسفل) */}
      <rect x="60" y="328" width="180" height="90" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
      <rect x="104" y="380" width="92" height="38" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
      <circle cx="150" cy="358" r="2.5" fill="white" fillOpacity="0.4" />

      {/* منطقة جزاء الفريق الضيف (أعلى) */}
      <rect x="60" y="12" width="180" height="90" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
      <rect x="104" y="12" width="92" height="38" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.4" />
      <circle cx="150" cy="72" r="2.5" fill="white" fillOpacity="0.4" />
    </>
  )
}

function PlayerDot({ x, y, player, color }) {
  const parts     = (player?.name || '').trim().split(' ')
  const shortName = parts[parts.length - 1] || ''
  const label     = shortName.length > 9 ? shortName.slice(0, 8) + '.' : shortName

  return (
    <g>
      <circle cx={x} cy={y + 1.5} r="13" fill="black" fillOpacity="0.22" />
      <circle cx={x} cy={y}       r="13" fill={color} fillOpacity="0.88" stroke="white" strokeWidth="1.5" />
      <text x={x} y={y + 4}  textAnchor="middle" fill="white" fontSize="10" fontWeight="bold"  fontFamily="system-ui,sans-serif">
        {player?.number || ''}
      </text>
      <text x={x} y={y + 24} textAnchor="middle" fill="white" fontSize="7.5" fillOpacity="0.92" fontFamily="system-ui,sans-serif">
        {label}
      </text>
    </g>
  )
}

// ─── Player Column ──────────────────────────────────────────────────────────────

function PlayerColumn({ team, players, playerStats, align, isBench }) {
  const statsMap = {}
  if (playerStats) {
    for (const s of playerStats) statsMap[s.id] = s
  }

  return (
    <div>
      {!isBench && (
        <div className={`flex items-center gap-1 mb-2 ${align === 'right' ? '' : 'flex-row-reverse'}`}>
          <span className="text-base">{team?.flag}</span>
          <span className="text-[10px] font-bold text-muted truncate">{team?.name}</span>
        </div>
      )}
      <div className="space-y-0.5">
        {players.map((player, i) => (
          <PlayerRow
            key={player.id || i}
            player={player}
            stats={statsMap[player.id]}
            align={align}
            isBench={isBench}
          />
        ))}
      </div>
    </div>
  )
}

function PlayerRow({ player, stats, align, isBench }) {
  const rating = stats?.rating
  const ratingColor = !rating      ? 'text-muted bg-card'
    : rating >= 8                  ? 'text-gold   bg-gold/10'
    : rating >= 7                  ? 'text-green  bg-green/10'
    : rating >= 6                  ? 'text-primary bg-primary/10'
    :                                'text-live   bg-live/10'

  const isRight = align === 'right'

  return (
    <div className={`flex items-center gap-1 py-1.5 px-1.5 rounded-xl hover:bg-card transition-colors ${isRight ? 'flex-row' : 'flex-row-reverse'} ${isBench ? 'opacity-75' : ''}`}>

      {/* رقم اللاعب */}
      <span className="text-[9px] font-black text-muted w-4 text-center flex-shrink-0">
        {player.number || ''}
      </span>

      {/* الاسم */}
      <span className={`text-[10px] text-text font-medium flex-1 truncate ${isRight ? 'text-right' : 'text-left'}`}>
        {player.name}
      </span>

      {/* الأحداث (أهداف / كروت) */}
      {stats && (
        <span className="text-[9px] flex-shrink-0 leading-none">
          {stats.goals  > 0 && '⚽'.repeat(Math.min(stats.goals, 2))}
          {stats.assists > 0 && '🅰️'}
          {stats.yellow > 0 && '🟨'}
          {stats.red    > 0 && '🟥'}
          {stats.saves  > 0 && `🧤`}
        </span>
      )}

      {/* التقييم */}
      {rating && (
        <span className={`text-[9px] font-black px-1 py-0.5 rounded-md flex-shrink-0 ${ratingColor}`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}

// ─── Formation Rows Builder ─────────────────────────────────────────────────────

function buildRows(formation, players) {
  if (!players || players.length === 0) return []

  // إذا البيانات تحتوي على grid استخدمها (أدق)
  if (players.some(p => p.grid)) {
    const rowMap = {}
    for (const p of players) {
      if (!p.grid) continue
      const [row, col] = p.grid.split(':').map(Number)
      if (!rowMap[row]) rowMap[row] = []
      rowMap[row][col - 1] = p
    }
    return Object.entries(rowMap)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([, row]) => row.filter(Boolean))
  }

  // احتياط: بناء الصفوف من نص التشكيل "4-3-3"
  const parts = formation
    ? [1, ...formation.split('-').map(Number)]
    : [1, 4, 3, 3]

  const rows = []
  let idx = 0
  for (const count of parts) {
    if (idx >= players.length) break
    rows.push(players.slice(idx, idx + count))
    idx += count
  }
  if (idx < players.length) {
    const last = rows[rows.length - 1] || []
    rows[rows.length - 1] = [...last, ...players.slice(idx)]
  }
  return rows
}
