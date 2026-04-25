import { getEventIcon } from '@/lib/utils'

export default function MatchEvents({ events, homeTeam, awayTeam }) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted">
        <span className="text-3xl">⚽</span>
        <p className="text-sm">لا توجد أحداث بعد</p>
      </div>
    )
  }

  return (
    <div className="space-y-1 py-2">
      {events.map((event, i) => {
        const isHome = event.team === homeTeam?.id || event.team === 'home'
        return (
          <EventRow key={i} event={event} isHome={isHome} />
        )
      })}
    </div>
  )
}

function EventRow({ event, isHome }) {
  const icon = getEventIcon(event.type)

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-card/50 transition-colors ${isHome ? 'flex-row' : 'flex-row-reverse'}`}>

      {/* Minute */}
      <span className="text-xs font-bold text-muted w-10 text-center flex-shrink-0">
        {event.minute}'
      </span>

      {/* Icon */}
      <span className="text-lg flex-shrink-0">{icon}</span>

      {/* Player info */}
      <div className={`flex-1 ${isHome ? 'text-right' : 'text-left'}`}>
        <p className="text-sm font-semibold text-text">{event.player}</p>
        {event.assist && (
          <p className="text-xs text-muted">
            {event.type === 'goal' ? `مساعدة: ${event.assist}` : event.assist}
          </p>
        )}
        {event.type === 'subst' && (
          <p className="text-xs text-muted">تبديل</p>
        )}
      </div>
    </div>
  )
}
