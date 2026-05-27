'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import LiveBadge, { UpcomingBadge, FinishedBadge } from '@/components/match/LiveBadge'
import MatchEvents from '@/components/match/MatchEvents'
import MatchStats from '@/components/match/MatchStats'
import MatchLineup from '@/components/match/MatchLineup'
import { fetchMatchDetails, fetchPrediction, fetchH2H, fetchMatchPlayers, INTERVAL_LIVE, INTERVAL_IDLE } from '@/lib/api-football'
import { formatMatchTime, getUserTimezone } from '@/lib/utils'

const TABS = [
  { id: 'events',  label: 'الأحداث'    },
  { id: 'stats',   label: 'الإحصائيات' },
  { id: 'lineups', label: 'التشكيلة'   },
  { id: 'h2h',     label: 'التاريخ'    },
]

export default function MatchPage() {
  const { id }    = useParams()
  const [match, setMatch]           = useState(null)
  const [aiPrediction, setAiPred]   = useState(null)
  const [h2h, setH2H]               = useState([])
  const [playerStats, setPlayerStats] = useState(null)
  const [tab, setTab]               = useState('events')
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    fetchMatchDetails(id)
      .then(m => {
        setMatch(m)
        // جلب كل البيانات الإضافية بالتوازي
        Promise.allSettled([
          fetchPrediction(id),
          fetchH2H(m.homeTeam.id, m.awayTeam.id),
          fetchMatchPlayers(id),
        ]).then(([predR, h2hR, playersR]) => {
          if (predR.status    === 'fulfilled') setAiPred(predR.value)
          if (h2hR.status     === 'fulfilled') setH2H(h2hR.value)
          if (playersR.status === 'fulfilled') setPlayerStats(playersR.value)
        })
      })
      .finally(() => setLoading(false))
  }, [id])

  // Smart refresh: 10s live / 5min idle
  useEffect(() => {
    if (!match) return
    let timeoutId
    function scheduleNext(current) {
      const delay = current.status === 'LIVE' ? INTERVAL_LIVE : INTERVAL_IDLE
      timeoutId = setTimeout(async () => {
        const updated = await fetchMatchDetails(id)
        setMatch(updated)
        scheduleNext(updated)
      }, delay)
    }
    scheduleNext(match)
    return () => clearTimeout(timeoutId)
  }, [id, match?.status])

  if (loading) return <LoadingScreen />
  if (!match)  return <NotFound />

  const { status, minute, homeTeam, awayTeam, homeScore, awayScore, group, stadium, referee, startTime } = match
  const time = formatMatchTime(startTime, getUserTimezone())

  return (
    <div>
      <Header back title={`${homeTeam.name} vs ${awayTeam.name}`} />

      <div className="page-content">

        {/* Hero: Score */}
        <div className="px-4 pt-4 pb-6">
          <div className="card p-6">

            {/* Status */}
            <div className="flex items-center justify-center mb-4">
              {status === 'LIVE'     && <LiveBadge minute={minute} size="lg" />}
              {status === 'FINISHED' && <FinishedBadge />}
              {status === 'UPCOMING' && <UpcomingBadge time={time} />}
            </div>

            {/* Score row */}
            <div className="flex items-center justify-between gap-2">
              <TeamBlock team={homeTeam} score={homeScore} />

              <div className="flex flex-col items-center gap-1">
                {status !== 'UPCOMING' ? (
                  <div className="flex items-center gap-3">
                    <span className="text-5xl font-black text-text">{homeScore}</span>
                    <span className="text-3xl text-muted font-light">:</span>
                    <span className="text-5xl font-black text-text">{awayScore}</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-muted">VS</span>
                )}
                <span className="text-xs text-muted font-medium">{group}</span>
              </div>

              <TeamBlock team={awayTeam} score={awayScore} reverse />
            </div>

            {/* Stadium + referee */}
            <div className="mt-5 pt-4 border-t border-border grid grid-cols-2 gap-3">
              <InfoChip icon="🏟️" label="الملعب" value={stadium?.name || match.venue} sub={stadium?.city} />
              <InfoChip icon="👔" label="الحكم" value={referee || '—'} />
              {stadium?.capacity && (
                <InfoChip icon="👥" label="السعة" value={stadium.capacity.toLocaleString('ar')} />
              )}
              {stadium?.info && (
                <InfoChip icon="ℹ️" label="معلومة" value={stadium.info} />
              )}
            </div>
          </div>
        </div>

        {/* AI Prediction */}
        {aiPrediction && (
          <div className="px-4 mb-4">
            <AIPredictionCard pred={aiPrediction} homeTeam={homeTeam} awayTeam={awayTeam} />
          </div>
        )}

        {/* Predict CTA */}
        {status === 'UPCOMING' && (
          <div className="px-4 mb-4">
            <Link
              href={`/predict/${id}`}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-primary font-black text-white text-lg active:scale-98 transition-transform shadow-lg shadow-primary/30"
            >
              ⚽ توقع النتيجة
            </Link>
          </div>
        )}

        {/* Tabs */}
        <div className="tab-bar mb-3">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`tab-item ${tab === t.id ? 'active' : ''}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-in">
          {tab === 'events'  && <MatchEvents events={match.events} homeTeam={homeTeam} awayTeam={awayTeam} />}
          {tab === 'stats'   && <MatchStats stats={match.stats} homeTeam={homeTeam} awayTeam={awayTeam} />}
          {tab === 'lineups' && <MatchLineup lineups={match.lineups} homeTeam={homeTeam} awayTeam={awayTeam} playerStats={playerStats} />}
          {tab === 'h2h'     && <H2HView matches={h2h} homeTeam={homeTeam} awayTeam={awayTeam} />}
        </div>

      </div>

      <BottomNav />
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function TeamBlock({ team, reverse }) {
  return (
    <div className={`flex flex-col items-center gap-2 flex-1 ${reverse ? 'items-center' : 'items-center'}`}>
      <span className="text-5xl">{team.flag}</span>
      <span className="text-sm font-bold text-text text-center leading-tight max-w-[90px]">{team.name}</span>
    </div>
  )
}

function InfoChip({ icon, label, value, sub }) {
  return (
    <div className="bg-bg rounded-xl p-3">
      <p className="text-xs text-muted mb-0.5 flex items-center gap-1">
        <span>{icon}</span>{label}
      </p>
      <p className="text-xs font-semibold text-text leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted mt-0.5">{sub}</p>}
    </div>
  )
}

function H2HView({ matches, homeTeam, awayTeam }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-muted">
        <span className="text-3xl">📋</span>
        <p className="text-sm">لا يوجد تاريخ مشترك بين الفريقين</p>
      </div>
    )
  }
  return (
    <div className="px-4 py-2 space-y-2">
      <p className="text-xs text-muted font-medium mb-3">آخر {matches.length} مباريات بين الفريقين</p>
      {matches.map(m => {
        const homeWin = m.homeScore > m.awayScore
        const awayWin = m.awayScore > m.homeScore
        return (
          <div key={m.id} className="card p-3 flex items-center gap-2">
            <span className="text-xs text-muted w-16 text-center">
              {new Date(m.startTime).toLocaleDateString('ar', { year: '2-digit', month: 'short' })}
            </span>
            <span className={`text-xs font-bold flex-1 text-right truncate ${homeWin ? 'text-green' : 'text-muted'}`}>
              {m.homeTeam.name}
            </span>
            <span className="text-sm font-black text-text px-2">
              {m.homeScore} - {m.awayScore}
            </span>
            <span className={`text-xs font-bold flex-1 text-left truncate ${awayWin ? 'text-green' : 'text-muted'}`}>
              {m.awayTeam.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function AIPredictionCard({ pred, homeTeam, awayTeam }) {
  const homeNum = parseInt(pred.homeWinPct)  || 0
  const drawNum = parseInt(pred.drawPct)     || 0
  const awayNum = parseInt(pred.awayWinPct)  || 0

  return (
    <div className="card p-4 border-primary/20 bg-primary/5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">🤖</span>
        <p className="font-bold text-sm text-text">توقع الذكاء الاصطناعي</p>
      </div>

      {/* Win probability bars */}
      <div className="space-y-2 mb-3">
        <ProbBar label={homeTeam.name} pct={homeNum} color="bg-primary" flag={homeTeam.flag} />
        <ProbBar label="تعادل"          pct={drawNum} color="bg-muted"   flag="🤝"            />
        <ProbBar label={awayTeam.name}  pct={awayNum} color="bg-live"   flag={awayTeam.flag} />
      </div>

      {/* Advice */}
      {pred.advice && (
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-light text-center">{pred.advice}</p>
        </div>
      )}

      {/* Form */}
      {(pred.homeForm || pred.awayForm) && (
        <div className="flex justify-between mt-2 pt-2 border-t border-border">
          <FormBadges label={homeTeam.name} form={pred.homeForm} />
          <FormBadges label={awayTeam.name} form={pred.awayForm} right />
        </div>
      )}
    </div>
  )
}

function ProbBar({ label, pct, color, flag }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm w-6 text-center">{flag}</span>
      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-text w-9 text-left">{pct}%</span>
    </div>
  )
}

function FormBadges({ label, form, right }) {
  const letters = (form || '').slice(-5).split('')
  const colors  = { W: 'bg-green text-white', D: 'bg-muted text-white', L: 'bg-live text-white' }
  return (
    <div className={`flex flex-col gap-1 ${right ? 'items-end' : 'items-start'}`}>
      <span className="text-[10px] text-muted">{label}</span>
      <div className="flex gap-0.5">
        {letters.map((l, i) => (
          <span key={i} className={`w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center ${colors[l] || 'bg-border text-muted'}`}>
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-4xl animate-pulse">⚽</div>
    </div>
  )
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <span className="text-5xl">❌</span>
      <p className="text-muted">المباراة غير موجودة</p>
      <Link href="/" className="text-primary font-bold">العودة للرئيسية</Link>
    </div>
  )
}
