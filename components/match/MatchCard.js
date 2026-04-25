'use client'

import Link from 'next/link'
import LiveBadge, { UpcomingBadge, FinishedBadge } from './LiveBadge'
import { formatMatchTime, getUserTimezone } from '@/lib/utils'

export default function MatchCard({ match, prediction }) {
  const { id, status, minute, homeTeam, awayTeam, homeScore, awayScore, group, startTime } = match

  const time    = formatMatchTime(startTime, getUserTimezone())
  const isLive  = status === 'LIVE'
  const isDone  = status === 'FINISHED'
  const hasPred = prediction !== undefined

  return (
    <Link href={`/match/${id}`} className="block card card-press p-4 animate-in">

      {/* Row 1: status + group */}
      <div className="flex items-center justify-between mb-3">
        <div>
          {isLive  && <LiveBadge minute={minute} />}
          {isDone  && <FinishedBadge />}
          {!isLive && !isDone && <UpcomingBadge time={time} />}
        </div>
        <span className="text-muted text-xs font-medium">{group}</span>
      </div>

      {/* Row 2: teams + score */}
      <div className="flex items-center justify-between gap-2">

        {/* Home team */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <span className="text-3xl leading-none">{homeTeam.flag}</span>
          <span className="text-sm font-bold text-text text-center leading-tight">{homeTeam.name}</span>
        </div>

        {/* Score */}
        <div className="flex items-center gap-2 px-2">
          {isLive || isDone ? (
            <>
              <span className="text-4xl font-black text-text w-10 text-center">{homeScore}</span>
              <span className="text-2xl font-light text-muted">:</span>
              <span className="text-4xl font-black text-text w-10 text-center">{awayScore}</span>
            </>
          ) : (
            <span className="text-2xl font-bold text-muted px-2">VS</span>
          )}
        </div>

        {/* Away team */}
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <span className="text-3xl leading-none">{awayTeam.flag}</span>
          <span className="text-sm font-bold text-text text-center leading-tight">{awayTeam.name}</span>
        </div>
      </div>

      {/* Row 3: prediction CTA or result */}
      <div className="mt-4 pt-3 border-t border-border">
        {hasPred ? (
          <PredictionResult prediction={prediction} actual={isDone ? { homeScore, awayScore } : null} />
        ) : isDone ? (
          <p className="text-center text-muted text-xs">لم تتوقع هذه المباراة</p>
        ) : (
          <Link
            href={`/predict/${id}`}
            onClick={e => e.stopPropagation()}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-bold hover:bg-primary/20 transition-colors"
          >
            <PredictIcon />
            توقع النتيجة
          </Link>
        )}
      </div>
    </Link>
  )
}

// ─── Prediction result pill ────────────────────────────────────────────────────

function PredictionResult({ prediction, actual }) {
  let points = null
  let label  = `توقعك: ${prediction.homeScore} - ${prediction.awayScore}`

  if (actual) {
    const exactMatch =
      prediction.homeScore === actual.homeScore &&
      prediction.awayScore === actual.awayScore
    const predWin  = getWinner(prediction.homeScore, prediction.awayScore)
    const actWin   = getWinner(actual.homeScore, actual.awayScore)
    if (exactMatch)          points = 3
    else if (predWin === actWin) points = 1
    else                         points = 0
  }

  const colors = {
    3: 'text-green  bg-green-bg  border-green/30',
    1: 'text-gold   bg-gold-bg   border-gold/30',
    0: 'text-live   bg-live-bg   border-live/30',
  }

  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold ${points !== null ? colors[points] : 'text-muted bg-card border-border'}`}>
      <span>{label}</span>
      {points !== null && (
        <span>{points === 3 ? '+3 نقاط' : points === 1 ? '+1 نقطة' : '0 نقاط'}</span>
      )}
    </div>
  )
}

function getWinner(home, away) {
  if (home > away) return 'home'
  if (away > home) return 'away'
  return 'draw'
}

function PredictIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
