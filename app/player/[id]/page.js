'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { fetchPlayer } from '@/lib/api-football'

export default function PlayerPage() {
  const { id }    = useParams()
  const [player, setPlayer]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlayer(id)
      .then(setPlayer)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-4xl animate-pulse">⚽</div>
      </div>
    )
  }

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <span className="text-5xl">❌</span>
        <p className="text-muted text-sm">اللاعب غير موجود</p>
      </div>
    )
  }

  const rarityColor = {
    LEGENDARY: 'from-yellow-900/60 to-amber-800/40 border-yellow-500/30',
    RARE:      'from-blue-900/60 to-blue-800/40 border-blue-500/30',
    COMMON:    'from-gray-800/60 to-gray-700/40 border-gray-600/30',
  }

  return (
    <div>
      <Header back title={player.name} notif={false} />

      <div className="page-content px-4 py-4 space-y-4">

        {/* Hero card */}
        <div className={`card p-6 bg-gradient-to-b ${rarityColor[player.rarity || 'COMMON']}`}>
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-bg/50 flex items-center justify-center flex-shrink-0">
              <span className="text-5xl">{player.team?.flag || '🏳️'}</span>
            </div>
            <div className="flex-1">
              <p className="text-xl font-black text-text">{player.name}</p>
              <p className="text-sm text-muted mt-0.5">{player.position}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                  {player.team?.name}
                </span>
                {player.injured && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-live-bg text-live font-bold">
                    🤕 مصاب
                  </span>
                )}
              </div>
            </div>
            {player.power && (
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-text">{player.power}</span>
                <span className="text-[10px] text-muted">القوة</span>
              </div>
            )}
          </div>
        </div>

        {/* Basic info */}
        <div className="card p-4">
          <p className="text-sm font-bold text-muted-light mb-3">معلومات اللاعب</p>
          <div className="grid grid-cols-2 gap-3">
            <InfoRow label="العمر"   value={`${player.age} سنة`} />
            <InfoRow label="النادي"  value={player.club}         />
            <InfoRow label="الرقم"   value={`#${player.number || '—'}`} />
            <InfoRow label="الجنسية" value={player.team?.name || '—'}   />
          </div>
        </div>

        {/* WC Stats */}
        <div className="card p-4">
          <p className="text-sm font-bold text-muted-light mb-3">إحصائيات كأس العالم 2026</p>
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="الأهداف"   value={player.wcGoals    ?? player.stats?.goals    ?? 0} color="text-green"   />
            <StatBox label="المساعدات" value={player.stats?.assists  ?? 0}                       color="text-primary" />
            <StatBox label="المباريات" value={player.stats?.matches  ?? 0}                       color="text-text"    />
          </div>
        </div>

        {/* Career stats */}
        {player.stats && (
          <div className="card p-4">
            <p className="text-sm font-bold text-muted-light mb-3">الإحصائيات العامة</p>
            <div className="space-y-3">
              <StatBar label="الأهداف"   value={player.stats.goals}   max={20} color="bg-green" />
              <StatBar label="المساعدات" value={player.stats.assists}  max={20} color="bg-primary" />
              <StatBar label="المباريات" value={player.stats.matches}  max={30} color="bg-muted" />
            </div>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="bg-bg rounded-xl px-3 py-2.5">
      <p className="text-[10px] text-muted mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-text">{value}</p>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div className="bg-bg rounded-xl p-3 flex flex-col items-center gap-1">
      <span className={`text-3xl font-black ${color}`}>{value}</span>
      <span className="text-[10px] text-muted">{label}</span>
    </div>
  )
}

function StatBar({ label, value, max, color }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-muted">{label}</span>
        <span className="text-xs font-bold text-text">{value}</span>
      </div>
      <div className="progress-bar">
        <div className={`progress-fill ${color}`} style={{ width: `${pct}%`, background: 'unset' }} />
      </div>
    </div>
  )
}
