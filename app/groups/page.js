'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

// بيانات مجموعات كأس العالم 2026
const GROUPS = [
  { id: 'A', teams: [
    { id: '16',   name: 'المكسيك',          flag: '🇲🇽', stars: 0 },
    { id: '1531', name: 'جنوب أفريقيا',     flag: '🇿🇦', stars: 0 },
    { id: '149',  name: 'كوريا الجنوبية',   flag: '🇰🇷', stars: 0 },
    { id: '798',  name: 'التشيك',            flag: '🇨🇿', stars: 0 },
  ]},
  { id: 'B', teams: [
    { id: '101',  name: 'كندا',              flag: '🇨🇦', stars: 0 },
    { id: '776',  name: 'البوسنة والهرسك',  flag: '🇧🇦', stars: 0 },
    { id: '164',  name: 'قطر',               flag: '🇶🇦', stars: 0 },
    { id: '15',   name: 'سويسرا',            flag: '🇨🇭', stars: 0 },
  ]},
  { id: 'C', teams: [
    { id: '6',    name: 'البرازيل',          flag: '🇧🇷', stars: 5 },
    { id: '32',   name: 'المغرب',            flag: '🇲🇦', stars: 0 },
    { id: '507',  name: 'هايتي',             flag: '🇭🇹', stars: 0 },
    { id: '1108', name: 'اسكتلندا',          flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', stars: 0 },
  ]},
  { id: 'D', teams: [
    { id: '2',    name: 'الولايات المتحدة', flag: '🇺🇸', stars: 0 },
    { id: '779',  name: 'باراغواي',          flag: '🇵🇾', stars: 0 },
    { id: '25',   name: 'أستراليا',          flag: '🇦🇺', stars: 0 },
    { id: '741',  name: 'تركيا',             flag: '🇹🇷', stars: 0 },
  ]},
  { id: 'E', teams: [
    { id: '3',    name: 'ألمانيا',           flag: '🇩🇪', stars: 4 },
    { id: '1532', name: 'كوراساو',           flag: '🇨🇼', stars: 0 },
    { id: '31',   name: 'ساحل العاج',        flag: '🇨🇮', stars: 0 },
    { id: '57',   name: 'الإكوادور',         flag: '🇪🇨', stars: 0 },
  ]},
  { id: 'F', teams: [
    { id: '1',    name: 'هولندا',            flag: '🇳🇱', stars: 0 },
    { id: '26',   name: 'اليابان',           flag: '🇯🇵', stars: 0 },
    { id: '744',  name: 'السويد',            flag: '🇸🇪', stars: 0 },
    { id: '46',   name: 'تونس',              flag: '🇹🇳', stars: 0 },
  ]},
  { id: 'G', teams: [
    { id: '4',    name: 'بلجيكا',            flag: '🇧🇪', stars: 0 },
    { id: '36',   name: 'مصر',               flag: '🇪🇬', stars: 0 },
    { id: '66',   name: 'إيران',             flag: '🇮🇷', stars: 0 },
    { id: '1537', name: 'نيوزيلندا',         flag: '🇳🇿', stars: 0 },
  ]},
  { id: 'H', teams: [
    { id: '9',    name: 'إسبانيا',           flag: '🇪🇸', stars: 1 },
    { id: '1533', name: 'الرأس الأخضر',      flag: '🇨🇻', stars: 0 },
    { id: '141',  name: 'السعودية',          flag: '🇸🇦', stars: 0 },
    { id: '13',   name: 'أوروغواي',          flag: '🇺🇾', stars: 2 },
  ]},
  { id: 'I', teams: [
    { id: '2',    name: 'فرنسا',             flag: '🇫🇷', stars: 2 },
    { id: '33',   name: 'السنغال',           flag: '🇸🇳', stars: 0 },
    { id: '796',  name: 'العراق',            flag: '🇮🇶', stars: 0 },
    { id: '755',  name: 'النرويج',           flag: '🇳🇴', stars: 0 },
  ]},
  { id: 'J', teams: [
    { id: '26',   name: 'الأرجنتين',         flag: '🇦🇷', stars: 3 },
    { id: '46',   name: 'الجزائر',           flag: '🇩🇿', stars: 0 },
    { id: '775',  name: 'النمسا',            flag: '🇦🇹', stars: 0 },
    { id: '765',  name: 'الأردن',            flag: '🇯🇴', stars: 0 },
  ]},
  { id: 'K', teams: [
    { id: '27',   name: 'البرتغال',          flag: '🇵🇹', stars: 0 },
    { id: '56',   name: 'كولومبيا',          flag: '🇨🇴', stars: 0 },
    { id: '1534', name: 'أوزبكستان',         flag: '🇺🇿', stars: 0 },
    { id: '1535', name: 'الكونغو',           flag: '🇨🇩', stars: 0 },
  ]},
  { id: 'L', teams: [
    { id: '10',   name: 'إنجلترا',           flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stars: 1 },
    { id: '3',    name: 'كرواتيا',           flag: '🇭🇷', stars: 0 },
    { id: '14',   name: 'غانا',              flag: '🇬🇭', stars: 0 },
    { id: '1536', name: 'بنما',              flag: '🇵🇦', stars: 0 },
  ]},
]

const FILTER_ITEMS = [
  { id: 'all', label: 'كل المجموعات' },
  { id: 'A', label: 'A' }, { id: 'B', label: 'B' }, { id: 'C', label: 'C' },
  { id: 'D', label: 'D' }, { id: 'E', label: 'E' }, { id: 'F', label: 'F' },
  { id: 'G', label: 'G' }, { id: 'H', label: 'H' }, { id: 'I', label: 'I' },
  { id: 'J', label: 'J' }, { id: 'K', label: 'K' }, { id: 'L', label: 'L' },
]

export default function GroupsPage() {
  const [filter, setFilter] = useState('all')

  const visible = filter === 'all' ? GROUPS : GROUPS.filter(g => g.id === filter)

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
            <div className="flex gap-0.5">
              <span className="text-lg">🇨🇦</span>
              <span className="text-lg">🇲🇽</span>
              <span className="text-lg">🇺🇸</span>
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

        {/* Groups */}
        <div className="px-4 pb-4 space-y-3">
          {visible.map(group => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>

        {/* Legend */}
        <div className="mx-4 mb-4 card p-3">
          <div className="flex items-center gap-4 justify-center flex-wrap">
            <LegendItem color="bg-primary" label="يتأهل للدور الثاني (أفضل 2)" />
            <LegendItem color="bg-gold"    label="قد يتأهل (أفضل الثالثين)" />
          </div>
          <p className="text-center text-[10px] text-muted mt-2">
            ل = لعب &nbsp;·&nbsp; ف = فوز &nbsp;·&nbsp; ت = تعادل &nbsp;·&nbsp; خ = خسارة &nbsp;·&nbsp; ن = نقاط
          </p>
        </div>

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
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 border-b border-border active:bg-card-hover transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/30">
            <span className="text-white font-black text-sm">{group.id}</span>
          </div>
          <div>
            <span className="font-black text-text text-sm">المجموعة {group.id}</span>
            <span className="text-[10px] text-muted mr-2">
              {group.teams.map(t => t.flag).join(' ')}
            </span>
          </div>
        </div>
        <span className="text-muted text-xs">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <>
          {/* Table header */}
          <div className="flex items-center px-4 py-1.5 bg-card-hover border-b border-border">
            <span className="flex-1 text-[10px] text-muted font-bold">المنتخب</span>
            {['ل','ف','ت','خ','ن'].map(h => (
              <span key={h} className="w-7 text-center text-[10px] text-muted font-bold">{h}</span>
            ))}
          </div>

          {/* Teams */}
          {group.teams.map((team, i) => (
            <TeamRow key={team.id} team={team} rank={i + 1} qualify={i < 2} />
          ))}
        </>
      )}
    </div>
  )
}

function TeamRow({ team, rank, qualify }) {
  // قبل البطولة: كل الأرقام صفر
  const stats = { p: 0, w: 0, d: 0, l: 0, pts: 0 }

  return (
    <Link
      href={`/nation/${team.id}`}
      className={`flex items-center px-4 py-3 border-b border-border last:border-b-0 transition-colors active:bg-card-hover ${
        qualify ? 'border-r-2 border-r-primary' : ''
      }`}
    >
      {/* Rank */}
      <span className={`text-xs font-black w-5 ${
        rank === 1 ? 'text-gold' : rank === 2 ? 'text-primary' : 'text-muted'
      }`}>{rank}</span>

      {/* Flag + Name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xl flex-shrink-0">{team.flag}</span>
        <span className="text-sm font-bold text-text truncate">{team.name}</span>
        {team.stars > 0 && (
          <span className="text-[9px] text-gold flex-shrink-0">
            {'⭐'.repeat(Math.min(team.stars, 3))}
          </span>
        )}
      </div>

      {/* Stats */}
      {[stats.p, stats.w, stats.d, stats.l, stats.pts].map((val, i) => (
        <span
          key={i}
          className={`w-7 text-center text-xs ${
            i === 4 ? 'font-black text-primary' : 'text-muted font-medium'
          }`}
        >
          {val}
        </span>
      ))}
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
