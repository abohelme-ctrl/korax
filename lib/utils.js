import { format, formatInTimeZone } from 'date-fns-tz'
import { ar } from 'date-fns/locale'

// ─── Date/Time ─────────────────────────────────────────────────────────────────

/**
 * Format match time in user's local timezone
 */
export function formatMatchTime(isoString, userTimezone) {
  const tz = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone
  return formatInTimeZone(new Date(isoString), tz, 'HH:mm')
}

/**
 * Format date in Arabic
 */
export function formatDateAr(isoString) {
  return format(new Date(isoString), 'EEEE d MMMM', { locale: ar })
}

/**
 * Get user's local timezone
 */
export function getUserTimezone() {
  if (typeof window === 'undefined') return 'UTC'
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

// ─── Match Status ──────────────────────────────────────────────────────────────

export const MATCH_STATUS = {
  LIVE:     { label: 'مباشر',   color: 'text-live',  bg: 'bg-live-bg'   },
  UPCOMING: { label: 'قادمة',   color: 'text-muted', bg: 'bg-card'      },
  FINISHED: { label: 'انتهت',   color: 'text-green', bg: 'bg-green-bg'  },
}

export function getStatusInfo(status) {
  return MATCH_STATUS[status] || MATCH_STATUS.UPCOMING
}

// ─── Event Icons ───────────────────────────────────────────────────────────────

export const EVENT_ICONS = {
  goal:        '⚽',
  yellow_card: '🟨',
  red_card:    '🟥',
  subst:       '🔄',
  injury:      '🤕',
  penalty:     '🎯',
  save:        '🧤',
  var:         '📺',
}

export function getEventIcon(type) {
  return EVENT_ICONS[type] || '•'
}

// ─── Points System ─────────────────────────────────────────────────────────────

/**
 * Calculate points for a prediction
 * @param {{homeScore: number, awayScore: number}} prediction
 * @param {{homeScore: number, awayScore: number}} actual
 */
export function calculatePoints(prediction, actual) {
  if (actual.homeScore === null || actual.awayScore === null) return null

  const exactMatch =
    prediction.homeScore === actual.homeScore &&
    prediction.awayScore === actual.awayScore
  if (exactMatch) return 3

  const predWinner = getWinner(prediction.homeScore, prediction.awayScore)
  const actualWinner = getWinner(actual.homeScore, actual.awayScore)
  if (predWinner === actualWinner) return 1

  return 0
}

function getWinner(home, away) {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return 'draw'
}

// ─── Player Card Rarity ────────────────────────────────────────────────────────

export const RARITY_CONFIG = {
  COMMON:    { label: 'عادي',    gradient: 'from-gray-700 to-gray-600', border: 'border-gray-500',  glow: ''                      },
  RARE:      { label: 'نادر',    gradient: 'from-blue-900 to-blue-700', border: 'border-blue-400',  glow: 'shadow-blue-500/30'    },
  LEGENDARY: { label: 'أسطوري', gradient: 'from-yellow-900 to-amber-700', border: 'border-yellow-400', glow: 'shadow-yellow-500/40' },
}

export function getRarityConfig(rarity) {
  return RARITY_CONFIG[rarity] || RARITY_CONFIG.COMMON
}

// ─── Team Chemistry ────────────────────────────────────────────────────────────

export function calculateChemistry(players) {
  const v = (players || []).filter(Boolean)
  if (!v.length) return 0
  let c = 0
  const flags = {}, clubs = {}
  v.forEach(p => {
    if (p.flag) flags[p.flag] = (flags[p.flag] || 0) + 1
    if (p.club) clubs[p.club] = (clubs[p.club] || 0) + 1
  })
  Object.values(flags).forEach(n => { if (n >= 2) c += (n - 1) })
  Object.values(clubs).forEach(n => { if (n >= 2) c += (n - 1) * 2 })
  return Math.min(c, 99)
}

export function calculateTeamPower(players) {
  const v = (players || []).filter(Boolean)
  if (!v.length) return 0
  return Math.round(v.reduce((s, p) => s + (p.rating || p.power || 75), 0) / v.length)
}

// ─── Misc ──────────────────────────────────────────────────────────────────────

export function clsx(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function getInitials(name) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
}

export function generateGroupCode() {
  return 'KRX-' + Math.floor(1000 + Math.random() * 9000)
}
