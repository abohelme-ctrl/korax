'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { fetchStandings } from '@/lib/api-football'

// بيانات ثابتة كاحتياط قبل بدء البطولة
const STATIC_GROUPS = [
  { id: 'A', teams: [
    { id: '16',   name: 'المكسيك',          flag: '🇲🇽' },
    { id: '1531', name: 'جنوب أفريقيا',     flag: '🇿🇦' },
    { id: '149',  name: 'كوريا الجنوبية',   flag: '🇰🇷' },
    { id: '798',  name: 'التشيك',            flag: '🇨🇿' },
  ]},
  { id: 'B', teams: [
    { id: '101',  name: 'كندا',              flag: '🇨🇦' },
    { id: '776',  name: 'البوسنة والهرسك',  flag: '🇧🇦' },
    { id: '164',  name: 'قطر',               flag: '🇶🇦' },
    { id: '15',   name: 'سويسرا',            flag: '🇨🇭' },
  ]},
  { id: 'C', teams: [
    { id: '6',    name: 'البرازيل',          flag: '🇧🇷' },
    { id: '32',   name: 'المغرب',            flag: '🇲🇦' },
    { id: '507',  name: 'هايتي',             flag: '🇭🇹' },
    { id: '1108', name: 'اسكتلندا',          flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ]},
  { id: 'D', teams: [
    { id: '2',    name: 'الولايات المتحدة', flag: '🇺🇸' },
    { id: '779',  name: 'باراغواي',          flag: '🇵🇾' },
    { id: '25',   name: 'أستراليا',          flag: '🇦🇺' },
    { id: '741',  name: 'تركيا',             flag: '🇹🇷' },
  ]},
  { id: 'E', teams: [
    { id: '3',    name: 'ألمانيا',           flag: '🇩🇪' },
    { id: '1532', name: 'كوراساو',           flag: '🇨🇼' },
    { id: '31',   name: 'ساحل العاج',        flag: '🇨🇮' },
    { id: '57',   name: 'الإكوادور',         flag: '🇪🇨' },
  ]},
  { id: 'F', teams: [
    { id: '1',    name: 'هولندا',            flag: '🇳🇱' },
    { id: '2601', name: 'اليابان',           flag: '🇯🇵' },
    { id: '744',  name: 'السويد',            flag: '🇸🇪' },
    { id: '4601', name: 'تونس',              flag: '🇹🇳' },
  ]},
  { id: 'G', teams: [
    { id: '4',    name: 'بلجيكا',            flag: '🇧🇪' },
    { id: '36',   name: 'مصر',               flag: '🇪🇬' },
    { id: '66',   name: 'إيران',             flag: '🇮🇷' },
    { id: '1537', name: 'نيوزيلندا',         flag: '🇳🇿' },
  ]},
  { id: 'H', teams: [
    { id: '9',    name: 'إسبانيا',           flag: '🇪🇸' },
    { id: '1533', name: 'الرأس الأخضر',      flag: '🇨🇻' },
    { id: '141',  name: 'السعودية',          flag: '🇸🇦' },
    { id: '13',   name: 'أوروغواي',          flag: '🇺🇾' },
  ]},
  { id: 'I', teams: [
    { id: '2',    name: 'فرنسا',             flag: '🇫🇷' },
    { id: '33',   name: 'السنغال',           flag: '🇸🇳' },
    { id: '796',  name: 'العراق',            flag: '🇮🇶' },
    { id: '755',  name: 'النرويج',           flag: '🇳🇴' },
  ]},
  { id: 'J', teams: [
    { id: '26',   name: 'الأرجنتين',         flag: '🇦🇷' },
    { id: '46',   name: 'الجزائر',           flag: '🇩🇿' },
    { id: '775',  name: 'النمسا',            flag: '🇦🇹' },
    { id: '765',  name: 'الأردن',            flag: '🇯🇴' },
  ]},
  { id: 'K', teams: [
    { id: '27',   name: 'البرتغال',          flag: '🇵🇹' },
    { id: '56',   name: 'كولومبيا',          flag: '🇨🇴' },
    { id: '1534', name: 'أوزبكستان',         flag: '🇺🇿' },
    { id: '1535', name: 'الكونغو',           flag: '🇨🇩' },
  ]},
  { id: 'L', teams: [
    { id: '10',   name: 'إنجلترا',           flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: '3001', name: 'كرواتيا',           flag: '🇭🇷' },
    { id: '14',   name: 'غانا',              flag: '🇬🇭' },
    { id: '1536', name: 'بنما',              flag: '🇵🇦' },
  ]},
]

const FILTER_ITEMS = [
  { id: 'all', label: 'كل المجموعات' },
  ...'ABCDEFGHIJKL'.split('').map(l => ({ id: l, label: l })),
]

export default function GroupsPage() {
  const [filter, setFilter]   = useState('all')
  const [groups, setGroups]   = useState(null)   // null = loading
  const [liveData, setLiveData] = useState(false) // هل البيانات حقيقية؟
  const [lastUpdate, setLastUpdate] = useState(null)

  useEffect(() => {
    loadStandings()
    // تحديث كل 5 دقائق
    const interval = setInterval(loadStandings, 5 * 60_000)
    return () => clearInterval(interval)
  }, [])

  async function loadStandings() {
    try {
      const data = await fetchStandings()
      if (data && data.length > 0 && data[0].teams?.[0]?.played !== undefined) {
        // بيانات حقيقية من API
        setGroups(data)
        setLiveData(true)
        setLastUpdate(new Date())
      } else {
        // قبل البطولة أو بيانات mock
        setGroups(STATIC_GROUPS.map(g => ({
          ...g,
          teams: g.teams.map(t => ({
            team: { id: t.id, name: t.name, flag: t.flag },
            played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0,
          }))
        })))
        setLiveData(false)
        setLastUpdate(new Date())
      }
    } catch {
      // عند الخطأ نعرض البيانات الثابتة
      setGroups(STATIC_GROUPS.map(g => ({
        ...g,
        teams: g.teams.map(t => ({
          team: { id: t.id, name: t.name, flag: t.flag },
          played: 0, won: 0, draw: 0, lost: 0, gf: 0, ga: 0, pts: 0,
        }))
      })))
      setLiveData(false)
    }
  }

  const visible = !groups ? [] : (
    filter === 'all' ? groups : groups.filter(g => g.id === filter)
  )

  return (
    <div>
      <Header title="المجموعات" />

      <div className="page-content">

        {/* Header info */}
        <div className="px-4 pt-4 mb-3">
          <div className="card p-3 flex items-center gap-3 bg-primary/5 border-primary/20">
            <span className="text-2xl">🏆</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-text">كأس العالم 2026</p>
              <p className="text-[10px] text-muted">48 منتخب · 12 مجموعة · تبدأ 11 يونيو</p>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex gap-0.5">
                <span className="text-lg">🇨🇦</span>
                <span className="text-lg">🇲🇽</span>
                <span className="text-lg">🇺🇸</span>
              </div>
              {liveData && lastUpdate && (
                <span className="text-[9px] text-green font-bold">
                  ● مباشر
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex gap-1.5 px-4 overflow-x-auto pb-2 mb-3 hide-scrollbar">
          {FILTER_ITEMS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === f.id
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-muted'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {!groups && (
          <div className="px-4 space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="card h-40 animate-pulse">
                <div className="h-full bg-card-hover rounded-2xl" />
              </div>
            ))}
          </div>
        )}

        {/* Groups */}
        {groups && (
          <div className="px-4 pb-4 space-y-3">
            {visible.map(group => (
              <GroupCard key={group.id} group={group} liveData={liveData} />
            ))}
          </div>
        )}

        {/* Legend */}
        {groups && (
          <div className="mx-4 mb-4 card p-3">
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <LegendItem color="bg-primary" label="يتأهل للدور الثاني (أفضل 2)" />
              <LegendItem color="bg-gold"    label="قد يتأهل (أفضل الثالثين)" />
            </div>
            <p className="text-center text-[10px] text-muted mt-2">
              ل = لعب &nbsp;·&nbsp; ف = فوز &nbsp;·&nbsp; ت = تعادل &nbsp;·&nbsp; خ = خسارة &nbsp;·&nbsp; ف:ض &nbsp;·&nbsp; ن = نقاط
            </p>
            {liveData && lastUpdate && (
              <p className="text-center text-[9px] text-muted/60 mt-1">
                آخر تحديث: {lastUpdate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  )
}

// ─── Group Card ────────────────────────────────────────────────────────────────

function GroupCard({ group, liveData }) {
  const [open, setOpen] = useState(true)

  // ترتيب المنتخبات: نقاط ← فرق الأهداف ← أهداف للمرمى
  const sortedTeams = [...group.teams].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts
    const gdA = a.gf - a.ga
    const gdB = b.gf - b.ga
    if (gdB !== gdA) return gdB - gdA
    return b.gf - a.gf
  })

  const groupLetter = group.id

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-border active:bg-card-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
            <span className="text-white font-black text-sm">{groupLetter}</span>
          </div>
          <div>
            <span className="font-black text-text text-sm">المجموعة {groupLetter}</span>
            <span className="text-[10px] text-muted mr-2">
              {sortedTeams.map(t => t.team?.flag || '🏳️').join(' ')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {liveData && sortedTeams.some(t => t.played > 0) && (
            <span className="text-[9px] text-green font-bold bg-green/10 px-1.5 py-0.5 rounded-full">● حي</span>
          )}
          <span className="text-muted text-xs">{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {open && (
        <>
          {/* Table header */}
          <div className="flex items-center px-4 py-1.5 bg-card-hover border-b border-border">
            <span className="flex-1 text-[10px] text-muted font-bold">المنتخب</span>
            {['ل','ف','ت','خ','ف:ض','ن'].map(h => (
              <span key={h} className={`text-center text-[10px] text-muted font-bold ${h === 'ف:ض' ? 'w-10' : 'w-7'}`}>{h}</span>
            ))}
          </div>

          {/* Teams */}
          {sortedTeams.map((entry, i) => (
            <TeamRow key={entry.team?.id || i} entry={entry} rank={i + 1} qualify={i < 2} />
          ))}
        </>
      )}
    </div>
  )
}

function TeamRow({ entry, rank, qualify }) {
  const { team, played, won, draw, lost, gf, ga, pts } = entry
  const gd = (gf || 0) - (ga || 0)

  return (
    <Link
      href={`/nation/${team?.id}`}
      className={`flex items-center px-4 py-3 border-b border-border last:border-b-0 transition-colors active:bg-card-hover ${
        qualify ? 'border-r-2 border-r-primary' : rank === 3 ? 'border-r-2 border-r-gold' : ''
      }`}
    >
      {/* Rank */}
      <span className={`text-xs font-black w-5 ${
        rank === 1 ? 'text-gold' : rank === 2 ? 'text-primary' : 'text-muted'
      }`}>{rank}</span>

      {/* Flag + Name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xl flex-shrink-0">{team?.flag || '🏳️'}</span>
        <span className="text-sm font-bold text-text truncate">{team?.name || ''}</span>
      </div>

      {/* Stats: ل ف ت خ ف:ض ن */}
      <span className="w-7 text-center text-xs text-muted font-medium">{played ?? 0}</span>
      <span className="w-7 text-center text-xs text-muted font-medium">{won ?? 0}</span>
      <span className="w-7 text-center text-xs text-muted font-medium">{draw ?? 0}</span>
      <span className="w-7 text-center text-xs text-muted font-medium">{lost ?? 0}</span>
      <span className={`w-10 text-center text-xs font-medium ${gd > 0 ? 'text-green' : gd < 0 ? 'text-live' : 'text-muted'}`}>
        {gd > 0 ? `+${gd}` : gd}
      </span>
      <span className="w-7 text-center text-xs font-black text-primary">{pts ?? 0}</span>
    </Link>
  )
}

function LegendItem({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2.5 h-2.5 rounded-sm ${color}`} />
      <span className="text-[10px] text-muted">{label}</span>
    </div>
  )
}
