'use client'

import { useState, useEffect, useRef, forwardRef, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { useAuth } from '@/lib/useAuth'
import { POINTS, AWARD_POINTS_MAP } from '@/lib/scoring'

// ─── بيانات المجموعات ─────────────────────────────────────────────────────────
const GROUPS = {
  A: [
    { id: '16',   name: 'المكسيك',          flag: '🇲🇽' },
    { id: '1531', name: 'جنوب أفريقيا',     flag: '🇿🇦' },
    { id: '149',  name: 'كوريا الجنوبية',   flag: '🇰🇷' },
    { id: '798',  name: 'التشيك',            flag: '🇨🇿' },
  ],
  B: [
    { id: '101',  name: 'كندا',              flag: '🇨🇦' },
    { id: '776',  name: 'البوسنة والهرسك',  flag: '🇧🇦' },
    { id: '164',  name: 'قطر',               flag: '🇶🇦' },
    { id: '15',   name: 'سويسرا',            flag: '🇨🇭' },
  ],
  C: [
    { id: '6',    name: 'البرازيل',          flag: '🇧🇷' },
    { id: '32',   name: 'المغرب',            flag: '🇲🇦' },
    { id: '507',  name: 'هايتي',             flag: '🇭🇹' },
    { id: '1108', name: 'اسكتلندا',          flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
  ],
  D: [
    { id: '779',  name: 'باراغواي',          flag: '🇵🇾' },
    { id: '25',   name: 'أستراليا',          flag: '🇦🇺' },
    { id: '741',  name: 'تركيا',             flag: '🇹🇷' },
    { id: 'USA',  name: 'الولايات المتحدة', flag: '🇺🇸' },
  ],
  E: [
    { id: '3',    name: 'ألمانيا',           flag: '🇩🇪' },
    { id: '1532', name: 'كوراساو',           flag: '🇨🇼' },
    { id: '31',   name: 'ساحل العاج',        flag: '🇨🇮' },
    { id: '57',   name: 'الإكوادور',         flag: '🇪🇨' },
  ],
  F: [
    { id: '1',    name: 'هولندا',            flag: '🇳🇱' },
    { id: '2601', name: 'اليابان',           flag: '🇯🇵' },
    { id: '744',  name: 'السويد',            flag: '🇸🇪' },
    { id: '4601', name: 'تونس',              flag: '🇹🇳' },
  ],
  G: [
    { id: '26',   name: 'بلجيكا',           flag: '🇧🇪' },
    { id: '21',   name: 'مصر',               flag: '🇪🇬' },
    { id: '112',  name: 'إيران',             flag: '🇮🇷' },
    { id: '24',   name: 'نيوزيلندا',         flag: '🇳🇿' },
  ],
  H: [
    { id: '9',    name: 'إسبانيا',           flag: '🇪🇸' },
    { id: '1529', name: 'الرأس الأخضر',      flag: '🇨🇻' },
    { id: '23',   name: 'السعودية',          flag: '🇸🇦' },
    { id: '66',   name: 'أوروغواي',          flag: '🇺🇾' },
  ],
  I: [
    { id: '2',    name: 'فرنسا',            flag: '🇫🇷' },
    { id: '43',   name: 'السنغال',           flag: '🇸🇳' },
    { id: '50',   name: 'العراق',            flag: '🇮🇶' },
    { id: '27',   name: 'النرويج',           flag: '🇳🇴' },
  ],
  J: [
    { id: '141',  name: 'الأرجنتين',        flag: '🇦🇷' },
    { id: '60',   name: 'الجزائر',           flag: '🇩🇿' },
    { id: '110',  name: 'النمسا',            flag: '🇦🇹' },
    { id: '10',   name: 'الأردن',            flag: '🇯🇴' },
  ],
  K: [
    { id: '3001', name: 'البرتغال',          flag: '🇵🇹' },
    { id: '85',   name: 'كولومبيا',          flag: '🇨🇴' },
    { id: '1530', name: 'أوزبكستان',         flag: '🇺🇿' },
    { id: '36',   name: 'الكونغو',           flag: '🇨🇩' },
  ],
  L: [
    { id: '33',   name: 'إنجلترا',           flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: '96',   name: 'كرواتيا',           flag: '🇭🇷' },
    { id: '48',   name: 'غانا',              flag: '🇬🇭' },
    { id: '4601', name: 'بنما',              flag: '🇵🇦' },
  ],
}

const ALL_TEAMS = Object.entries(GROUPS).flatMap(([group, teams]) =>
  teams.map(t => ({ ...t, group }))
)

const AWARDS = [
  { id: 'champion',   label: 'بطل كأس العالم 2026',   icon: '🏆', desc: 'من ستتوج بطلة؟',            type: 'team',   pts: POINTS.AWARD_CHAMPION,   color: 'border-gold/50 bg-gold/5'           },
  { id: 'finalist',   label: 'الوصيف',                icon: '🥈', desc: 'من يصل للنهائي ويخسره؟',    type: 'team',   pts: POINTS.AWARD_FINALIST,   color: 'border-border bg-card'              },
  { id: 'surprise',   label: 'منتخب المفاجأة',        icon: '⚡', desc: 'من يصنع المفاجأة الكبرى؟',   type: 'team',   pts: POINTS.AWARD_SURPRISE,   color: 'border-purple-400/30 bg-purple-400/5'},
  { id: 'topScorer',  label: 'هداف البطولة',           icon: '👟', desc: 'من سيحمل الحذاء الذهبي؟',   type: 'player', pts: POINTS.AWARD_TOPSCORER,  color: 'border-green-400/30 bg-green-400/5' },
  { id: 'bestPlayer', label: 'أفضل لاعب',              icon: '⭐', desc: 'من سيحمل الكرة الذهبية؟',   type: 'player', pts: POINTS.AWARD_BESTPLAYER, color: 'border-primary/30 bg-primary/5'     },
]

const LS_AWARDS_KEY = 'korax_award_picks'
const LS_GROUPS_KEY = 'korax_group_picks'

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
export default function PredictPage() {
  const { isLoggedIn, strapiToken } = useAuth()

  const [tab, setTab]               = useState('awards')
  const [awardPicks, setAwardPicks] = useState({})
  const [groupPicks, setGroupPicks] = useState({})
  const [modal, setModal]           = useState(null)   // { type: 'award'|'group', id, slot? }
  const [search, setSearch]         = useState('')
  const [toast, setToast]           = useState('')
  const [showCard, setShowCard]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [locks, setLocks]           = useState({ awardsLocked: false, lockedGroups: [] })

  // ─── تحميل إعدادات القفل ────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(s => setLocks(s)).catch(() => {})
  }, [])

  // ─── تحميل من localStorage ──────────────────────────────────────────────────
  useEffect(() => {
    try { setAwardPicks(JSON.parse(localStorage.getItem(LS_AWARDS_KEY) || '{}')) } catch {}
    try { setGroupPicks(JSON.parse(localStorage.getItem(LS_GROUPS_KEY) || '{}')) } catch {}
  }, [])

  // ─── تحميل من Strapi ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) return
    fetch('/api/predictions')
      .then(r => r.json())
      .then(preds => {
        if (!Array.isArray(preds)) return
        const awards = {}
        const groups = {}
        preds.forEach(p => {
          const mid = p.matchId || ''
          if (mid.startsWith('award_')) {
            const awardId = mid.replace('award_', '')
            const award = AWARDS.find(a => a.id === awardId)
            if (!award) return
            if (award.type === 'team') {
              const team = ALL_TEAMS.find(t => t.name === p.homeTeam)
              if (team) awards[awardId] = team
            } else {
              if (p.homeTeam) awards[awardId] = p.homeTeam
            }
          } else if (mid.startsWith('group_')) {
            const [, grp, slot] = mid.split('_')  // group_A_1st or group_A_2nd
            if (!groups[grp]) groups[grp] = {}
            const team = GROUPS[grp]?.find(t => t.name === p.homeTeam)
            if (team) groups[grp][slot] = team
          }
        })
        if (Object.keys(awards).length > 0) {
          setAwardPicks(prev => ({ ...prev, ...awards }))
          localStorage.setItem(LS_AWARDS_KEY, JSON.stringify({ ...JSON.parse(localStorage.getItem(LS_AWARDS_KEY) || '{}'), ...awards }))
        }
        if (Object.keys(groups).length > 0) {
          setGroupPicks(prev => ({ ...prev, ...groups }))
          localStorage.setItem(LS_GROUPS_KEY, JSON.stringify({ ...JSON.parse(localStorage.getItem(LS_GROUPS_KEY) || '{}'), ...groups }))
        }
      })
      .catch(() => {})
  }, [isLoggedIn])

  // ─── حفظ توقع إلى Strapi ────────────────────────────────────────────────────
  const saveToStrapi = useCallback(async (matchId, homeTeam) => {
    if (!isLoggedIn || !strapiToken) return
    try {
      await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId,
          homeTeam,
          awayTeam: '',
          homeScore: 0,
          awayScore: 0,
          matchDate: '2026-07-19',
        }),
      })
    } catch {}
  }, [isLoggedIn, strapiToken])

  // ─── حفظ توقع جائزة ─────────────────────────────────────────────────────────
  function saveAwardPick(awardId, value) {
    const next = { ...awardPicks, [awardId]: value }
    setAwardPicks(next)
    localStorage.setItem(LS_AWARDS_KEY, JSON.stringify(next))
    setModal(null)
    setSearch('')
    showToast('تم الحفظ ✓')
    const teamName = typeof value === 'object' ? value.name : value
    saveToStrapi(`award_${awardId}`, teamName)
  }

  function removeAwardPick(awardId) {
    const next = { ...awardPicks }
    delete next[awardId]
    setAwardPicks(next)
    localStorage.setItem(LS_AWARDS_KEY, JSON.stringify(next))
  }

  // ─── حفظ توقع مجموعة ────────────────────────────────────────────────────────
  function saveGroupPick(grp, slot, team) {
    const grpPicks = groupPicks[grp] || {}
    // لو اختار نفس الفريق للمركزين — امسح الآخر
    const otherSlot = slot === '1st' ? '2nd' : '1st'
    if (grpPicks[otherSlot]?.id === team.id) {
      grpPicks[otherSlot] = null
    }
    const next = { ...groupPicks, [grp]: { ...grpPicks, [slot]: team } }
    setGroupPicks(next)
    localStorage.setItem(LS_GROUPS_KEY, JSON.stringify(next))
    setModal(null)
    showToast('تم الحفظ ✓')
    saveToStrapi(`group_${grp}_${slot}`, team.name)
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  async function handleShare() {
    const c = awardPicks.champion
    const f = awardPicks.finalist
    const s = awardPicks.surprise
    const sc = awardPicks.topScorer
    const b  = awardPicks.bestPlayer

    const lines = ['🏆 توقعاتي لكأس العالم 2026:\n']
    if (c)  lines.push(`🥇 البطل: ${c.flag} ${c.name}`)
    if (f)  lines.push(`🥈 الوصيف: ${f.flag} ${f.name}`)
    if (s)  lines.push(`⚡ المفاجأة: ${s.flag} ${s.name}`)
    if (sc) lines.push(`👟 الهداف: ${sc}`)
    if (b)  lines.push(`⭐ أفضل لاعب: ${b}`)
    lines.push('\nوأنت؟ شارك توقعاتك 👇\nkorax.live')

    const text = lines.join('\n')
    if (navigator.share) {
      try { await navigator.share({ title: 'KoraX · توقعاتي', text, url: 'https://korax.live' }) } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      showToast('تم نسخ التوقعات ✓')
    }
  }

  // ─── حساب التقدم ────────────────────────────────────────────────────────────
  const awardDone  = AWARDS.filter(a => awardPicks[a.id]).length
  const groupTotal = Object.keys(GROUPS).length * 2
  const groupDone  = Object.values(groupPicks).reduce((n, g) => n + (g['1st'] ? 1 : 0) + (g['2nd'] ? 1 : 0), 0)

  const activeAward   = modal?.type === 'award' ? AWARDS.find(a => a.id === modal.id) : null
  const teamSearch    = search.trim().toLowerCase()
  const filteredTeams = teamSearch
    ? ALL_TEAMS.filter(t => t.name.includes(search.trim()))
    : (modal?.type === 'group' ? (GROUPS[modal.id] || []) : ALL_TEAMS)

  return (
    <div>
      <Header title="توقعاتي الكبرى" back />

      <div className="page-content pb-24">

        {/* ─── Tabs ─── */}
        <div className="flex gap-2 px-4 pt-4 pb-2">
          {[
            { id: 'awards', label: '🏆 الجوائز',     done: awardDone, total: AWARDS.length },
            { id: 'groups', label: '📊 المجموعات',   done: groupDone, total: groupTotal    },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all flex flex-col items-center gap-0.5 ${
                tab === t.id
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'bg-card border border-border text-muted'
              }`}
            >
              <span>{t.label}</span>
              <span className={`text-[10px] font-black ${tab === t.id ? 'text-white/80' : 'text-muted'}`}>
                {t.done}/{t.total}
              </span>
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            التبويب الأول: الجوائز الكبرى
        ════════════════════════════════════════════════════════════════════════ */}
        {tab === 'awards' && (
          <>
            {/* تنبيه قفل الجوائز */}
            {locks.awardsLocked && (
              <div className="mx-4 mb-1 p-3 rounded-2xl bg-live/10 border border-live/30 flex items-center gap-2">
                <span className="text-lg">🔒</span>
                <p className="text-sm font-bold text-live">توقعات الجوائز مغلقة — انتهى وقت التعديل</p>
              </div>
            )}

            {/* Progress */}
            <div className="px-4 pb-2">
              <div className="h-1.5 bg-card rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-gold rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((awardDone / AWARDS.length) * 100)}%` }}
                />
              </div>
            </div>

            {/* Award Cards */}
            <div className="px-4 space-y-3">
              {AWARDS.map(award => {
                const pick    = awardPicks[award.id]
                const locked  = locks.awardsLocked
                return (
                  <div key={award.id} className={`card border-2 ${award.color} overflow-hidden ${locked ? 'opacity-80' : ''}`}>
                    <div className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{award.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm text-text">{award.label}</p>
                          <p className="text-[11px] text-muted">{award.desc}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {locked
                            ? <span className="text-[11px] font-black text-live bg-live/10 px-2 py-0.5 rounded-full">🔒 مغلق</span>
                            : <span className="text-[11px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{award.pts} نقطة</span>
                          }
                          {pick && !locked && (
                            <button onClick={() => removeAwardPick(award.id)} className="text-muted text-xs p-1">✕</button>
                          )}
                        </div>
                      </div>

                      {pick ? (
                        <button
                          onClick={() => !locked && (setModal({ type: 'award', id: award.id }), setSearch(''))}
                          className={`mt-3 flex items-center gap-3 w-full bg-bg/60 rounded-xl p-3 transition-transform ${locked ? 'cursor-not-allowed' : 'active:scale-95'}`}
                        >
                          {award.type === 'team' ? (
                            <>
                              <span className="text-3xl">{pick.flag}</span>
                              <div className="text-right flex-1">
                                <p className="font-black text-base text-text">{pick.name}</p>
                                <p className="text-[10px] text-muted">المجموعة {pick.group}</p>
                              </div>
                              {!locked && <span className="text-muted text-xs">تغيير</span>}
                            </>
                          ) : (
                            <>
                              <span className="text-2xl">✏️</span>
                              <p className="font-bold text-text flex-1 text-right">{pick}</p>
                              {!locked && <span className="text-muted text-xs">تغيير</span>}
                            </>
                          )}
                        </button>
                      ) : locked ? (
                        <div className="mt-3 flex items-center justify-center gap-2 w-full border-2 border-dashed border-live/30 rounded-xl py-3 text-sm text-live/60">
                          <span>🔒</span>
                          <span className="font-bold">مغلق</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setModal({ type: 'award', id: award.id }); setSearch('') }}
                          className="mt-3 flex items-center justify-center gap-2 w-full border-2 border-dashed border-border rounded-xl py-3 text-sm text-muted active:border-primary active:text-primary transition-colors"
                        >
                          <span className="text-lg">+</span>
                          <span className="font-bold">اختر الآن</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Share Card */}
            {awardDone > 0 && (
              <div className="mx-4 mt-4">
                <button
                  onClick={() => setShowCard(v => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 card border-primary/30 text-sm font-bold text-primary"
                >
                  <span>🃏 معاينة بطاقة المشاركة</span>
                  <span>{showCard ? '▲' : '▼'}</span>
                </button>
                {showCard && (
                  <div className="mt-2">
                    <ShareCard picks={awardPicks} />
                    <p className="text-center text-[10px] text-muted mt-2">صوّر الشاشة وأرسل لأصدقائك</p>
                  </div>
                )}
              </div>
            )}

            {awardDone > 0 && (
              <div className="px-4 mt-4">
                <button
                  onClick={handleShare}
                  className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/30"
                >
                  <span>📤</span>
                  <span>شارك توقعاتي</span>
                </button>
              </div>
            )}

            <div className="mx-4 mt-4">
              <Link href="/simulator" className="flex items-center gap-3 card p-4 active:border-primary transition-colors">
                <span className="text-3xl">🏟️</span>
                <div className="flex-1">
                  <p className="font-black text-sm text-text">محاكي البطولة</p>
                  <p className="text-[11px] text-muted">جهّز البطولة كاملة حتى النهائي</p>
                </div>
                <span className="text-primary text-lg">←</span>
              </Link>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            التبويب الثاني: ترتيب المجموعات
        ════════════════════════════════════════════════════════════════════════ */}
        {tab === 'groups' && (
          <div className="px-4 space-y-3">

            {/* شرح النقاط */}
            <div className="card p-3 border-primary/20 bg-primary/5">
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-xl font-black text-primary">{POINTS.GROUP_FIRST}</p>
                  <p className="text-[10px] text-muted">نقاط المركز الأول</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-xl font-black text-gold">{POINTS.GROUP_SECOND}</p>
                  <p className="text-[10px] text-muted">نقاط المركز الثاني</p>
                </div>
                <div className="w-px bg-border" />
                <div>
                  <p className="text-xl font-black text-text">{POINTS.GROUP_FIRST * 12 + POINTS.GROUP_SECOND * 12}</p>
                  <p className="text-[10px] text-muted">أقصى نقاط ممكنة</p>
                </div>
              </div>
            </div>

            {/* المجموعات */}
            {Object.entries(GROUPS).map(([grp, teams]) => {
              const grpPicks = groupPicks[grp] || {}
              const first    = grpPicks['1st']
              const second   = grpPicks['2nd']
              const locked   = locks.lockedGroups.includes(grp)

              return (
                <div key={grp} className={`card overflow-hidden ${locked ? 'opacity-80' : ''}`}>
                  <div className={`px-4 py-3 border-b border-border ${locked ? 'bg-live/5' : 'bg-primary/5'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`font-black ${locked ? 'text-live' : 'text-primary'}`}>المجموعة {grp}</span>
                        {locked && <span className="text-[10px] font-bold text-live bg-live/10 px-2 py-0.5 rounded-full">🔒 مغلق</span>}
                      </div>
                      <span className="text-[10px] text-muted">
                        {(first ? 1 : 0) + (second ? 1 : 0)}/2 محدد
                      </span>
                    </div>
                  </div>

                  <div className="p-3 grid grid-cols-2 gap-2">
                    {/* المركز الأول */}
                    <div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <span className="text-xs">🥇</span>
                        <span className="text-[10px] font-bold text-gold">المركز الأول</span>
                        <span className="text-[9px] text-muted mr-auto">+{POINTS.GROUP_FIRST} نقطة</span>
                      </div>
                      <button
                        onClick={() => !locked && setModal({ type: 'group', id: grp, slot: '1st' })}
                        className={`w-full rounded-xl p-2.5 border-2 text-center transition-all ${
                          locked        ? 'border-live/20 bg-live/5 cursor-not-allowed'
                          : first       ? 'border-gold/40 bg-gold/5 active:scale-95'
                          :               'border-dashed border-border active:scale-95'
                        }`}
                      >
                        {first ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-2xl">{first.flag}</span>
                            <span className="text-[10px] font-bold text-text">{first.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5 py-1">
                            <span className={`text-lg ${locked ? 'text-live/40' : 'text-muted'}`}>{locked ? '🔒' : '+'}</span>
                            <span className={`text-[10px] ${locked ? 'text-live/40' : 'text-muted'}`}>{locked ? 'مغلق' : 'اختر'}</span>
                          </div>
                        )}
                      </button>
                    </div>

                    {/* المركز الثاني */}
                    <div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <span className="text-xs">🥈</span>
                        <span className="text-[10px] font-bold text-muted-light">المركز الثاني</span>
                        <span className="text-[9px] text-muted mr-auto">+{POINTS.GROUP_SECOND} نقطة</span>
                      </div>
                      <button
                        onClick={() => !locked && setModal({ type: 'group', id: grp, slot: '2nd' })}
                        className={`w-full rounded-xl p-2.5 border-2 text-center transition-all ${
                          locked        ? 'border-live/20 bg-live/5 cursor-not-allowed'
                          : second      ? 'border-border bg-card active:scale-95'
                          :               'border-dashed border-border active:scale-95'
                        }`}
                      >
                        {second ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-2xl">{second.flag}</span>
                            <span className="text-[10px] font-bold text-text">{second.name}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5 py-1">
                            <span className={`text-lg ${locked ? 'text-live/40' : 'text-muted'}`}>{locked ? '🔒' : '+'}</span>
                            <span className={`text-[10px] ${locked ? 'text-live/40' : 'text-muted'}`}>{locked ? 'مغلق' : 'اختر'}</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* الفرق الصغيرة */}
                  <div className="px-3 pb-3 flex gap-1.5 flex-wrap">
                    {teams.map(t => (
                      <span key={t.id} className={`text-xs px-2 py-0.5 rounded-full border ${
                        first?.id === t.id ? 'border-gold/40 bg-gold/10 text-gold font-bold' :
                        second?.id === t.id ? 'border-border bg-card text-muted font-bold' :
                        'border-border text-muted'
                      }`}>
                        {t.flag} {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>

      {/* ─── Toast ─── */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-card border border-border px-4 py-2 rounded-full text-sm font-bold text-text shadow-xl z-50">
          {toast}
        </div>
      )}

      {/* ─── Modal: Team Picker للجوائز ─── */}
      {modal?.type === 'award' && activeAward?.type === 'team' && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => { setModal(null); setSearch('') }} />
          <div className="bg-bg rounded-t-3xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
              <p className="font-black text-text">{activeAward.icon} {activeAward.label}</p>
              <button onClick={() => { setModal(null); setSearch('') }} className="text-muted">✕</button>
            </div>
            <div className="px-4 py-2">
              <input
                type="text"
                placeholder="ابحث عن منتخب..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-card border border-border rounded-xl px-3 py-2 text-sm text-text placeholder:text-muted outline-none focus:border-primary"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto px-4 pb-6">
              <div className="grid grid-cols-3 gap-2 pt-2">
                {filteredTeams.map(team => (
                  <button
                    key={`${team.id}-${team.group}`}
                    onClick={() => saveAwardPick(modal.id, team)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all active:scale-95 ${
                      awardPicks[modal.id]?.name === team.name
                        ? 'bg-primary/10 border-primary'
                        : 'bg-card border-border'
                    }`}
                  >
                    <span className="text-3xl">{team.flag}</span>
                    <span className="text-[10px] font-bold text-text text-center leading-tight">{team.name}</span>
                    <span className="text-[9px] text-muted">{team.group}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Player Input ─── */}
      {modal?.type === 'award' && activeAward?.type === 'player' && (
        <PlayerInputModal
          award={activeAward}
          current={awardPicks[modal.id] || ''}
          onSave={val => saveAwardPick(modal.id, val)}
          onClose={() => { setModal(null); setSearch('') }}
        />
      )}

      {/* ─── Modal: Group Team Picker ─── */}
      {modal?.type === 'group' && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="bg-bg rounded-t-3xl flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
              <p className="font-black text-text">
                {modal.slot === '1st' ? '🥇 المركز الأول' : '🥈 المركز الثاني'} — المجموعة {modal.id}
              </p>
              <button onClick={() => setModal(null)} className="text-muted">✕</button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {(GROUPS[modal.id] || []).map(team => {
                const grpPicks   = groupPicks[modal.id] || {}
                const otherSlot  = modal.slot === '1st' ? '2nd' : '1st'
                const isSelected = grpPicks[modal.slot]?.id === team.id
                const isOther    = grpPicks[otherSlot]?.id === team.id
                return (
                  <button
                    key={team.id}
                    onClick={() => saveGroupPick(modal.id, modal.slot, team)}
                    disabled={isOther}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                      isSelected ? 'border-primary bg-primary/10'
                      : isOther  ? 'border-border bg-card opacity-40 cursor-not-allowed'
                      :            'border-border bg-card'
                    }`}
                  >
                    <span className="text-3xl">{team.flag}</span>
                    <div className="text-right flex-1">
                      <p className="font-bold text-sm text-text">{team.name}</p>
                      {isOther && <p className="text-[10px] text-muted">محدد للمركز الآخر</p>}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

// ─── بطاقة المشاركة ───────────────────────────────────────────────────────────
const ShareCard = forwardRef(function ShareCard({ picks }, ref) {
  const c  = picks.champion
  const f  = picks.finalist
  const s  = picks.surprise
  const sc = picks.topScorer
  const b  = picks.bestPlayer

  return (
    <div
      ref={ref}
      className="relative rounded-3xl overflow-hidden mx-auto"
      style={{ background: 'linear-gradient(135deg,#0F172A 0%,#0F2240 50%,#1A1040 100%)', maxWidth: 380, boxShadow: '0 0 40px rgba(59,130,246,0.3)' }}
    >
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle,#3B82F6,transparent)', transform: 'translate(30%,-30%)' }} />
      <div className="h-1" style={{ background: 'linear-gradient(90deg,transparent,#F59E0B,transparent)' }} />
      <div className="px-6 py-5 relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-black text-blue-300 tracking-widest">KORAX.LIVE</span>
          <span className="text-[11px] text-blue-300/70">كأس العالم 2026</span>
        </div>
        <p className="text-white font-black text-lg text-center mb-4">توقعاتي الكبرى 🏆</p>
        {c && (
          <div className="flex flex-col items-center mb-4 py-4 rounded-2xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <span className="text-[10px] text-yellow-400 font-bold mb-1">🏆 بطل البطولة</span>
            <span className="text-6xl mb-1">{c.flag}</span>
            <span className="text-white font-black text-xl">{c.name}</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {f  && <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}><p className="text-[9px] text-gray-400 mb-1">🥈 الوصيف</p><span className="text-2xl">{f.flag}</span><p className="text-white text-[11px] font-bold mt-0.5">{f.name}</p></div>}
          {s  && <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(167,139,250,0.1)' }}><p className="text-[9px] text-purple-300 mb-1">⚡ المفاجأة</p><span className="text-2xl">{s.flag}</span><p className="text-white text-[11px] font-bold mt-0.5">{s.name}</p></div>}
          {sc && <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(52,211,153,0.08)' }}><p className="text-[9px] text-green-400 mb-1">👟 الهداف</p><p className="text-white text-[11px] font-bold">{sc}</p></div>}
          {b  && <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(59,130,246,0.08)' }}><p className="text-[9px] text-blue-400 mb-1">⭐ أفضل لاعب</p><p className="text-white text-[11px] font-bold">{b}</p></div>}
        </div>
        <div className="text-center">
          <p className="text-[11px] text-blue-300/80">وأنت؟ شاركني توقعاتك 👇</p>
          <p className="text-[13px] font-black text-white mt-0.5">korax.live</p>
        </div>
      </div>
      <div className="h-1" style={{ background: 'linear-gradient(90deg,transparent,#F59E0B,transparent)' }} />
    </div>
  )
})

// ─── مودال إدخال اسم اللاعب ───────────────────────────────────────────────────
function PlayerInputModal({ award, current, onSave, onClose }) {
  const [val, setVal] = useState(current)
  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-bg rounded-t-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-black text-text">{award.icon} {award.label}</p>
          <button onClick={onClose} className="text-muted">✕</button>
        </div>
        <p className="text-muted text-sm">{award.desc}</p>
        <input
          type="text"
          placeholder="اكتب اسم اللاعب..."
          value={val}
          onChange={e => setVal(e.target.value)}
          className="w-full bg-card border border-border rounded-xl px-4 py-3 text-text placeholder:text-muted outline-none focus:border-primary text-base"
          autoFocus
        />
        <button
          onClick={() => val.trim() && onSave(val.trim())}
          disabled={!val.trim()}
          className="w-full py-3 rounded-2xl bg-primary text-white font-black disabled:opacity-40 active:scale-95 transition-transform"
        >
          حفظ الاختيار
        </button>
      </div>
    </div>
  )
}
