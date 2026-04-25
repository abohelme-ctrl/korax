'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { MOCK_FRIEND_GROUPS } from '@/lib/mock-data'
import { generateGroupCode, getInitials } from '@/lib/utils'

export default function FriendsPage() {
  const [groups, setGroups]         = useState(MOCK_FRIEND_GROUPS)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin]     = useState(false)
  const [newName, setNewName]       = useState('')
  const [joinCode, setJoinCode]     = useState('')
  const [activeGroup, setActiveGroup] = useState(groups[0]?.id || null)

  function handleCreate() {
    if (!newName.trim()) return
    const code = generateGroupCode()
    setGroups(prev => [...prev, {
      id:      `fg_${Date.now()}`,
      name:    newName.trim(),
      code,
      admin:   'أنت',
      members: [{ name: 'أنت', points: 72, rank: 1, isMe: true }],
    }])
    setNewName('')
    setShowCreate(false)
  }

  function handleJoin() {
    alert(`سيتم الانضمام للمجموعة برمز: ${joinCode}`)
    setJoinCode('')
    setShowJoin(false)
  }

  const current = groups.find(g => g.id === activeGroup)

  return (
    <div>
      <Header title="مجموعة الأصدقاء" />

      <div className="page-content px-4 py-4">

        {/* Group selector */}
        {groups.length > 0 && (
          <div className="tab-bar mb-4 px-0">
            {groups.map(g => (
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
          <GroupDetail group={current} />
        ) : (
          <EmptyGroups />
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => setShowCreate(true)}
            className="card p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform border-primary/20"
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
        <div className="mt-4 card p-4 bg-gold-bg border-gold/20">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎁</span>
            <div>
              <p className="font-bold text-text text-sm">ادعُ صديقك</p>
              <p className="text-xs text-muted">ادعُ صديقًا وخذ لاعبًا مجانًا</p>
            </div>
            <button className="mr-auto px-4 py-2 rounded-xl bg-gold text-black text-xs font-black">
              دعوة
            </button>
          </div>
        </div>

      </div>

      {/* Create modal */}
      {showCreate && (
        <Modal title="إنشاء مجموعة" onClose={() => setShowCreate(false)}>
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="اسم المجموعة"
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text text-sm font-medium outline-none focus:border-primary"
          />
          <button
            onClick={handleCreate}
            className="w-full py-4 rounded-2xl bg-primary font-bold text-white mt-3 active:scale-95 transition-transform"
          >
            إنشاء
          </button>
        </Modal>
      )}

      {/* Join modal */}
      {showJoin && (
        <Modal title="انضمام بكود" onClose={() => setShowJoin(false)}>
          <input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            placeholder="KRX-XXXX"
            className="w-full bg-bg border border-border rounded-xl px-4 py-3 text-text text-sm font-medium outline-none focus:border-primary text-center tracking-widest"
          />
          <button
            onClick={handleJoin}
            className="w-full py-4 rounded-2xl bg-primary font-bold text-white mt-3 active:scale-95 transition-transform"
          >
            انضمام
          </button>
        </Modal>
      )}

      <BottomNav />
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function GroupDetail({ group }) {
  const sorted = [...group.members].sort((a, b) => b.points - a.points)

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <p className="font-black text-text">{group.name}</p>
          <p className="text-xs text-muted">{group.members.length} أعضاء</p>
        </div>
        <button
          onClick={() => navigator.share?.({ title: 'KoraX', text: `انضم لمجموعتي: ${group.code}` })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold"
        >
          <span>🔗</span>
          {group.code}
        </button>
      </div>

      {/* Members */}
      {sorted.map((member, i) => (
        <MemberRow key={i} member={member} rank={i + 1} />
      ))}
    </div>
  )
}

function MemberRow({ member, rank }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 ${member.isMe ? 'bg-primary/5' : ''}`}>
      <span className="text-sm font-bold text-muted w-6 text-center">
        {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}
      </span>

      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${
        member.isMe ? 'bg-primary text-white' : 'bg-border text-muted-light'
      }`}>
        {getInitials(member.name)}
      </div>

      <span className={`flex-1 text-sm font-semibold ${member.isMe ? 'text-primary' : 'text-text'}`}>
        {member.name}
      </span>

      <div className="text-left">
        <span className="text-base font-black text-text">{member.points}</span>
        <span className="text-[10px] text-muted mr-1">نقطة</span>
      </div>
    </div>
  )
}

function EmptyGroups() {
  return (
    <div className="flex flex-col items-center gap-3 py-12 text-muted">
      <span className="text-5xl">👥</span>
      <p className="text-sm font-medium">لا توجد مجموعات بعد</p>
      <p className="text-xs text-center max-w-[200px]">أنشئ مجموعة مع أصدقائك أو انضم بكود</p>
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
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-lg text-text">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-muted">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
