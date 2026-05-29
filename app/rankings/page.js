'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { fetchStandings } from '@/lib/api-football'

export default function RankingsPage() {
  const [standings,    setStandings]    = useState(null)
  const [groupFilter,  setGroupFilter]  = useState('all')
  const [sortBy,       setSortBy]       = useState('pts')

  useEffect(() => {
    fetchStandings()
      .then(data => setStandings(data || []))
      .catch(() => setStandings([]))
  }, [])

  // ── بناء قائمة المنتخبات ─────────────────────────────────────────────────────
  const allTeams = (standings || []).flatMap(g =>
    (g.teams || []).map(t => ({ ...t, groupId: g.id, groupName: g.name || `المجموعة ${g.id}` }))
  )

  const filtered = groupFilter === 'all'
    ? allTeams
    : allTeams.filter(t => t.groupId === groupFilter)

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'w')  return (b.won ?? 0) - (a.won  ?? 0) || (b.pts ?? 0) - (a.pts ?? 0)
    if (sortBy === 'gf') return (b.gf  ?? 0) - (a.gf   ?? 0) || (b.pts ?? 0) - (a.pts ?? 0)
    if (b.pts !== a.pts) return (b.pts ?? 0) - (a.pts  ?? 0)
    return ((b.gf ?? 0) - (b.ga ?? 0)) - ((a.gf ?? 0) - (a.ga ?? 0))
  })

  const started = sorted.some(t => (t.played ?? 0) > 0)

  return (
    <div>
      <Header title="ترتيب المنتخبات" />

      <div className="page-content pb-24">

        {/* ── Banner ── */}
        <div className="px-4 pt-4 mb-3">
          <div className="card p-3 flex items-center gap-3 bg-primary/5 border-primary/20">
            <span className="text-2xl">🏆</span>
            <div className="flex-1">
              <p className="text-xs font-black text-text">كأس العالم 2026</p>
              <p className="text-[10px] text-muted">48 منتخب · 12 مجموعة</p>
            </div>
            <div className="flex gap-0.5">
              <span className="text-lg">🇨🇦</span>
              <span className="text-lg">🇲🇽</span>
              <span className="text-lg">🇺🇸</span>
            </div>
          </div>
        </div>

        {/* ── Sort buttons ── */}
        <div className="flex gap-2 px-4 mb-3">
          {[
            { id: 'pts', label: 'النقاط'      },
            { id: 'w',   label: 'الانتصارات'  },
            { id: 'gf',  label: 'الأهداف'     },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                sortBy === s.id ? 'bg-primary text-white shadow-md shadow-primary/30' : 'bg-card border border-border text-muted'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* ── Group filter ── */}
        <div className="flex gap-1.5 px-4 overflow-x-auto pb-2 mb-3 hide-scrollbar">
          <button
            onClick={() => setGroupFilter('all')}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              groupFilter === 'all' ? 'bg-primary text-white' : 'bg-card border border-border text-muted'
            }`}
          >
            الكل ({allTeams.length})
          </button>
          {(standings || []).map(g => (
            <button
              key={g.id}
              onClick={() => setGroupFilter(g.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                groupFilter === g.id ? 'bg-primary text-white' : 'bg-card border border-border text-muted'
              }`}
            >
              {g.id}
            </button>
          ))}
        </div>

        {/* ── قبل البطولة ── */}
        {standings !== null && !started && (
          <div className="mx-4 mb-3 card p-3 bg-primary/5 border-primary/20 text-center">
            <p className="text-xs text-muted">🕐 البطولة لم تبدأ بعد — الترتيب سيُحدَّث تلقائياً بعد كل مباراة</p>
          </div>
        )}

        {/* ── Loading ── */}
        {standings === null && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ── Standings Table ── */}
        {standings !== null && (
          <div className="mx-4 card overflow-hidden">
            {/* Table header */}
            <div className="flex items-center px-3 py-2 bg-card-hover border-b border-border">
              <span className="w-7 text-[10px] text-muted font-bold text-center">#</span>
              <span className="flex-1 text-[10px] text-muted font-bold">المنتخب</span>
              {['ل','ف','ت','خ','ف:ض','ن'].map(h => (
                <span key={h} className={`text-center text-[10px] font-bold ${
                  (h === 'ن' && sortBy === 'pts') || (h === 'ف' && sortBy === 'w') || (h === 'ف:ض' && sortBy === 'gf')
                    ? 'text-primary ' : 'text-muted '
                }${h === 'ف:ض' ? 'w-10' : 'w-7'}`}>{h}</span>
              ))}
            </div>

            {sorted.length === 0 && (
              <div className="py-10 text-center text-muted text-sm">لا توجد بيانات</div>
            )}

            {sorted.map((entry, i) => {
              const gd = (entry.gf ?? 0) - (entry.ga ?? 0)
              const qualify    = groupFilter === 'all' ? i < 24 : i < 2
              const mayQualify = !qualify && (groupFilter === 'all' ? i < 36 : i === 2)

              return (
                <div
                  key={`${entry.team?.id}-${i}`}
                  className={`flex items-center px-3 py-2.5 border-b border-border last:border-b-0
                    ${qualify    ? 'border-r-2 border-r-primary'  : ''}
                    ${mayQualify ? 'border-r-2 border-r-gold'     : ''}
                  `}
                >
                  <span className={`w-7 text-center text-xs font-black ${
                    i === 0 ? 'text-gold' : i === 1 ? 'text-primary' : i === 2 ? 'text-amber-600' : 'text-muted'
                  }`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                  </span>

                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-lg flex-shrink-0">{entry.team?.flag || '🏳️'}</span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-text truncate block">{entry.team?.name || ''}</span>
                      {groupFilter === 'all' && (
                        <span className="text-[9px] text-muted/60">{entry.groupName}</span>
                      )}
                    </div>
                  </div>

                  <span className="w-7  text-center text-xs text-muted">{entry.played ?? 0}</span>
                  <span className={`w-7  text-center text-xs font-bold ${sortBy === 'w'   ? 'text-green'   : 'text-muted'}`}>{entry.won  ?? 0}</span>
                  <span className="w-7  text-center text-xs text-muted">{entry.draw  ?? 0}</span>
                  <span className="w-7  text-center text-xs text-muted">{entry.lost  ?? 0}</span>
                  <span className={`w-10 text-center text-xs font-medium ${gd > 0 ? 'text-green' : gd < 0 ? 'text-live' : 'text-muted'}`}>
                    {gd > 0 ? `+${gd}` : gd}
                  </span>
                  <span className={`w-7  text-center text-xs font-black ${sortBy === 'pts' ? 'text-primary' : 'text-text'}`}>
                    {entry.pts ?? 0}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Legend ── */}
        {standings !== null && (
          <div className="mx-4 mt-3 mb-4 flex flex-wrap items-center gap-3 justify-center">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
              <span className="text-[10px] text-muted">يتأهل للدور الثاني</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm bg-gold" />
              <span className="text-[10px] text-muted">قد يتأهل (أفضل ثالث)</span>
            </div>
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  )
}
