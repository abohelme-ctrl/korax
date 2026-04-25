'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

const GROUPS_DATA = [
  { id: 'A', name: 'المجموعة A', teams: [
    { id: '16',   name: 'المكسيك',          flag: '🇲🇽', color: '#006847', stars: 0 },
    { id: '1531', name: 'جنوب أفريقيا',     flag: '🇿🇦', color: '#007A4D', stars: 0 },
    { id: '149',  name: 'كوريا الجنوبية',   flag: '🇰🇷', color: '#003478', stars: 0 },
    { id: '798',  name: 'التشيك',            flag: '🇨🇿', color: '#D7141A', stars: 0 },
  ]},
  { id: 'B', name: 'المجموعة B', teams: [
    { id: '101',  name: 'كندا',              flag: '🇨🇦', color: '#FF0000', stars: 0 },
    { id: '776',  name: 'البوسنة والهرسك',  flag: '🇧🇦', color: '#002395', stars: 0 },
    { id: '164',  name: 'قطر',               flag: '🇶🇦', color: '#8D1B3D', stars: 0 },
    { id: '15',   name: 'سويسرا',            flag: '🇨🇭', color: '#FF0000', stars: 0 },
  ]},
  { id: 'C', name: 'المجموعة C', teams: [
    { id: '6',    name: 'البرازيل',          flag: '🇧🇷', color: '#009C3B', stars: 5 },
    { id: '32',   name: 'المغرب',            flag: '🇲🇦', color: '#C1272D', stars: 0 },
    { id: '507',  name: 'هايتي',             flag: '🇭🇹', color: '#00209F', stars: 0 },
    { id: '1108', name: 'اسكتلندا',          flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: '#003580', stars: 0 },
  ]},
  { id: 'D', name: 'المجموعة D', teams: [
    { id: '2',    name: 'الولايات المتحدة', flag: '🇺🇸', color: '#0A3161', stars: 0 },
    { id: '779',  name: 'باراغواي',          flag: '🇵🇾', color: '#D52B1E', stars: 0 },
    { id: '25',   name: 'أستراليا',          flag: '🇦🇺', color: '#00843D', stars: 0 },
    { id: '741',  name: 'تركيا',             flag: '🇹🇷', color: '#E30A17', stars: 0 },
  ]},
  { id: 'E', name: 'المجموعة E', teams: [
    { id: '3',    name: 'ألمانيا',           flag: '🇩🇪', color: '#000000', stars: 4 },
    { id: '1532', name: 'كوراساو',           flag: '🇨🇼', color: '#003DA5', stars: 0 },
    { id: '31',   name: 'ساحل العاج',        flag: '🇨🇮', color: '#F77F00', stars: 0 },
    { id: '57',   name: 'الإكوادور',         flag: '🇪🇨', color: '#FFD100', stars: 0 },
  ]},
  { id: 'F', name: 'المجموعة F', teams: [
    { id: '1',    name: 'هولندا',            flag: '🇳🇱', color: '#FF4F00', stars: 0 },
    { id: '26',   name: 'اليابان',           flag: '🇯🇵', color: '#BC002D', stars: 0 },
    { id: '744',  name: 'السويد',            flag: '🇸🇪', color: '#006AA7', stars: 0 },
    { id: '46',   name: 'تونس',              flag: '🇹🇳', color: '#E70013', stars: 0 },
  ]},
  { id: 'G', name: 'المجموعة G', teams: [
    { id: '4',    name: 'بلجيكا',            flag: '🇧🇪', color: '#000000', stars: 0 },
    { id: '36',   name: 'مصر',               flag: '🇪🇬', color: '#C09300', stars: 0 },
    { id: '66',   name: 'إيران',             flag: '🇮🇷', color: '#239F40', stars: 0 },
    { id: '25',   name: 'نيوزيلندا',         flag: '🇳🇿', color: '#00247D', stars: 0 },
  ]},
  { id: 'H', name: 'المجموعة H', teams: [
    { id: '9',    name: 'إسبانيا',           flag: '🇪🇸', color: '#AA151B', stars: 1 },
    { id: '1533', name: 'الرأس الأخضر',      flag: '🇨🇻', color: '#003893', stars: 0 },
    { id: '141',  name: 'السعودية',          flag: '🇸🇦', color: '#006C35', stars: 0 },
    { id: '13',   name: 'أوروغواي',          flag: '🇺🇾', color: '#75AADB', stars: 2 },
  ]},
  { id: 'I', name: 'المجموعة I', teams: [
    { id: '2',    name: 'فرنسا',             flag: '🇫🇷', color: '#002395', stars: 2 },
    { id: '33',   name: 'السنغال',           flag: '🇸🇳', color: '#00853F', stars: 0 },
    { id: '796',  name: 'العراق',            flag: '🇮🇶', color: '#007A3D', stars: 0 },
    { id: '755',  name: 'النرويج',           flag: '🇳🇴', color: '#EF2B2D', stars: 0 },
  ]},
  { id: 'J', name: 'المجموعة J', teams: [
    { id: '26',   name: 'الأرجنتين',         flag: '🇦🇷', color: '#74ACDF', stars: 3 },
    { id: '46',   name: 'الجزائر',           flag: '🇩🇿', color: '#006233', stars: 0 },
    { id: '775',  name: 'النمسا',            flag: '🇦🇹', color: '#ED2939', stars: 0 },
    { id: '765',  name: 'الأردن',            flag: '🇯🇴', color: '#007A3D', stars: 0 },
  ]},
  { id: 'K', name: 'المجموعة K', teams: [
    { id: '27',   name: 'البرتغال',          flag: '🇵🇹', color: '#006600', stars: 0 },
    { id: '56',   name: 'كولومبيا',          flag: '🇨🇴', color: '#FCD116', stars: 0 },
    { id: '1534', name: 'أوزبكستان',         flag: '🇺🇿', color: '#1EB53A', stars: 0 },
    { id: '1535', name: 'الكونغو',           flag: '🇨🇩', color: '#007FFF', stars: 0 },
  ]},
  { id: 'L', name: 'المجموعة L', teams: [
    { id: '10',   name: 'إنجلترا',           flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#FFFFFF', stars: 1 },
    { id: '3',    name: 'كرواتيا',           flag: '🇭🇷', color: '#FF0000', stars: 0 },
    { id: '14',   name: 'غانا',              flag: '🇬🇭', color: '#006B3F', stars: 0 },
    { id: '1536', name: 'بنما',              flag: '🇵🇦', color: '#005293', stars: 0 },
  ]},
]

const CONFEDERATIONS = [
  { id: 'all',  label: 'الكل'   },
  { id: 'UEFA', label: 'أوروبا' },
  { id: 'CONMEBOL', label: 'أمريكا الجنوبية' },
  { id: 'CAF',  label: 'أفريقيا' },
  { id: 'AFC',  label: 'آسيا'   },
  { id: 'CONCACAF', label: 'أمريكا الشمالية' },
  { id: 'OFC',  label: 'أوقيانوسيا' },
]

export default function NationsPage() {
  const [search, setSearch]   = useState('')
  const [view, setView]       = useState('groups') // groups | all

  const allTeams = GROUPS_DATA.flatMap(g => g.teams.map(t => ({ ...t, group: g.name })))
  const filtered = allTeams.filter(t =>
    t.name.includes(search) || t.group.includes(search)
  )

  return (
    <div>
      <Header title="المنتخبات" />

      <div className="page-content px-4 py-4">

        {/* Search */}
        <div className="relative mb-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن منتخب..."
            className="w-full bg-card border border-border rounded-2xl px-4 py-3 pr-10 text-text text-sm outline-none focus:border-primary transition-colors"
          />
          <span className="absolute right-3 top-3 text-muted text-lg">🔍</span>
        </div>

        {/* View toggle */}
        {!search && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setView('groups')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${view === 'groups' ? 'bg-primary text-white' : 'bg-card border border-border text-muted'}`}
            >
              حسب المجموعة
            </button>
            <button
              onClick={() => setView('all')}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${view === 'all' ? 'bg-primary text-white' : 'bg-card border border-border text-muted'}`}
            >
              كل المنتخبات
            </button>
          </div>
        )}

        {/* Tournament info */}
        {!search && view === 'groups' && (
          <div className="card p-3 mb-4 flex items-center gap-3 bg-primary/5 border-primary/20">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-xs font-bold text-text">كأس العالم 2026</p>
              <p className="text-[10px] text-muted">48 منتخب · 12 مجموعة · 3 دول مضيفة</p>
            </div>
            <div className="flex gap-1 mr-auto">
              <span>🇨🇦</span><span>🇲🇽</span><span>🇺🇸</span>
            </div>
          </div>
        )}

        {/* Search results */}
        {search ? (
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <span className="text-4xl block mb-2">🔍</span>
                <p className="text-sm">لا توجد نتائج</p>
              </div>
            ) : (
              filtered.map(team => <TeamRow key={team.id + team.group} team={team} showGroup />)
            )}
          </div>
        ) : view === 'groups' ? (
          /* Groups view */
          <div className="space-y-4">
            {GROUPS_DATA.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        ) : (
          /* All teams A-Z */
          <div className="space-y-2">
            {[...allTeams].sort((a, b) => a.name.localeCompare(b.name, 'ar')).map(team => (
              <TeamRow key={team.id + team.group} team={team} showGroup />
            ))}
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  )
}

// ─── Group Card ────────────────────────────────────────────────────────────────

function GroupCard({ group }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-border"
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-black text-xs">{group.id}</span>
          </div>
          <span className="font-black text-text">{group.name}</span>
        </div>
        <span className="text-muted text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div>
          {group.teams.map(team => (
            <TeamRow key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Team Row ──────────────────────────────────────────────────────────────────

function TeamRow({ team, showGroup }) {
  return (
    <Link
      href={`/nation/${team.id}`}
      className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-card-hover transition-colors active:scale-98"
    >
      {/* Flag */}
      <span className="text-3xl flex-shrink-0">{team.flag}</span>

      {/* Name + group */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-text">{team.name}</p>
        {showGroup && <p className="text-[10px] text-muted">{team.group}</p>}
      </div>

      {/* Stars (World Cup wins) */}
      {team.stars > 0 && (
        <div className="flex gap-0.5">
          {Array.from({ length: team.stars }).map((_, i) => (
            <span key={i} className="text-[10px]">⭐</span>
          ))}
        </div>
      )}

      {/* Arrow */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-muted flex-shrink-0" style={{ transform: 'scaleX(-1)' }}>
        <path d="M14 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </Link>
  )
}
