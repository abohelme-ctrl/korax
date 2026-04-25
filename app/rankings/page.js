'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { LEADERBOARD } from '@/lib/mock-data'
import { getInitials, generateGroupCode } from '@/lib/utils'
import { useAuth } from '@/lib/useAuth'
import { getLeaderboard, getMyGroups, createGroup, joinGroup, setUserToken } from '@/lib/strapi'

const VIEWS = [
  { id: 'global',  label: '🌍 العام'     },
  { id: 'friends', label: '👥 مجموعتي'  },
]

const MOCK_MY_GROUPS = [
  {
    id: 'g1',
    name: 'أصدقاء العمل',
    code: 'KRX-7842',
    members: [
      { name: 'فهد الغامدي',  points: 95, correct: 12, isMe: false },
      { name: 'أنت',           points: 72, correct: 9,  isMe: true  },
      { name: 'نواف الرشيدي', points: 65, correct: 8,  isMe: false },
      { name: 'رانيا السهلي', points: 40, correct: 5,  isMe: false },
    ],
  },
  {
    id: 'g2',
    name: 'العائلة',
    code: 'KRX-3391',
    members: [
      { name: 'أخي الكبير',  points: 90, correct: 11, isMe: false },
      { name: 'أنت',          points: 72, correct: 9,  isMe: true  },
      { name: 'أبي',          points: 60, correct: 7,  isMe: false },
    ],
  },
]

export default function RankingsPage() {
  const { isLoggedIn, strapiId, strapiToken, user } = useAuth()

  const [view, setView]               = useState('global')
  const [leaderboard, setLeaderboard] = useState(null) // null = loading
  const [myGroups, setMyGroups]       = useState([])
  const [activeGroup, setActiveGroup] = useState(null)
  const [showCreate, setShowCreate]   = useState(false)
  const [showJoin, setShowJoin]       = useState(false)
  const [newName, setNewName]         = useState('')
  const [joinCode, setJoinCode]       = useState('')
  const [copied, setCopied]           = useState(false)
  const [creating, setCreating]       = useState(false)
  const [joining, setJoining]         = useState(false)
  const [joinError, setJoinError]     = useState('')

  // تحميل الترتيب العام
  useEffect(() => {
    getLeaderboard()
      .then(data => setLeaderboard(data))
      .catch(() => setLeaderboard([])) // fallback: لا بيانات
  }, [])

  // تحميل مجموعات المستخدم
  useEffect(() => {
    if (!isLoggedIn || !strapiToken) return
    setUserToken(strapiToken)
    getMyGroups()
      .then(data => {
        const groups = Array.isArray(data) ? data : []
        setMyGroups(groups)
        if (groups.length > 0 && !activeGroup) setActiveGroup(groups[0].id)
      })
      .catch(() => {})
  }, [isLoggedIn, strapiToken])

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const group = await createGroup(newName.trim())
      setMyGroups(prev => [...prev, group])
      setActiveGroup(group.id)
      setNewName('')
      setShowCreate(false)
      setView('friends')
    } catch {
      // fallback mock
      const code = generateGroupCode()
      const group = { id: `g_${Date.now()}`, name: newName.trim(), code, members: [] }
      setMyGroups(prev => [...prev, group])
      setActiveGroup(group.id)
      setNewName('')
      setShowCreate(false)
      setView('friends')
    } finally {
      setCreating(false)
    }
  }

  async function handleJoin() {
    if (!joinCode.trim()) return
    setJoining(true)
    setJoinError('')
    try {
      const group = await joinGroup(joinCode.trim())
      setMyGroups(prev => {
        const exists = prev.find(g => g.id === group.id)
        return exists ? prev : [...prev, group]
      })
      setActiveGroup(group.id)
      setJoinCode('')
      setShowJoin(false)
      setView('friends')
    } catch {
      setJoinError('الكود غير صحيح أو المجموعة غير موجودة')
    } finally {
      setJoining(false)
    }
  }

  async function handleShare(group) {
    const url  = `${window.location.origin}/join/${group.code}`
    const text = `انضم لمجموعتي "${group.name}" في KoraX!\nالكود: ${group.code}\n${url}`
    if (navigator.share) {
      await navigator.share({ title: 'KoraX', text })
    } else {
      navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const current = myGroups.find(g => g.id === activeGroup)

  return (
    <div>
      <Header title="الترتيب" />

      <div className="page-content">

        {/* View toggle */}
        <div className="flex gap-2 px-4 pt-4 pb-3">
          {VIEWS.map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
                view === v.id
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'bg-card border border-border text-muted'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        {/* ── Global Leaderboard ── */}
        {view === 'global' && (
          <div className="animate-in">
            {leaderboard === null ? (
              <div className="flex items-center justify-center py-16">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (() => {
              // تحويل بيانات Strapi إلى الشكل المطلوب، أو استخدام mock
              const board = leaderboard.length > 0
                ? leaderboard.map((e, i) => ({
                    rank:    i + 1,
                    name:    e.username || e.name || `مستخدم ${e.userId}`,
                    points:  e.points,
                    correct: e.count,
                    streak:  0,
                    isMe:    e.userId === strapiId,
                  }))
                : LEADERBOARD // fallback mock

              return (
                <>
                  <div className="px-4 mb-3">
                    <MyRankCard leaderboard={board} />
                  </div>
                  {board.length >= 3 && (
                    <div className="px-4 mb-4">
                      <Podium top3={board.slice(0, 3)} />
                    </div>
                  )}
                  {board.length === 0 && (
                    <div className="px-4 py-12 text-center text-muted">
                      <span className="text-4xl block mb-2">🏆</span>
                      <p className="text-sm">لا يوجد ترتيب بعد — كن أول من يوقّع!</p>
                    </div>
                  )}
                  <div className="px-4 space-y-2 pb-4">
                    {board.map(entry => (
                      <LeaderboardRow key={entry.rank} entry={entry} />
                    ))}
                  </div>
                </>
              )
            })()}
          </div>
        )}

        {/* ── Friends Groups ── */}
        {view === 'friends' && (
          <div className="animate-in px-4">

            {/* Group tabs */}
            {myGroups.length > 0 && (
              <div className="tab-bar mb-3 px-0">
                {myGroups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setActiveGroup(g.id)}
                    className={`tab-item ${activeGroup === g.id ? 'active' : ''}`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}

            {/* Current group */}
            {current ? (
              <GroupLeaderboard group={current} onShare={() => handleShare(current)} copied={copied} myUserId={strapiId} />
            ) : (
              <EmptyGroups />
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                onClick={() => setShowCreate(true)}
                className="card p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform border-primary/20 hover:border-primary/40"
              >
                <span className="text-2xl">➕</span>
                <span className="text-sm font-bold text-primary">إنشاء مجموعة</span>
              </button>
              <button
                onClick={() => setShowJoin(true)}
                className="card p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform"
              >
                <span className="text-2xl">🔗</span>
                <span className="text-sm font-bold text-muted-light">انضمام بكود</span>
              </button>
            </div>

            {/* Invite friend */}
            <div className="mt-4 mb-4 card p-4 bg-gold-bg border-gold/20">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎁</span>
                <div className="flex-1">
                  <p className="font-bold text-text text-sm">ادعُ صديقك</p>
                  <p className="text-xs text-muted">ادعُ صديقًا وخذ لاعبًا مجانًا</p>
                </div>
                <button className="px-4 py-2 rounded-xl bg-gold text-black text-xs font-black active:scale-95 transition-transform">
                  دعوة
                </button>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <Modal title="إنشاء مجموعة" onClose={() => setShowCreate(false)}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="اسم المجموعة (مثل: أصدقاء الجامعة)"
            className="w-full bg-bg border border-border rounded-2xl px-4 py-4 text-text text-sm font-medium outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={handleCreate}
            disabled={!newName.trim() || creating}
            className="w-full py-4 rounded-2xl bg-primary font-bold text-white mt-3 active:scale-95 transition-transform disabled:opacity-50"
          >
            {creating ? 'جاري الإنشاء...' : 'إنشاء المجموعة'}
          </button>
        </Modal>
      )}

      {/* Join modal */}
      {showJoin && (
        <Modal title="انضمام بكود" onClose={() => setShowJoin(false)}>
          <p className="text-xs text-muted mb-3 text-center">اطلب الكود من صاحب المجموعة</p>
          <input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="KRX-XXXX"
            maxLength={8}
            className="w-full bg-bg border border-border rounded-2xl px-4 py-4 text-text text-base font-black outline-none focus:border-primary transition-colors text-center tracking-widest"
          />
          {joinError && <p className="text-live text-xs text-center mt-1">{joinError}</p>}
          <button
            onClick={handleJoin}
            disabled={joinCode.length < 4 || joining}
            className="w-full py-4 rounded-2xl bg-primary font-bold text-white mt-3 active:scale-95 transition-transform disabled:opacity-50"
          >
            {joining ? 'جاري الانضمام...' : 'انضمام'}
          </button>
        </Modal>
      )}

      <BottomNav />
    </div>
  )
}

// ─── Group Leaderboard ─────────────────────────────────────────────────────────

function GroupLeaderboard({ group, onShare, copied, myUserId }) {
  // دعم بنية Strapi (members as user objects) و mock (members with points)
  const members = (group.members || group.leaderboard || []).map((m, i) => ({
    name:    m.username || m.name || `عضو ${i + 1}`,
    points:  m.points ?? 0,
    correct: m.count ?? m.correct ?? 0,
    isMe:    m.userId === myUserId || m.isMe,
  }))
  const sorted = [...members].sort((a, b) => b.points - a.points)
  const me     = sorted.find(m => m.isMe)

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-black text-text">{group.name}</p>
            <p className="text-xs text-muted">{group.members.length} أعضاء</p>
          </div>
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold active:scale-95 transition-transform"
          >
            {copied ? '✓ تم النسخ' : '🔗 مشاركة'}
          </button>
        </div>

        {/* Code pill */}
        <div className="flex items-center gap-2 bg-bg rounded-xl px-3 py-2">
          <span className="text-xs text-muted">كود الانضمام:</span>
          <span className="font-black text-primary tracking-widest text-sm flex-1">{group.code}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(group.code); }}
            className="text-[10px] text-muted bg-card border border-border px-2 py-1 rounded-lg"
          >
            نسخ
          </button>
        </div>
      </div>

      {/* My rank highlight */}
      {me && (
        <div className="px-4 py-2 bg-primary/5 border-b border-border flex items-center justify-between">
          <span className="text-xs text-muted">ترتيبك في المجموعة</span>
          <span className="text-sm font-black text-primary">
            #{sorted.findIndex(m => m.isMe) + 1} من {sorted.length}
          </span>
        </div>
      )}

      {/* Members */}
      {sorted.map((member, i) => (
        <GroupMemberRow key={i} member={member} rank={i + 1} />
      ))}
    </div>
  )
}

function GroupMemberRow({ member, rank }) {
  const medals = ['🥇', '🥈', '🥉']
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 ${member.isMe ? 'bg-primary/5' : ''}`}>
      <span className="text-base w-7 text-center">
        {rank <= 3 ? medals[rank - 1] : <span className="text-sm font-bold text-muted">#{rank}</span>}
      </span>
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
        member.isMe ? 'bg-primary text-white' : 'bg-border text-muted-light'
      }`}>
        {getInitials(member.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold truncate ${member.isMe ? 'text-primary' : 'text-text'}`}>{member.name}</p>
        <p className="text-[10px] text-muted">{member.correct} توقع صحيح</p>
      </div>
      <div className="text-left">
        <p className="text-lg font-black text-text">{member.points}</p>
        <p className="text-[10px] text-muted text-center">نقطة</p>
      </div>
    </div>
  )
}

// ─── Global Leaderboard ────────────────────────────────────────────────────────

function MyRankCard({ leaderboard }) {
  const me = leaderboard.find(e => e.isMe)
  if (!me) return null
  return (
    <div className="card p-4 border-primary/30 bg-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-black text-primary text-sm">
            أنا
          </div>
          <div>
            <p className="font-bold text-text">{me.name}</p>
            <p className="text-xs text-muted">{me.correct} توقع صحيح</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-2xl font-black text-primary">{me.points}</p>
          <p className="text-xs text-muted text-center">#{me.rank}</p>
        </div>
      </div>
      {me.streak > 1 && (
        <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
          <span className="text-sm">🔥</span>
          <span className="text-xs font-bold text-gold">{me.streak} توقعات صحيحة متتالية!</span>
        </div>
      )}
    </div>
  )
}

function Podium({ top3 }) {
  const [second, first, third] = [top3[1], top3[0], top3[2]]
  return (
    <div className="flex items-end justify-center gap-2 py-4">
      <PodiumBlock entry={second} height="h-20" rank={2} />
      <PodiumBlock entry={first}  height="h-28" rank={1} gold />
      <PodiumBlock entry={third}  height="h-16" rank={3} />
    </div>
  )
}

function PodiumBlock({ entry, height, rank, gold }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
        gold ? 'bg-gold text-black' : 'bg-card border border-border text-muted-light'
      }`}>
        {getInitials(entry.name)}
      </div>
      <p className="text-[10px] text-muted-light text-center font-medium truncate w-full px-1">{entry.name}</p>
      <p className="text-sm font-black text-text">{entry.points}</p>
      <div className={`w-full ${height} ${gold ? 'bg-gold/20 border-gold/40' : 'bg-card border-border'} border rounded-t-xl flex items-start justify-center pt-2`}>
        <span className="text-lg">{rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</span>
      </div>
    </div>
  )
}

function LeaderboardRow({ entry }) {
  const rankColors = { 1: 'text-gold', 2: 'text-muted-light', 3: 'text-amber-700' }
  return (
    <div className={`card card-press flex items-center gap-3 p-4 ${entry.isMe ? 'border-primary/40 bg-primary/5' : ''}`}>
      <span className={`text-base font-black w-7 text-center ${rankColors[entry.rank] || 'text-muted'}`}>
        {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : `#${entry.rank}`}
      </span>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
        entry.isMe ? 'bg-primary text-white' : 'bg-border text-muted-light'
      }`}>
        {getInitials(entry.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-bold text-sm truncate ${entry.isMe ? 'text-primary' : 'text-text'}`}>{entry.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted">{entry.correct} صحيح</span>
          {entry.streak > 1 && <span className="text-[10px] text-gold font-bold">🔥 {entry.streak}</span>}
        </div>
      </div>
      <div className="text-left">
        <p className="text-lg font-black text-text">{entry.points}</p>
        <p className="text-[10px] text-muted text-center">نقطة</p>
      </div>
    </div>
  )
}

// ─── Empty / Modal ─────────────────────────────────────────────────────────────

function EmptyGroups() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-muted">
      <span className="text-5xl">👥</span>
      <p className="text-sm font-medium">لا توجد مجموعات بعد</p>
      <p className="text-xs text-center max-w-[200px]">أنشئ مجموعة وشارك الكود مع أصدقائك</p>
    </div>
  )
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[480px] bg-card border-t border-border rounded-t-3xl p-6 pb-10 animate-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-lg text-text">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-muted text-sm">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
