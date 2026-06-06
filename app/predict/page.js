'use client'

import { useState, useEffect, useRef, forwardRef, useCallback } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { useAuth } from '@/lib/useAuth'
import { POINTS, AWARD_POINTS_MAP } from '@/lib/scoring'
import { getLeaderboard, getMyGroups, createGroup, joinGroup, setUserToken, deleteGroup, removeMemberFromGroup } from '@/lib/strapi'
import { getInitials, generateGroupCode } from '@/lib/utils'

const LS_FRIEND_GROUPS_KEY = 'korax_ranking_groups'
function loadLocalGroups() {
  try { return JSON.parse(localStorage.getItem(LS_FRIEND_GROUPS_KEY) || '[]') } catch { return [] }
}
function saveLocalGroups(g) { localStorage.setItem(LS_FRIEND_GROUPS_KEY, JSON.stringify(g)) }

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
  const [modal, setModal]           = useState(null)
  const [search, setSearch]         = useState('')
  const [toast, setToast]           = useState('')
  const [showCard, setShowCard]     = useState(false)
  const [saving, setSaving]         = useState(false)
  const [locks, setLocks]           = useState({ awardsLocked: false, lockedGroups: [] })
  const [myPoints, setMyPoints]     = useState(null)
  const [myRank,   setMyRank]       = useState(null)
  const [leaderboard, setLeaderboard] = useState(null)

  // ─── مجموعات الأصدقاء ────────────────────────────────────────────────────────
  const [friendGroups,  setFriendGroups]  = useState([])
  const [activeGroup,   setActiveGroup]   = useState(null)
  const [showCreate,    setShowCreate]    = useState(false)
  const [showJoin,      setShowJoin]      = useState(false)
  const [newGroupName,  setNewGroupName]  = useState('')
  const [joinCode,      setJoinCode]      = useState('')
  const [creating,      setCreating]      = useState(false)
  const [joining,       setJoining]       = useState(false)
  const [joinError,     setJoinError]     = useState('')
  const [copied,        setCopied]        = useState(false)

  // ─── تحميل إعدادات القفل ────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(s => setLocks(s)).catch(() => {})
  }, [])

  // ─── تحميل نقاطي ورتبتي + الترتيب العام ─────────────────────────────────────
  const { strapiId } = useAuth()
  useEffect(() => {
    if (!isLoggedIn) return
    getLeaderboard()
      .then(board => {
        if (!Array.isArray(board)) return
        setLeaderboard(board)
        const idx = board.findIndex(e => e.userId === strapiId)
        if (idx !== -1) {
          setMyPoints(board[idx].points ?? 0)
          setMyRank(idx + 1)
        } else {
          setMyPoints(0)
          setMyRank(null)
        }
      })
      .catch(() => {})
  }, [isLoggedIn, strapiId])

  // ─── تحميل مجموعات الأصدقاء ──────────────────────────────────────────────────
  useEffect(() => {
    const local = loadLocalGroups()
    if (local.length > 0) { setFriendGroups(local); setActiveGroup(local[0].id) }
    if (!isLoggedIn || !strapiToken) return
    setUserToken(strapiToken)
    getMyGroups()
      .then(data => {
        const groups = Array.isArray(data) && data.length > 0 ? data : local
        setFriendGroups(groups)
        if (groups.length > 0) setActiveGroup(prev => prev || groups[0].id)
        if (Array.isArray(data) && data.length > 0) saveLocalGroups(data)
      })
      .catch(() => {})
  }, [isLoggedIn, strapiToken])

  async function handleCreateGroup() {
    if (!newGroupName.trim()) return
    if (!isLoggedIn || !strapiToken) {
      showToast('يجب تسجيل الدخول أولاً')
      return
    }
    setCreating(true)
    try {
      // نضمن وجود الـ token قبل الطلب
      setUserToken(strapiToken)
      const res   = await createGroup(newGroupName.trim())
      // Strapi يرجع البيانات إما مباشرة أو داخل data
      const group = res?.data ?? res
      if (!group?.code) throw new Error('no code')
      const updated = [...friendGroups, group]
      setFriendGroups(updated); saveLocalGroups(updated)
      setActiveGroup(group.id)
      setNewGroupName(''); setShowCreate(false)
      showToast('تم إنشاء المجموعة ✓')
    } catch (err) {
      showToast('تعذّر إنشاء المجموعة — تحقق من الاتصال')
    } finally { setCreating(false) }
  }

  async function handleJoinGroup() {
    if (!joinCode.trim()) return
    setJoining(true); setJoinError('')
    try {
      const group = await joinGroup(joinCode.trim().toUpperCase())
      setFriendGroups(prev => {
        const exists = prev.find(g => g.id === group.id)
        const updated = exists ? prev : [...prev, group]
        saveLocalGroups(updated); return updated
      })
      setActiveGroup(group.id)
      setJoinCode(''); setShowJoin(false)
    } catch { setJoinError('الكود غير صحيح أو المجموعة غير موجودة') }
    finally { setJoining(false) }
  }

  async function handleShareGroup(group) {
    const code = group.code || group.attributes?.code || ''
    if (!code) { showToast('الكود غير متوفر'); return }
    const url  = `https://korax.live/join/${code}`
    const text = `⚽ انضم لمجموعتي "${group.name || group.attributes?.name}" في KoraX!\n🔑 الكود: ${code}\n🔗 ${url}`
    if (navigator.share) {
      await navigator.share({ title: 'KoraX — دعوة مجموعة', text, url }).catch(() => {})
    } else {
      navigator.clipboard.writeText(text)
      showToast('تم نسخ رابط الدعوة ✓')
    }
  }

  async function handleDeleteGroup(groupId) {
    try {
      await deleteGroup(groupId)
      const updated = friendGroups.filter(g => g.id !== groupId)
      setFriendGroups(updated); saveLocalGroups(updated)
      setActiveGroup(updated[0]?.id || null)
    } catch { showToast('تعذّر حذف المجموعة') }
  }

  async function handleRemoveMember(groupId, userId) {
    try {
      await removeMemberFromGroup(groupId, userId)
      setFriendGroups(prev => prev.map(g =>
        g.id !== groupId ? g
        : { ...g, members: (g.members || []).filter(m => (m.userId || m.id) !== userId) }
      ))
    } catch { showToast('تعذّر طرد العضو') }
  }

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

        {/* ─── بطاقة النقاط والرتبة ─── */}
        {isLoggedIn && (
          <div className="px-4 pt-4">
            <button
              onClick={() => setTab('mygroups')}
              className="w-full flex items-center gap-3 card p-4 border-primary/20 bg-primary/5 active:scale-95 transition-transform"
            >
              <div className="flex-1 flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-black text-primary">{myPoints === null ? '...' : myPoints}</p>
                  <p className="text-[10px] text-muted">نقطتي</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-black text-gold">
                    {myRank === null ? (myPoints === 0 ? '-' : '...') : `#${myRank}`}
                  </p>
                  <p className="text-[10px] text-muted">ترتيبي</p>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="text-center">
                  <p className="text-2xl font-black text-green-400">{friendGroups.length}</p>
                  <p className="text-[10px] text-muted">مجموعة</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-2xl">👥</span>
                <span className="text-[10px] font-bold text-primary">مجموعاتي</span>
              </div>
            </button>
          </div>
        )}

        {!isLoggedIn && (
          <div className="px-4 pt-4">
            <Link href="/login" className="card p-4 border-primary/20 bg-primary/5 flex items-center gap-3 active:scale-95 transition-transform">
              <span className="text-2xl">🔐</span>
              <div>
                <p className="font-bold text-text text-sm">سجّل دخولك</p>
                <p className="text-xs text-muted">لحفظ توقعاتك وعرض رتبتك</p>
              </div>
            </Link>
          </div>
        )}

        {/* ─── Tabs ─── */}
        <div className="flex gap-1.5 px-4 pt-4 pb-2">
          {[
            { id: 'awards',   icon: '🏆', label: 'الجوائز',    sub: `${awardDone}/${AWARDS.length}` },
            { id: 'groups',   icon: '📊', label: 'المجموعات',  sub: `${groupDone}/${groupTotal}` },
            { id: 'mygroups', icon: '👥', label: 'مجموعاتي',   sub: friendGroups.length > 0 ? `${friendGroups.length}` : '+ أضف' },
            { id: 'ranking',  icon: '🌍', label: 'الترتيب',    sub: myRank ? `#${myRank}` : '–' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-2xl font-bold text-xs transition-all flex flex-col items-center gap-0.5 ${
                tab === t.id
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'bg-card border border-border text-muted'
              }`}
            >
              <span className="text-base">{t.icon}</span>
              <span className="font-black text-[11px]">{t.label}</span>
              <span className={`text-[9px] font-bold ${tab === t.id ? 'text-white/70' : 'text-muted'}`}>
                {t.sub}
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

        {/* ══════════════════════════════════════════════════════════════════════
            التبويب الثالث: مجموعاتي + الترتيب
        ════════════════════════════════════════════════════════════════════════ */}
        {tab === 'mygroups' && (
          <div className="px-4 space-y-4 pb-4">

            {!isLoggedIn ? (
              <Link href="/login" className="card p-5 border-primary/20 bg-primary/5 flex items-center gap-3 active:scale-95 transition-transform block">
                <span className="text-3xl">🔐</span>
                <div>
                  <p className="font-bold text-text">سجّل دخولك</p>
                  <p className="text-xs text-muted">لإنشاء مجموعة ومقارنة ترتيبك مع أصدقائك</p>
                </div>
              </Link>
            ) : (
              <>
                {/* ── بطاقة ترتيبي العام ── */}
                <div className="card p-4 border-primary/20 bg-primary/5">
                  <p className="text-xs text-muted font-bold mb-3">🌍 ترتيبي العام</p>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-black text-primary text-lg">
                      #{myRank ?? '–'}
                    </div>
                    <div className="flex-1">
                      <p className="text-2xl font-black text-text">{myPoints ?? 0} <span className="text-sm font-bold text-muted">نقطة</span></p>
                      <p className="text-xs text-muted">
                        {leaderboard ? `من ${leaderboard.length} مشترك` : '...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── أزرار إنشاء / انضمام ── */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowCreate(true)}
                    className="card p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform border-primary/20 hover:border-primary/40"
                  >
                    <span className="text-3xl">➕</span>
                    <span className="text-sm font-black text-primary">إنشاء مجموعة</span>
                    <span className="text-[10px] text-muted text-center">سمّها وادعُ أصدقاءك</span>
                  </button>
                  <button
                    onClick={() => setShowJoin(true)}
                    className="card p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform"
                  >
                    <span className="text-3xl">🔗</span>
                    <span className="text-sm font-black text-muted-light">انضمام بكود</span>
                    <span className="text-[10px] text-muted text-center">أدخل كود المجموعة</span>
                  </button>
                </div>

                {/* ── مجموعاتي ── */}
                {friendGroups.length > 0 && (
                  <div>
                    <p className="text-xs font-black text-muted mb-2">مجموعاتي ({friendGroups.length})</p>

                    {/* تبويبات المجموعات */}
                    {friendGroups.length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                        {friendGroups.map(g => (
                          <button
                            key={g.id}
                            onClick={() => setActiveGroup(g.id)}
                            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              activeGroup === g.id
                                ? 'bg-primary text-white'
                                : 'bg-card border border-border text-muted'
                            }`}
                          >
                            {g.name}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* المجموعة النشطة */}
                    {(() => {
                      const group = friendGroups.find(g => g.id === activeGroup) || friendGroups[0]
                      if (!group) return null
                      const adminId = group.admin?.id || group.adminId || null
                      const isAdmin = adminId === strapiId
                      const members = (group.members || group.leaderboard || []).map((m, i) => ({
                        userId:  m.userId || m.id,
                        name:    m.username || m.name || `عضو ${i + 1}`,
                        points:  m.points ?? 0,
                        correct: m.count ?? m.correct ?? 0,
                        isMe:    m.userId === strapiId || m.id === strapiId || m.isMe,
                        isAdmin: (m.userId || m.id) === adminId,
                      }))
                      const sorted = [...members].sort((a, b) => b.points - a.points)
                      const myGroupRank = sorted.findIndex(m => m.isMe) + 1

                      return (
                        <div className="card overflow-hidden">
                          {/* رأس المجموعة */}
                          <div className="px-4 py-3 border-b border-border bg-primary/5">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-black text-text">{group.name}</p>
                                  {isAdmin && <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-bold">👑 مدير</span>}
                                </div>
                                <p className="text-xs text-muted">{members.length} أعضاء</p>
                              </div>
                              <button
                                onClick={() => handleShareGroup(group)}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold active:scale-95 transition-transform"
                              >
                                {copied ? '✓ تم' : '📤 دعوة'}
                              </button>
                            </div>

                            {/* كود الانضمام */}
                            <div className="flex items-center gap-2 bg-bg rounded-xl px-3 py-2 mt-2">
                              <span className="text-xs text-muted">كود:</span>
                              <span className="font-black text-primary tracking-widest text-sm flex-1">{group.code || group.attributes?.code}</span>
                              <button
                                onClick={() => { const c = group.code || group.attributes?.code || ''; navigator.clipboard.writeText(`https://korax.live/join/${c}`); showToast('تم نسخ الرابط ✓') }}
                                className="text-[10px] text-muted bg-card border border-border px-2 py-1 rounded-lg active:scale-95 transition-transform"
                              >
                                نسخ الرابط
                              </button>
                            </div>
                          </div>

                          {/* ترتيبي في المجموعة */}
                          {myGroupRank > 0 && (
                            <div className="px-4 py-2.5 bg-primary/5 border-b border-border flex items-center justify-between">
                              <span className="text-xs text-muted font-bold">ترتيبك في المجموعة</span>
                              <span className="text-sm font-black text-primary">
                                {myGroupRank <= 3 ? ['🥇','🥈','🥉'][myGroupRank - 1] : ''} #{myGroupRank} من {sorted.length}
                              </span>
                            </div>
                          )}

                          {/* قائمة الأعضاء */}
                          {sorted.map((m, i) => (
                            <div key={i} className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 ${m.isMe ? 'bg-primary/5' : ''}`}>
                              <span className="text-base w-7 text-center font-black text-muted">
                                {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                              </span>
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${m.isMe ? 'bg-primary text-white' : 'bg-border text-muted-light'}`}>
                                {getInitials(m.name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <p className={`text-sm font-bold truncate ${m.isMe ? 'text-primary' : 'text-text'}`}>{m.name}</p>
                                  {m.isAdmin && <span className="text-xs">👑</span>}
                                  {m.isMe && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">أنا</span>}
                                </div>
                                <p className="text-[10px] text-muted">{m.correct} توقع صحيح</p>
                              </div>
                              <p className="text-lg font-black text-text">{m.points} <span className="text-[10px] text-muted font-normal">نقطة</span></p>
                            </div>
                          ))}

                          {sorted.length === 0 && (
                            <div className="px-4 py-8 text-center text-muted">
                              <p className="text-3xl mb-2">👥</p>
                              <p className="text-sm">لا أعضاء بعد — أرسل الرابط لأصدقائك</p>
                            </div>
                          )}

                          {/* حذف المجموعة للمدير */}
                          {isAdmin && (
                            <div className="px-4 py-3 border-t border-border">
                              <button
                                onClick={() => window.confirm('هل تريد حذف المجموعة؟') && handleDeleteGroup(group.id)}
                                className="w-full py-2.5 rounded-xl border border-live/30 text-live text-xs font-bold active:scale-95 transition-transform"
                              >
                                🗑️ حذف المجموعة
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}

                {friendGroups.length === 0 && (
                  <div className="card p-8 text-center text-muted">
                    <p className="text-5xl mb-3">👥</p>
                    <p className="font-bold text-text mb-1">لا توجد مجموعات بعد</p>
                    <p className="text-xs">أنشئ مجموعة وشارك الرابط مع أصدقائك</p>
                  </div>
                )}

                {/* ── الترتيب العام (أفضل 10) ── */}
                {leaderboard && leaderboard.length > 0 && (
                  <div>
                    <p className="text-xs font-black text-muted mb-2">🌍 الترتيب العام — أفضل 10</p>
                    <div className="card overflow-hidden">
                      {leaderboard.slice(0, 10).map((e, i) => {
                        const isMe = e.userId === strapiId
                        return (
                          <div key={i} className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 ${isMe ? 'bg-primary/5' : ''}`}>
                            <span className="text-base w-7 text-center font-black text-muted">
                              {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                            </span>
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${isMe ? 'bg-primary text-white' : 'bg-border text-muted-light'}`}>
                              {getInitials(e.username || e.name || '?')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <p className={`text-sm font-bold truncate ${isMe ? 'text-primary' : 'text-text'}`}>
                                  {e.username || e.name || `مستخدم`}
                                </p>
                                {isMe && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">أنا</span>}
                              </div>
                              <p className="text-[10px] text-muted">{e.count ?? 0} صحيح</p>
                            </div>
                            <p className="text-lg font-black text-text">{e.points ?? 0}</p>
                          </div>
                        )
                      })}

                      {/* ترتيبي إذا لم أكن في أول 10 */}
                      {myRank > 10 && (() => {
                        const me = leaderboard.find(e => e.userId === strapiId)
                        if (!me) return null
                        return (
                          <>
                            <div className="px-4 py-1 text-center text-muted text-xs">• • •</div>
                            <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border-t border-primary/20">
                              <span className="text-base w-7 text-center font-black text-primary">#{myRank}</span>
                              <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                                {getInitials(me.username || me.name || 'أنا')}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-primary">{me.username || me.name || 'أنا'}</p>
                                <p className="text-[10px] text-muted">{me.count ?? 0} صحيح</p>
                              </div>
                              <p className="text-lg font-black text-primary">{me.points ?? 0}</p>
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>

        {/* ══════════════════════════════════════════════════════════════════════
            التبويب الرابع: الترتيب العام للتوقعات
        ════════════════════════════════════════════════════════════════════════ */}
        {tab === 'ranking' && (
          <div className="px-4 pb-4 space-y-3">

            {!isLoggedIn ? (
              <Link href="/login" className="card p-5 border-primary/20 bg-primary/5 flex items-center gap-3 active:scale-95 transition-transform block mt-2">
                <span className="text-3xl">🔐</span>
                <div>
                  <p className="font-bold text-text">سجّل دخولك</p>
                  <p className="text-xs text-muted">لعرض ترتيبك بين جميع المشتركين</p>
                </div>
              </Link>
            ) : leaderboard === null ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* بطاقة ترتيبي */}
                {myRank && (
                  <div className="card p-4 border-primary/30 bg-primary/5">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-black text-primary text-xl">
                        #{myRank}
                      </div>
                      <div className="flex-1">
                        <p className="font-black text-text text-base">ترتيبي العام</p>
                        <p className="text-xl font-black text-primary mt-0.5">{myPoints ?? 0} <span className="text-sm font-bold text-muted">نقطة</span></p>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-muted">من</p>
                        <p className="text-lg font-black text-text">{leaderboard.length}</p>
                        <p className="text-[10px] text-muted">مشترك</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* منصة التتويج */}
                {leaderboard.length >= 3 && (
                  <PredictPodium top3={leaderboard.slice(0, 3)} />
                )}

                {leaderboard.length === 0 && (
                  <div className="py-12 text-center text-muted">
                    <span className="text-4xl block mb-2">🏆</span>
                    <p className="text-sm">لا يوجد ترتيب بعد — كن أول من يوقّع!</p>
                  </div>
                )}

                {/* القائمة الكاملة */}
                {leaderboard.length > 0 && (
                  <div className="card overflow-hidden">
                    {leaderboard.map((e, i) => {
                      const isMe = e.userId === strapiId
                      return (
                        <div key={i} className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 ${isMe ? 'bg-primary/5' : ''}`}>
                          <span className="text-base w-7 text-center font-black text-muted flex-shrink-0">
                            {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                          </span>
                          <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isMe ? 'bg-primary text-white' : 'bg-border text-muted-light'}`}>
                            {getInitials(e.username || e.name || '?')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <p className={`text-sm font-bold truncate ${isMe ? 'text-primary' : 'text-text'}`}>
                                {e.username || e.name || 'مستخدم'}
                              </p>
                              {isMe && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold flex-shrink-0">أنا</span>}
                            </div>
                            <p className="text-[10px] text-muted">{e.count ?? 0} توقع صحيح</p>
                          </div>
                          <div className="text-left flex-shrink-0">
                            <p className="text-base font-black text-text">{e.points ?? 0}</p>
                            <p className="text-[10px] text-muted text-center">نقطة</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

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

      {/* ─── مودال: إنشاء مجموعة ─── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowCreate(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[480px] bg-card border-t border-border rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-lg text-text">➕ إنشاء مجموعة</h2>
              <button onClick={() => setShowCreate(false)} className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-muted text-sm">✕</button>
            </div>
            <p className="text-xs text-muted mb-3">سمّ المجموعة، ثم أرسل الرابط لأصدقائك لينضموا تلقائياً</p>
            <input
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateGroup()}
              placeholder="مثال: أصدقاء الجامعة"
              className="w-full bg-bg border border-border rounded-2xl px-4 py-4 text-text text-sm font-medium outline-none focus:border-primary transition-colors"
              autoFocus
            />
            <button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || creating}
              className="w-full py-4 rounded-2xl bg-primary font-bold text-white mt-3 active:scale-95 transition-transform disabled:opacity-50"
            >
              {creating ? 'جاري الإنشاء...' : 'إنشاء المجموعة'}
            </button>
          </div>
        </div>
      )}

      {/* ─── مودال: انضمام بكود ─── */}
      {showJoin && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowJoin(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[480px] bg-card border-t border-border rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-lg text-text">🔗 انضمام بكود</h2>
              <button onClick={() => setShowJoin(false)} className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-muted text-sm">✕</button>
            </div>
            <p className="text-xs text-muted mb-3 text-center">اطلب الكود من صاحب المجموعة</p>
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleJoinGroup()}
              placeholder="KRX-XXXX"
              maxLength={8}
              className="w-full bg-bg border border-border rounded-2xl px-4 py-4 text-text text-base font-black outline-none focus:border-primary transition-colors text-center tracking-widest"
              autoFocus
            />
            {joinError && <p className="text-live text-xs text-center mt-1">{joinError}</p>}
            <button
              onClick={handleJoinGroup}
              disabled={joinCode.length < 4 || joining}
              className="w-full py-4 rounded-2xl bg-primary font-bold text-white mt-3 active:scale-95 transition-transform disabled:opacity-50"
            >
              {joining ? 'جاري الانضمام...' : 'انضمام'}
            </button>
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

// ─── منصة التتويج ─────────────────────────────────────────────────────────────

function PredictPodium({ top3 }) {
  const order = [top3[1], top3[0], top3[2]] // ثاني، أول، ثالث
  const heights = ['h-20', 'h-28', 'h-16']
  const medals  = ['🥈', '🥇', '🥉']
  const colors  = ['bg-card border-border', 'bg-gold/20 border-gold/40', 'bg-card border-border']

  return (
    <div className="flex items-end justify-center gap-2 py-2">
      {order.map((entry, idx) => {
        if (!entry) return <div key={idx} className="flex-1" />
        return (
          <div key={idx} className="flex flex-col items-center gap-1 flex-1">
            <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center font-bold text-xs text-muted-light">
              {getInitials(entry.username || entry.name || '?')}
            </div>
            <p className="text-[9px] text-muted text-center font-medium truncate w-full px-1">
              {entry.username || entry.name || 'مستخدم'}
            </p>
            <p className="text-sm font-black text-text">{entry.points ?? 0}</p>
            <div className={`w-full ${heights[idx]} border ${colors[idx]} rounded-t-xl flex items-start justify-center pt-2`}>
              <span className="text-xl">{medals[idx]}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

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
