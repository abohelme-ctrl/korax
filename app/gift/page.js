'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { useAuth } from '@/lib/useAuth'

import { PLAYERS as GIFT_PLAYERS, saveCardToStorage } from '@/lib/players'

const RARITY_CONFIG = {
  legendary: { label: 'أسطوري',  bg: 'from-yellow-500/30 to-amber-600/20',  border: 'border-yellow-500/50',  text: 'text-yellow-400',  glow: 'shadow-yellow-500/30' },
  rare:      { label: 'نادر',    bg: 'from-purple-500/30 to-violet-600/20', border: 'border-purple-500/50', text: 'text-purple-400',  glow: 'shadow-purple-500/30' },
  common:    { label: 'عادي',    bg: 'from-blue-500/20 to-cyan-600/10',     border: 'border-blue-500/30',   text: 'text-blue-400',    glow: 'shadow-blue-500/20'   },
}

function getDailyPair() {
  // اختر لاعبَين عشوائيَّين بناءً على تاريخ اليوم (ثابتان طوال اليوم)
  const seed = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const i1   = Number(seed) % GIFT_PLAYERS.length
  const i2   = (i1 + 7) % GIFT_PLAYERS.length
  return [GIFT_PLAYERS[i1], GIFT_PLAYERS[i2]]
}

export default function GiftPage() {
  const router = useRouter()
  const { isLoggedIn, isLoading } = useAuth()
  const [pair, setPair]           = useState([])
  const [chosen, setChosen]       = useState(null)
  const [claimed, setClaimed]     = useState(false)
  const [claiming, setClaiming]   = useState(false)
  const [myCards, setMyCards]     = useState([])

  useEffect(() => {
    setPair(getDailyPair())
    // تحقق هل أخذ الهدية اليوم
    const lastClaim = localStorage.getItem('korax_last_gift')
    const todayStr  = new Date().toISOString().slice(0, 10)
    if (lastClaim === todayStr) setClaimed(true)
    // تحميل كروت المستخدم
    const cards = JSON.parse(localStorage.getItem('korax_my_cards') || '[]')
    setMyCards(cards)
  }, [])

  async function handleClaim() {
    if (!chosen || claiming) return
    setClaiming(true)

    // حفظ محلياً
    const todayStr = new Date().toISOString().slice(0, 10)
    localStorage.setItem('korax_last_gift', todayStr)
    saveCardToStorage(chosen, 'daily_gift')

    // تحديث قائمة الكروت لعرضها فوراً
    const updatedCards = JSON.parse(localStorage.getItem('korax_my_cards') || '[]')
    setMyCards(updatedCards)

    setClaimed(true)
    setClaiming(false)
  }

  if (isLoading) return null

  return (
    <div>
      <Header back title="الهدية اليومية" />

      <div className="page-content px-4 py-4">

        {/* Header card */}
        <div className="card p-5 mb-5 text-center bg-gradient-to-br from-gold/10 to-amber-600/5 border-gold/20">
          <span className="text-5xl block mb-2">🎁</span>
          <h1 className="text-xl font-black text-text mb-1">هديتك اليومية</h1>
          <p className="text-sm text-muted">اختر لاعباً واضفه لمنتخبك — تتجدد كل يوم</p>
        </div>

        {claimed ? (
          /* تم الاستلام */
          <ClaimedView myCards={myCards} />
        ) : !isLoggedIn ? (
          /* غير مسجّل */
          <div className="card p-8 text-center">
            <span className="text-4xl block mb-3">🔒</span>
            <p className="text-sm font-bold text-text mb-1">سجّل دخولك</p>
            <p className="text-xs text-muted mb-4">لاستلام هديتك اليومية</p>
            <button onClick={() => router.push('/login')} className="px-6 py-3 rounded-2xl bg-primary text-white font-bold text-sm">
              تسجيل الدخول
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm font-bold text-muted-light mb-3 text-center">اختر أحد اللاعبين 👇</p>

            {/* اللاعبان */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {pair.map(player => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  selected={chosen?.id === player.id}
                  onSelect={() => setChosen(player)}
                />
              ))}
            </div>

            {/* زر الاستلام */}
            <button
              onClick={handleClaim}
              disabled={!chosen || claiming}
              className={`w-full py-4 rounded-2xl font-black text-base transition-all ${
                chosen
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 active:scale-95'
                  : 'bg-card border border-border text-muted'
              } disabled:opacity-70`}
            >
              {claiming ? 'جاري الاستلام...' : chosen ? `✓ استلم "${chosen.name}"` : 'اختر لاعباً أولاً'}
            </button>

            {/* نظام النقاط والكروت */}
            <div className="mt-5 card p-4">
              <p className="text-xs font-bold text-muted mb-3">كيف تجمع لاعبين أكثر؟</p>
              <div className="space-y-2">
                <RewardRow icon="🎁" label="هدية يومية"           desc="لاعب يومياً — اختر بين اثنين" />
                <RewardRow icon="⭐" label="توقع صحيح (+1 نقطة)" desc="احصل على لاعب عادي"           rarity="common"    />
                <RewardRow icon="🎯" label="نتيجة دقيقة (+3 نقاط)"desc="احصل على لاعب نادر"          rarity="rare"      />
                <RewardRow icon="🔥" label="3 متتاليات صحيحة"     desc="احصل على لاعب أسطوري"        rarity="legendary" />
              </div>
            </div>
          </>
        )}

        {/* كروتي */}
        {myCards.length > 0 && (
          <div className="mt-5">
            <p className="text-sm font-bold text-muted-light mb-3">كروتي ({myCards.length})</p>
            <div className="grid grid-cols-3 gap-2">
              {myCards.slice(-6).map((card, i) => (
                <MiniCard key={i} player={card} />
              ))}
            </div>
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  )
}

// ─── Player Card ───────────────────────────────────────────────────────────────

function PlayerCard({ player, selected, onSelect }) {
  const cfg = RARITY_CONFIG[player.rarity]
  return (
    <button
      onClick={onSelect}
      className={`relative rounded-3xl p-4 text-center transition-all active:scale-95 bg-gradient-to-br ${cfg.bg} border-2 ${
        selected ? `${cfg.border} shadow-xl ${cfg.glow}` : 'border-border'
      }`}
    >
      {selected && (
        <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <span className="text-white text-xs font-black">✓</span>
        </div>
      )}

      {/* Rarity badge */}
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.text} bg-black/20 mb-2 inline-block`}>
        {cfg.label}
      </span>

      {/* Flag + Rating */}
      <div className="relative mx-auto w-16 h-16 mb-2">
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cfg.bg} border ${cfg.border} flex items-center justify-center text-3xl`}>
          {player.flag}
        </div>
        <span className={`absolute -bottom-1 -right-1 text-[10px] font-black px-1.5 py-0.5 rounded-lg bg-card border ${cfg.border} ${cfg.text}`}>
          {player.rating}
        </span>
      </div>

      <p className="text-xs font-black text-text leading-tight">{player.name}</p>
      <p className="text-[9px] text-muted mt-0.5">{player.position} · {player.club}</p>
    </button>
  )
}

// ─── Mini Card ─────────────────────────────────────────────────────────────────

function MiniCard({ player }) {
  const cfg = RARITY_CONFIG[player.rarity]
  return (
    <div className={`rounded-2xl p-2 text-center bg-gradient-to-br ${cfg.bg} border ${cfg.border}`}>
      <div className="text-2xl mb-1">{player.flag}</div>
      <p className="text-[9px] font-bold text-text leading-tight truncate">{player.name}</p>
      <p className={`text-[8px] font-black ${cfg.text}`}>{cfg.label}</p>
    </div>
  )
}

// ─── Claimed View ──────────────────────────────────────────────────────────────

function ClaimedView({ myCards }) {
  const today      = new Date().toISOString().slice(0, 10)
  const todayCard  = myCards.find(c => c.obtainedAt === today && c.source === 'daily_gift')

  return (
    <div className="text-center py-8">
      <span className="text-6xl block mb-4">✅</span>
      <h2 className="text-xl font-black text-text mb-1">استلمت هديتك اليوم!</h2>
      {todayCard && (
        <div className="mt-4 inline-block">
          <PlayerCard player={todayCard} selected={false} onSelect={() => {}} />
        </div>
      )}
      <p className="text-sm text-muted mt-4">تعود الهدية غداً — واصل التوقع لتجمع لاعبين أكثر</p>
    </div>
  )
}

// ─── Reward Row ────────────────────────────────────────────────────────────────

function RewardRow({ icon, label, desc, rarity }) {
  const cfg = rarity ? RARITY_CONFIG[rarity] : null
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl w-7 text-center">{icon}</span>
      <div className="flex-1">
        <p className="text-xs font-bold text-text">{label}</p>
        <p className="text-[10px] text-muted">{desc}</p>
      </div>
      {cfg && (
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${cfg.border} ${cfg.text}`}>
          {cfg.label}
        </span>
      )}
    </div>
  )
}
