'use client'

// ─── الملعب الحي: يُظهر الاستحواذ + موقع الكرة + آخر حدث ──────────────────────

export default function LivePitch({ events = [], stats, homeTeam, awayTeam, minute }) {
  const lastEvent  = events[events.length - 1] || null
  const ballPos    = getBallPos(lastEvent, homeTeam?.id)
  const homePoss   = stats?.possession?.[0] ?? 50
  const awayPoss   = stats?.possession?.[1] ?? 50

  return (
    <div className="mx-4 mb-4 card overflow-hidden">
      {/* رأس: الاستحواذ */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <div className="flex items-center gap-1.5">
          <span className="text-xl">{homeTeam?.flag}</span>
          <span className="text-sm font-black text-primary">{homePoss}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex h-2 w-28 rounded-full overflow-hidden bg-border">
            <div className="bg-primary rounded-full transition-all duration-700" style={{ width: `${homePoss}%` }} />
            <div className="bg-live rounded-full flex-1" />
          </div>
          <span className="text-[10px] text-muted">استحواذ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-black text-live">{awayPoss}%</span>
          <span className="text-xl">{awayTeam?.flag}</span>
        </div>
      </div>

      {/* الملعب SVG */}
      <div className="relative bg-[#1a6b2f]">
        <svg viewBox="0 0 300 140" className="w-full" style={{ display: 'block' }}>
          <PitchBg />

          {/* الكرة */}
          <BallDot x={ballPos.x} y={ballPos.y} />

          {/* أعلام الفريقين */}
          <text x="18" y="76" textAnchor="middle" fontSize="18" fontFamily="system-ui">{homeTeam?.flag}</text>
          <text x="282" y="76" textAnchor="middle" fontSize="18" fontFamily="system-ui">{awayTeam?.flag}</text>
        </svg>

        {/* آخر حدث */}
        {lastEvent && (
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full font-medium">
              {eventIcon(lastEvent.type)} {lastEvent.minute}' {lastEvent.player}
            </span>
          </div>
        )}
      </div>

      {/* أسماء الفرق */}
      <div className="flex justify-between px-4 py-1.5 text-[10px] text-muted border-t border-border">
        <span>{homeTeam?.name}</span>
        <span className="text-[9px] text-muted/60">⚽ يهاجم ←→ يهاجم</span>
        <span>{awayTeam?.name}</span>
      </div>
    </div>
  )
}

// ─── SVG Pitch Background ────────────────────────────────────────────────────────
function PitchBg() {
  return (
    <>
      <rect width="300" height="140" fill="#1a6b2f" />
      {/* خطوط متناوبة */}
      {[0,1,2,3].map(i => (
        <rect key={i} x="0" y={i * 35} width="300" height="17.5" fill="#1d7d34" opacity="0.45" />
      ))}
      {/* حدود */}
      <rect x="6" y="5" width="288" height="130" fill="none" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" rx="1"/>
      {/* خط الوسط */}
      <line x1="150" y1="5" x2="150" y2="135" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
      {/* دائرة الوسط */}
      <circle cx="150" cy="70" r="25" fill="none" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
      <circle cx="150" cy="70" r="2" fill="white" fillOpacity="0.5" />
      {/* منطقة جزاء يسار (المضيف يهاجم يميناً) */}
      <rect x="6"   y="35" width="50" height="70" fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.35" />
      <rect x="6"   y="50" width="22" height="40" fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.35" />
      {/* منطقة جزاء يمين */}
      <rect x="244" y="35" width="50" height="70" fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.35" />
      <rect x="272" y="50" width="22" height="40" fill="none" stroke="white" strokeWidth="0.8" strokeOpacity="0.35" />
    </>
  )
}

// ─── الكرة المتحركة ──────────────────────────────────────────────────────────────
function BallDot({ x, y }) {
  return (
    <g>
      {/* هالة */}
      <circle cx={x} cy={y} r="10" fill="white" fillOpacity="0.15">
        <animate attributeName="r" values="10;14;10" dur="1.4s" repeatCount="indefinite" />
        <animate attributeName="fill-opacity" values="0.15;0.05;0.15" dur="1.4s" repeatCount="indefinite" />
      </circle>
      {/* الكرة */}
      <circle cx={x} cy={y} r="6" fill="white" fillOpacity="0.95" stroke="#333" strokeWidth="0.8" />
      {/* خطوط الكرة */}
      <line x1={x-4} y1={y}   x2={x+4} y2={y}   stroke="#555" strokeWidth="0.6" />
      <line x1={x}   y1={y-4} x2={x}   y2={y+4} stroke="#555" strokeWidth="0.6" />
    </g>
  )
}

// ─── حساب موقع الكرة من آخر حدث ────────────────────────────────────────────────
function getBallPos(event, homeTeamId) {
  if (!event) return { x: 150, y: 70 }   // مركز الملعب

  const isHome = String(event.team) === String(homeTeamId)

  // المضيف يهاجم نحو اليمين (x كبير)، الضيف يهاجم نحو اليسار (x صغير)
  const attackX = isHome ? 230 : 70
  const defX    = isHome ? 70  : 230
  const centerX = 150

  const positions = {
    goal:        { x: isHome ? 268 : 32,  y: 70 },
    penalty:     { x: isHome ? 240 : 60,  y: 70 },
    yellow_card: { x: isHome ? 190 : 110, y: 70 },
    red_card:    { x: isHome ? 180 : 120, y: 70 },
    subst:       { x: centerX,            y: 70 },
    var:         { x: centerX,            y: 70 },
    goal_missed: { x: isHome ? 250 : 50,  y: 70 },
  }

  return positions[event.type] || { x: isHome ? 200 : 100, y: 70 }
}

function eventIcon(type) {
  const icons = {
    goal: '⚽', yellow_card: '🟨', red_card: '🟥',
    subst: '🔄', penalty: '🎯', var: '📺',
  }
  return icons[type] || '▪️'
}
