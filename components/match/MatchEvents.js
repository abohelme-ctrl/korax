'use client'

// ─── أحداث المباراة بأسلوب التعليق النصي الحي ────────────────────────────────────

export default function MatchEvents({ events, homeTeam, awayTeam, matchStatus }) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted">
        <span className="text-3xl">⚽</span>
        <p className="text-sm">
          {matchStatus === 'UPCOMING' ? 'المباراة لم تبدأ بعد' : 'لا توجد أحداث بعد'}
        </p>
      </div>
    )
  }

  // ترتيب تنازلي — الأحدث أولاً
  const sorted = [...events].reverse()

  return (
    <div className="px-4 py-2 space-y-2">
      {sorted.map((event, i) => {
        const isHome = String(event.team) === String(homeTeam?.id) || event.team === 'home'
        const team   = isHome ? homeTeam : awayTeam
        const isLast = i === 0 && matchStatus === 'LIVE'
        return (
          <CommentaryRow
            key={i}
            event={event}
            isHome={isHome}
            team={team}
            isLatest={isLast}
          />
        )
      })}
    </div>
  )
}

// ─── صف التعليق ──────────────────────────────────────────────────────────────────
function CommentaryRow({ event, isHome, team, isLatest }) {
  const { icon, text, sub, color, bgColor } = buildCommentary(event, isHome, team)

  return (
    <div className={`relative rounded-2xl overflow-hidden transition-all ${
      isLatest ? 'ring-2 ring-primary/40' : ''
    }`}>
      {/* شريط اللون الجانبي */}
      <div className={`absolute top-0 ${isHome ? 'right-0' : 'left-0'} w-1 h-full ${bgColor} rounded-full`} />

      <div className={`flex items-start gap-3 px-4 py-3 bg-card ${isHome ? 'pr-5' : 'pl-5 flex-row-reverse'}`}>

        {/* الدقيقة */}
        <div className="flex flex-col items-center flex-shrink-0 w-9">
          <span className={`text-xs font-black ${color}`}>{event.minute}'</span>
          {isLatest && (
            <span className="text-[8px] text-primary font-bold animate-pulse">LIVE</span>
          )}
        </div>

        {/* الأيقونة */}
        <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>

        {/* النص */}
        <div className={`flex-1 min-w-0 ${isHome ? 'text-right' : 'text-left'}`}>
          <p className={`text-sm font-black ${color} leading-tight`}>{text}</p>
          {sub && (
            <p className="text-[11px] text-muted mt-0.5 leading-tight">{sub}</p>
          )}
          <div className="flex items-center gap-1 mt-1" style={{ justifyContent: isHome ? 'flex-end' : 'flex-start' }}>
            <span className="text-sm">{team?.flag}</span>
            <span className="text-[10px] text-muted">{team?.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── بناء نص التعليق من نوع الحدث ───────────────────────────────────────────────
function buildCommentary(event, isHome, team) {
  const player = event.player || ''
  const assist = event.assist || ''

  switch (event.type) {
    case 'goal':
      return {
        icon: '⚽',
        text: `هدف! ${player} يهز الشباك`,
        sub: assist ? `مساعدة رائعة من ${assist}` : null,
        color: 'text-green',
        bgColor: 'bg-green',
      }

    case 'penalty':
      return {
        icon: '🎯',
        text: `ركلة جزاء — ${player}`,
        sub: assist ? assist : null,
        color: 'text-gold',
        bgColor: 'bg-gold',
      }

    case 'yellow_card':
      return {
        icon: '🟨',
        text: `بطاقة صفراء بحق ${player}`,
        sub: event.detail || null,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-400',
      }

    case 'red_card':
      return {
        icon: '🟥',
        text: `طرد! ${player} يغادر الملعب`,
        sub: event.detail || null,
        color: 'text-live',
        bgColor: 'bg-live',
      }

    case 'subst':
      return {
        icon: '🔄',
        text: `تبديل — دخل ${player}`,
        sub: assist ? `خرج ${assist}` : null,
        color: 'text-primary',
        bgColor: 'bg-primary',
      }

    case 'var':
      return {
        icon: '📺',
        text: `مراجعة الحكم بالفيديو (VAR)`,
        sub: event.detail || player || null,
        color: 'text-muted',
        bgColor: 'bg-muted',
      }

    default:
      return {
        icon: '▪️',
        text: player,
        sub: event.detail || null,
        color: 'text-text',
        bgColor: 'bg-border',
      }
  }
}
