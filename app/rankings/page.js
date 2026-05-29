'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'

import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { getInitials, generateGroupCode } from '@/lib/utils'
import { useAuth } from '@/lib/useAuth'
import { getLeaderboard, getMyGroups, createGroup, joinGroup, setUserToken, deleteGroup, removeMemberFromGroup } from '@/lib/strapi'
import { fetchStandings } from '@/lib/api-football'

const VIEWS = [
  { id: 'global',  label: '🌍 العام'      },
  { id: 'teams',   label: '🏆 المنتخبات' },
  { id: 'friends', label: '👥 مجموعتي'   },
]

const LS_GROUPS_KEY = 'korax_ranking_groups'

function loadLocalGroups() {
  try { return JSON.parse(localStorage.getItem(LS_GROUPS_KEY) || '[]') } catch { return [] }
}
function saveLocalGroups(groups) {
  localStorage.setItem(LS_GROUPS_KEY, JSON.stringify(groups))
}

export default function RankingsPage() {
  const { isLoggedIn, strapiId, strapiToken, user } = useAuth()
  // دعم ?tab=friends من روابط توقعاتي
  const [view, setView] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('tab')
      if (p === 'friends') return 'friends'
    }
    return 'global'
  })
  const [leaderboard, setLeaderboard] = useState(null) // null = loading
  const [standings, setStandings]     = useState(null) // null = loading
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

  // تحميل ترتيب المنتخبات عند الحاجة
  useEffect(() => {
    if (view !== 'teams' || standings !== null) return
    fetchStandings()
      .then(data => setStandings(data || []))
      .catch(() => setStandings([]))
  }, [view])

  // تحميل مجموعات المستخدم (Strapi أولاً، localStorage كـ fallback)
  useEffect(() => {
    const local = loadLocalGroups()
    if (local.length > 0) {
      setMyGroups(local)
      setActiveGroup(local[0].id)
    }
    if (!isLoggedIn || !strapiToken) return
    setUserToken(strapiToken)
    getMyGroups()
      .then(data => {
        const groups = Array.isArray(data) && data.length > 0 ? data : local
        setMyGroups(groups)
        if (groups.length > 0 && !activeGroup) setActiveGroup(groups[0].id)
        if (Array.isArray(data) && data.length > 0) saveLocalGroups(data)
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
      const code  = generateGroupCode()
      const group = { id: `g_${Date.now()}`, name: newName.trim(), code, members: [] }
      setMyGroups(prev => {
        const updated = [...prev, group]
        saveLocalGroups(updated)
        return updated
      })
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

  async function handleDeleteGroup(groupId) {
    try {
      await deleteGroup(groupId)
      const updated = myGroups.filter(g => g.id !== groupId)
      setMyGroups(updated)
      saveLocalGroups(updated)
      setActiveGroup(updated[0]?.id || null)
    } catch {
      alert('تعذّر حذف المجموعة، حاول مرة أخرى')
    }
  }

  async function handleRemoveMember(groupId, userId) {
    try {
      await removeMemberFromGroup(groupId, userId)
      setMyGroups(prev => prev.map(g => {
        if (g.id !== groupId) return g
        return { ...g, members: (g.members || []).filter(m => (m.userId || m.id) !== userId) }
      }))
    } catch {
      alert('تعذّر طرد العضو، حاول مرة أخرى')
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
              const board = leaderboard.map((e, i) => ({
                rank:    i + 1,
                name:    e.username || e.name || `مستخدم ${e.userId}`,
                points:  e.points,
                correct: e.count,
                streak:  0,
                isMe:    e.userId === strapiId,
              }))

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

        {/* ── Team Standings ── */}
        {view === 'teams' && (
          <TeamStandingsView standings={standings} />
        )}

        {/* ── Friends Groups ── */}
        {view === 'friends' && (
          <div className="animate-in px-4">

            {/* ── أزرار إنشاء / انضمام — دائماً في الأعلى ── */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setShowCreate(true)}
                className="card p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform border-2 border-primary/40 bg-primary/5"
              >
                <span className="text-3xl">➕</span>
                <span className="text-sm font-black text-primary">إنشاء مجموعة</span>
                <span className="text-[10px] text-muted text-center">سمّها وادعُ أصدقاءك</span>
              </button>
              <button
                onClick={() => setShowJoin(true)}
                className="card p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform border-2 border-border"
              >
                <span className="text-3xl">🔗</span>
                <span className="text-sm font-black text-text">انضمام بكود</span>
                <span className="text-[10px] text-muted text-center">أدخل كود المجموعة</span>
              </button>
            </div>

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
              <GroupLeaderboard
                group={current}
                onShare={() => handleShare(current)}
                copied={copied}
                myUserId={strapiId}
                onDelete={handleDeleteGroup}
                onRemoveMember={handleRemoveMember}
              />
            ) : (
              <EmptyGroups onCreate={() => setShowCreate(true)} onJoin={() => setShowJoin(true)} />
            )}

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

// ─── Team Standings View ───────────────────────────────────────────────────────

function TeamStandingsView({ standings }) {
  const [groupFilter, setGroupFilter] = useState('all')
  const [sortBy, setSortBy]           = useState('pts') // pts | w | gf

  if (standings === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // جمع كل المنتخبات من كل المجموعات
  const allTeams = (standings || []).flatMap(group =>
    (group.teams || []).map(t => ({ ...t, groupId: group.id, groupName: group.name || `المجموعة ${group.id}` }))
  )

  // تصفية حسب المجموعة
  const filtered = groupFilter === 'all'
    ? allTeams
    : allTeams.filter(t => t.groupId === groupFilter)

  // ترتيب حسب المعيار المختار
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'w')  return (b.won  ?? 0) - (a.won  ?? 0)  || (b.pts ?? 0) - (a.pts ?? 0)
    if (sortBy === 'gf') return (b.gf   ?? 0) - (a.gf   ?? 0)  || (b.pts ?? 0) - (a.pts ?? 0)
    // افتراضي: pts ثم فرق الأهداف
    if (b.pts !== a.pts) return (b.pts ?? 0) - (a.pts ?? 0)
    return ((b.gf ?? 0) - (b.ga ?? 0)) - ((a.gf ?? 0) - (a.ga ?? 0))
  })

  const groups = standings || []
  const started = sorted.some(t => (t.played ?? 0) > 0)

  return (
    <div className="animate-in pb-4">

      {/* Sort buttons */}
      <div className="flex gap-2 px-4 mb-3">
        {[
          { id: 'pts', label: 'النقاط'    },
          { id: 'w',   label: 'الانتصارات' },
          { id: 'gf',  label: 'الأهداف'   },
        ].map(s => (
          <button
            key={s.id}
            onClick={() => setSortBy(s.id)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              sortBy === s.id
                ? 'bg-primary text-white'
                : 'bg-card border border-border text-muted'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Group filter */}
      <div className="flex gap-1.5 px-4 overflow-x-auto pb-2 mb-3 hide-scrollbar">
        <button
          onClick={() => setGroupFilter('all')}
          className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            groupFilter === 'all' ? 'bg-primary text-white' : 'bg-card border border-border text-muted'
          }`}
        >
          الكل ({allTeams.length})
        </button>
        {groups.map(g => (
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

      {/* قبل البطولة */}
      {!started && (
        <div className="mx-4 mb-3 card p-3 bg-primary/5 border-primary/20 text-center">
          <p className="text-xs text-muted">🕐 البطولة لم تبدأ بعد — الترتيب سيُحدَّث تلقائياً بعد كل مباراة</p>
        </div>
      )}

      {/* جدول الترتيب */}
      <div className="mx-4 card overflow-hidden">
        {/* Table header */}
        <div className="flex items-center px-3 py-2 bg-card-hover border-b border-border">
          <span className="w-7 text-[10px] text-muted font-bold text-center">#</span>
          <span className="flex-1 text-[10px] text-muted font-bold">المنتخب</span>
          {['ل','ف','ت','خ','ف:ض','ن'].map(h => (
            <span key={h} className={`text-center text-[10px] font-bold ${
              (h === 'ن' && sortBy === 'pts') || (h === 'ف' && sortBy === 'w') || (h === 'ف:ض' && sortBy === 'gf')
                ? 'text-primary w-10'
                : 'text-muted ' + (h === 'ف:ض' ? 'w-10' : 'w-7')
            }`}>{h}</span>
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="py-10 text-center text-muted text-sm">لا توجد بيانات</div>
        )}

        {sorted.map((entry, i) => {
          const gd = (entry.gf ?? 0) - (entry.ga ?? 0)
          const highlight = groupFilter === 'all'
            ? i < 24  // أفضل 24 منتخب (2 من كل مجموعة)
            : i < 2   // أفضل 2 بالمجموعة
          const mayQualify = groupFilter === 'all' ? i < 36 : i === 2

          return (
            <div
              key={`${entry.team?.id}-${i}`}
              className={`flex items-center px-3 py-2.5 border-b border-border last:border-b-0 transition-colors
                ${highlight   ? 'border-r-2 border-r-primary'   : ''}
                ${mayQualify && !highlight ? 'border-r-2 border-r-gold' : ''}
              `}
            >
              {/* Rank */}
              <span className={`w-7 text-center text-xs font-black ${
                i === 0 ? 'text-gold' : i === 1 ? 'text-primary' : i === 2 ? 'text-amber-600' : 'text-muted'
              }`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
              </span>

              {/* Flag + Name + Group */}
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="text-lg flex-shrink-0">{entry.team?.flag || '🏳️'}</span>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-text truncate block">{entry.team?.name || ''}</span>
                  {groupFilter === 'all' && (
                    <span className="text-[9px] text-muted/60">{entry.groupName}</span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <span className="w-7 text-center text-xs text-muted">{entry.played ?? 0}</span>
              <span className={`w-7 text-center text-xs font-bold ${sortBy === 'w' ? 'text-green' : 'text-muted'}`}>{entry.won ?? 0}</span>
              <span className="w-7 text-center text-xs text-muted">{entry.draw ?? 0}</span>
              <span className="w-7 text-center text-xs text-muted">{entry.lost ?? 0}</span>
              <span className={`w-10 text-center text-xs font-medium ${gd > 0 ? 'text-green' : gd < 0 ? 'text-live' : 'text-muted'}`}>
                {gd > 0 ? `+${gd}` : gd}
              </span>
              <span className={`w-7 text-center text-xs font-black ${sortBy === 'pts' ? 'text-primary' : 'text-text'}`}>
                {entry.pts ?? 0}
              </span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mx-4 mt-3 flex items-center gap-4 justify-center flex-wrap">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
          <span className="text-[10px] text-muted">يتأهل للدور الثاني</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded-sm bg-gold" />
          <span className="text-[10px] text-muted">قد يتأهل (أفضل ثالث)</span>
        </div>
      </div>
    </div>
  )
}

// ─── Group Leaderboard ─────────────────────────────────────────────────────────

function GroupLeaderboard({ group, onShare, copied, myUserId, onDelete, onRemoveMember }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [removing, setRemoving]           = useState(null)

  const adminId = group.admin?.id || group.adminId || null
  const isAdmin = adminId === myUserId

  const members = (group.members || group.leaderboard || []).map((m, i) => ({
    userId:  m.userId || m.id,
    name:    m.username || m.name || `عضو ${i + 1}`,
    points:  m.points ?? 0,
    correct: m.count ?? m.correct ?? 0,
    isMe:    m.userId === myUserId || m.id === myUserId || m.isMe,
    isAdmin: (m.userId || m.id) === adminId || m.id === adminId,
  }))
  const sorted = [...members].sort((a, b) => b.points - a.points)
  const me     = sorted.find(m => m.isMe)

  async function handleRemove(member) {
    if (!window.confirm(`هل تريد طرد "${member.name}" من المجموعة؟`)) return
    setRemoving(member.userId)
    try {
      await onRemoveMember(group.id, member.userId)
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-black text-text">{group.name}</p>
              {isAdmin && <span className="text-xs bg-gold/20 text-gold px-2 py-0.5 rounded-full font-bold">👑 مدير</span>}
            </div>
            <p className="text-xs text-muted">{(group.members || []).length} أعضاء</p>
          </div>
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold active:scale-95 transition-transform"
          >
            {copied ? '✓ تم النسخ' : '🔗 مشاركة'}
          </button>
        </div>

        {/* Code + Link */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 bg-bg rounded-xl px-3 py-2">
            <span className="text-xs text-muted">كود الانضمام:</span>
            <span className="font-black text-primary tracking-widest text-sm flex-1">{group.code}</span>
            <button
              onClick={() => navigator.clipboard.writeText(group.code)}
              className="text-[10px] text-muted bg-card border border-border px-2 py-1 rounded-lg active:scale-95 transition-transform"
            >
              نسخ
            </button>
          </div>
          {/* رابط الانضمام المباشر */}
          <button
            onClick={onShare}
            className="w-full flex items-center justify-center gap-2 bg-primary text-white rounded-xl py-2.5 text-sm font-black active:scale-95 transition-transform"
          >
            <span>📤</span>
            <span>{copied ? '✅ تم النسخ!' : 'أرسل رابط الانضمام'}</span>
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
        <GroupMemberRow
          key={i}
          member={member}
          rank={i + 1}
          isAdmin={isAdmin}
          removing={removing === member.userId}
          onRemove={() => handleRemove(member)}
        />
      ))}

      {/* Admin: Delete Group */}
      {isAdmin && (
        <div className="px-4 py-3 border-t border-border">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-2.5 rounded-xl border border-live/30 text-live text-xs font-bold active:scale-95 transition-transform"
            >
              🗑️ حذف المجموعة
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-center text-muted">هل أنت متأكد؟ لا يمكن التراجع</p>
              <div className="flex gap-2">
                <button
                  onClick={() => onDelete(group.id)}
                  className="flex-1 py-2.5 rounded-xl bg-live text-white text-xs font-bold active:scale-95 transition-transform"
                >
                  نعم، احذف
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-2.5 rounded-xl bg-card border border-border text-muted text-xs font-bold active:scale-95 transition-transform"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function GroupMemberRow({ member, rank, isAdmin, removing, onRemove }) {
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
        <div className="flex items-center gap-1">
          <p className={`text-sm font-bold truncate ${member.isMe ? 'text-primary' : 'text-text'}`}>{member.name}</p>
          {member.isAdmin && <span className="text-xs">👑</span>}
        </div>
        <p className="text-[10px] text-muted">{member.correct} توقع صحيح</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-left">
          <p className="text-lg font-black text-text">{member.points}</p>
          <p className="text-[10px] text-muted text-center">نقطة</p>
        </div>
        {/* زر الطرد - للمدير فقط وليس على نفسه */}
        {isAdmin && !member.isMe && !member.isAdmin && (
          <button
            onClick={onRemove}
            disabled={removing}
            className="text-[10px] text-live border border-live/30 px-2 py-1 rounded-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {removing ? '...' : 'طرد'}
          </button>
        )}
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

function EmptyGroups({ onCreate, onJoin }) {
  return (
    <div className="card p-8 text-center border-2 border-dashed border-border">
      <div className="text-5xl mb-3">👥</div>
      <p className="font-black text-text text-lg mb-1">لا توجد مجموعات بعد</p>
      <p className="text-xs text-muted mb-6 max-w-[220px] mx-auto">
        أنشئ مجموعة مع أصدقائك وتنافسوا على أفضل التوقعات
      </p>
      <div className="space-y-3">
        <button
          onClick={onCreate}
          className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base active:scale-95 transition-transform shadow-lg shadow-primary/30"
        >
          ➕ أنشئ مجموعة الآن
        </button>
        <button
          onClick={onJoin}
          className="w-full py-3 rounded-2xl bg-card border border-border font-bold text-muted text-sm active:scale-95 transition-transform"
        >
          🔗 انضم بكود
        </button>
      </div>
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
