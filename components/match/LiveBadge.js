export default function LiveBadge({ minute, size = 'md' }) {
  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-live-bg border border-live/30 font-bold text-live ${sizes[size]}`}>
      <span className="live-dot" />
      {minute ? `${minute}'` : 'مباشر'}
    </span>
  )
}

export function UpcomingBadge({ time }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-card border border-border font-semibold text-muted-light">
      <ClockIcon />
      {time}
    </span>
  )
}

export function FinishedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-green-bg border border-green/20 font-semibold text-green">
      انتهت
    </span>
  )
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
