'use client'

import { useParams } from 'next/navigation'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'

// بيانات ثابتة للمنتخبات البارزة — يُكمَّل لاحقاً من Strapi
const NATIONS_INFO = {
  '6': {
    name: 'البرازيل', flag: '🇧🇷', color: '#009C3B',
    titles: 5, runner: 2, semifinal: 11,
    coach: 'دوريفال جونيور',
    confederation: 'CONMEBOL',
    info: 'أكثر منتخب تتويجاً في تاريخ كأس العالم. فازت بالبطولة عام 1958، 1962، 1970، 1994، 2002.',
    players: [
      { name: 'فينيسيوس جونيور', position: 'جناح', club: 'ريال مدريد', number: 7, flag: '🇧🇷' },
      { name: 'رودريغو',          position: 'جناح', club: 'ريال مدريد', number: 11, flag: '🇧🇷' },
      { name: 'رافينيا',          position: 'جناح', club: 'برشلونة',    number: 10, flag: '🇧🇷' },
      { name: 'لوكاس باكيتا',    position: 'وسط',  club: 'وست هام',    number: 8,  flag: '🇧🇷' },
      { name: 'كاسيميرو',         position: 'وسط',  club: 'مانشستر يونايتد', number: 5, flag: '🇧🇷' },
      { name: 'ميليتاو',          position: 'مدافع',club: 'ريال مدريد', number: 3,  flag: '🇧🇷' },
      { name: 'أليسون',           position: 'حارس', club: 'ليفربول',    number: 1,  flag: '🇧🇷' },
    ],
    group: 'المجموعة C',
    wcMatches: [
      { date: 'الأحد 14 يونيو', time: '01:00 ص', opponent: 'المغرب', opponentFlag: '🇲🇦' },
    ],
  },
  '26': {
    name: 'الأرجنتين', flag: '🇦🇷', color: '#74ACDF',
    titles: 3, runner: 3, semifinal: 6,
    coach: 'ليونيل سكالوني',
    confederation: 'CONMEBOL',
    info: 'بطلة العالم الحالية. فازت بالبطولة عام 1978، 1986، 2022. تمتلك أفضل لاعب في التاريخ ليونيل ميسي.',
    players: [
      { name: 'ليونيل ميسي',   position: 'مهاجم', club: 'إنتر ميامي',  number: 10, flag: '🇦🇷' },
      { name: 'خوليان ألفاريز', position: 'مهاجم', club: 'أتلتيكو مدريد', number: 9, flag: '🇦🇷' },
      { name: 'رودريغو دي بول', position: 'وسط',  club: 'أتلتيكو مدريد', number: 11, flag: '🇦🇷' },
      { name: 'ماك أليستر',     position: 'وسط',  club: 'ليفربول',    number: 8,  flag: '🇦🇷' },
      { name: 'كريستيان رومرو', position: 'مدافع',club: 'توتنهام',     number: 13, flag: '🇦🇷' },
      { name: 'إيميليانو مارتينيز', position: 'حارس', club: 'أستون فيلا', number: 23, flag: '🇦🇷' },
    ],
    group: 'المجموعة J',
    wcMatches: [
      { date: 'الأربعاء 17 يونيو', time: '04:00 ص', opponent: 'الجزائر', opponentFlag: '🇩🇿' },
    ],
  },
  '2': {
    name: 'فرنسا', flag: '🇫🇷', color: '#002395',
    titles: 2, runner: 1, semifinal: 6,
    coach: 'ديدييه ديشامب',
    confederation: 'UEFA',
    info: 'فازت بالبطولة عام 1998 و2018. تمتلك أفضل مهاجم حالياً كيليان مبابي.',
    players: [
      { name: 'كيليان مبابي',    position: 'مهاجم', club: 'ريال مدريد', number: 10, flag: '🇫🇷' },
      { name: 'أنطوان غريزمان', position: 'مهاجم', club: 'أتلتيكو مدريد', number: 7, flag: '🇫🇷' },
      { name: 'أوريليان تشواميني', position: 'وسط', club: 'ريال مدريد', number: 8, flag: '🇫🇷' },
      { name: 'رابيو',           position: 'وسط',  club: 'مانشستر يونايتد', number: 14, flag: '🇫🇷' },
      { name: 'ديوت أوبامكال',   position: 'مدافع',club: 'أرسنال',     number: 5,  flag: '🇫🇷' },
      { name: 'مايك مينيان',     position: 'حارس', club: 'أتلتيكو مدريد', number: 16, flag: '🇫🇷' },
    ],
    group: 'المجموعة I',
    wcMatches: [
      { date: 'الثلاثاء 16 يونيو', time: '10:00 م', opponent: 'السنغال', opponentFlag: '🇸🇳' },
    ],
  },
}

const DEFAULT_NATION = {
  name: 'المنتخب', flag: '🏳️', color: '#3B82F6',
  titles: 0, runner: 0, semifinal: 0,
  coach: '—', confederation: '—',
  info: 'معلومات هذا المنتخب ستُضاف قريباً.',
  players: [], group: '—', wcMatches: [],
}

export default function NationPage() {
  const { id }   = useParams()
  const nation   = NATIONS_INFO[id] || DEFAULT_NATION
  const POSITIONS = ['حارس', 'مدافع', 'وسط', 'جناح', 'مهاجم']

  return (
    <div>
      <Header back title={nation.name} />

      <div className="page-content pb-8">

        {/* Hero */}
        <div className="relative overflow-hidden mx-4 mt-4 rounded-3xl" style={{ background: `linear-gradient(135deg, ${nation.color}30, ${nation.color}10)`, border: `1px solid ${nation.color}30` }}>
          <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 30% 50%, ${nation.color}, transparent)` }} />
          <div className="relative p-6 flex items-center gap-4">
            <span className="text-7xl">{nation.flag}</span>
            <div>
              <h1 className="text-2xl font-black text-text">{nation.name}</h1>
              <p className="text-sm text-muted mt-0.5">{nation.group}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">{nation.confederation}</span>
                {nation.titles > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gold-bg text-gold font-bold">🏆 {nation.titles}× بطل العالم</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 px-4 mt-4">
          <StatBox value={nation.titles}   label="ألقاب" color="text-gold" />
          <StatBox value={nation.runner}   label="وصيف"  color="text-muted-light" />
          <StatBox value={nation.semifinal} label="نصف نهائي" color="text-primary" />
        </div>

        {/* Info */}
        <div className="mx-4 mt-4 card p-4">
          <p className="text-xs font-bold text-muted mb-2">عن المنتخب</p>
          <p className="text-sm text-muted-light leading-relaxed">{nation.info}</p>
        </div>

        {/* Coach */}
        <div className="mx-4 mt-3 card p-4 flex items-center gap-3">
          <span className="text-2xl">👔</span>
          <div>
            <p className="text-xs text-muted">المدرب</p>
            <p className="font-bold text-text">{nation.coach}</p>
          </div>
        </div>

        {/* WC Matches */}
        {nation.wcMatches.length > 0 && (
          <div className="mx-4 mt-4">
            <p className="text-sm font-bold text-muted-light mb-2">مباريات كأس العالم</p>
            <div className="space-y-2">
              {nation.wcMatches.map((m, i) => (
                <div key={i} className="card p-3 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-text">{nation.flag} {nation.name} vs {m.opponentFlag} {m.opponent}</p>
                    <p className="text-[10px] text-muted mt-0.5">{m.date} · {m.time} KSA</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold">دور المجموعات</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Players */}
        {nation.players.length > 0 && (
          <div className="mx-4 mt-4">
            <p className="text-sm font-bold text-muted-light mb-2">اللاعبون البارزون</p>
            <div className="card overflow-hidden">
              {POSITIONS.map(pos => {
                const posPlayers = nation.players.filter(p => p.position === pos)
                if (posPlayers.length === 0) return null
                return (
                  <div key={pos}>
                    <div className="px-4 py-2 bg-card-hover">
                      <span className="text-[10px] font-black text-muted uppercase tracking-wider">{pos}</span>
                    </div>
                    {posPlayers.map((player, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-xs font-black text-primary">{player.number}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-text">{player.name}</p>
                          <p className="text-[10px] text-muted">{player.club}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>

      <BottomNav />
    </div>
  )
}

function StatBox({ value, label, color }) {
  return (
    <div className="card p-3 flex flex-col items-center gap-1">
      <span className={`text-2xl font-black ${color}`}>{value}</span>
      <span className="text-[10px] text-muted">{label}</span>
    </div>
  )
}
