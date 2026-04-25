'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

// ─── Formations & Positions ────────────────────────────────────────────────────

const FORMATIONS = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1']

const FORMATION_POSITIONS = {
  '4-3-3':   [['GK'], ['RB','CB','CB','LB'], ['CM','CM','CM'], ['RW','ST','LW']],
  '4-4-2':   [['GK'], ['RB','CB','CB','LB'], ['RM','CM','CM','LM'], ['ST','ST']],
  '3-5-2':   [['GK'], ['CB','CB','CB'], ['RWB','CM','CDM','CM','LWB'], ['ST','ST']],
  '4-2-3-1': [['GK'], ['RB','CB','CB','LB'], ['CDM','CDM'], ['RW','CAM','LW'], ['ST']],
}

const POS_AR = {
  GK: 'حارس', CB: 'مدافع', LB: 'ظهير', RB: 'ظهير',
  CM: 'وسط',  CDM: 'وسط د', CAM: 'وسط ه',
  LM: 'وسط',  RM: 'وسط',
  LW: 'جناح', RW: 'جناح', ST: 'مهاجم',
  LWB: 'ظهير', RWB: 'ظهير',
}

// توافق مركز اللاعب مع موقع في التشكيلة
const COMPAT = {
  'حارس':      ['GK'],
  'مدافع':     ['CB', 'LB', 'RB', 'LWB', 'RWB'],
  'وسط دفاعي': ['CDM', 'CM'],
  'وسط':       ['CM', 'CDM', 'CAM', 'LM', 'RM'],
  'وسط هجومي': ['CAM', 'CM', 'LM', 'RM'],
  'جناح':      ['LW', 'RW', 'LM', 'RM', 'CAM'],
  'مهاجم':     ['ST', 'LW', 'RW'],
}

function inPosition(player, slotPos) {
  if (!player) return true
  return (COMPAT[player.position] || []).includes(slotPos)
}

// ─── Rarity ────────────────────────────────────────────────────────────────────

const RARITY = {
  legendary: { border: 'border-yellow-500', bg: 'bg-yellow-500/25', text: 'text-yellow-400', glow: 'shadow-yellow-500/50' },
  rare:      { border: 'border-purple-500', bg: 'bg-purple-500/25', text: 'text-purple-400', glow: 'shadow-purple-400/40' },
  common:    { border: 'border-blue-400',   bg: 'bg-blue-400/20',   text: 'text-blue-400',   glow: '' },
}

const RARITY_AR = { legendary: 'أسطوري', rare: 'نادر', common: 'عادي' }

// ─── Stats helpers ─────────────────────────────────────────────────────────────

function calcPower(players) {
  const v = players.filter(Boolean)
  if (!v.length) return 0
  return Math.round(v.reduce((s, p) => s + (p.rating || 75), 0) / v.length)
}

function calcChemistry(players) {
  const v = players.filter(Boolean)
  if (!v.length) return 0
  let c = 0
  const flags = {}, clubs = {}
  v.forEach(p => {
    flags[p.flag] = (flags[p.flag] || 0) + 1
    clubs[p.club] = (clubs[p.club] || 0) + 1
  })
  Object.values(flags).forEach(n => { if (n >= 2) c += (n - 1) })
  Object.values(clubs).forEach(n => { if (n >= 2) c += (n - 1) * 2 })
  return Math.min(c, 99)
}

function chemColor(val) {
  if (val >= 15) return 'text-green'
  if (val >= 7)  return 'text-gold'
  return 'text-muted'
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [formation, setFormation]   = useState('4-3-3')
  const [starters, setStarters]     = useState(Array(11).fill(null))
  const [bench, setBench]           = useState(Array(7).fill(null))
  const [tab, setTab]               = useState('formation') // formation | bench | cards
  const [activeSlot, setActiveSlot] = useState(null)       // { kind, index } | null
  const [selected, setSelected]     = useState(null)
  const [actionSlot, setActionSlot] = useState(null)       // { kind, index, player } | null
  const [myCards, setMyCards]       = useState([])
  const [hasGift, setHasGift]       = useState(false)
  const [copied, setCopied]         = useState(false)

  useEffect(() => {
    const cards     = JSON.parse(localStorage.getItem('korax_my_cards')  || '[]')
    const savedSt   = JSON.parse(localStorage.getItem('korax_starters')  || localStorage.getItem('korax_team') || 'null')
    const savedBe   = JSON.parse(localStorage.getItem('korax_bench')     || 'null')
    const savedForm = localStorage.getItem('korax_formation')
    const lastGift  = localStorage.getItem('korax_last_gift')
    setMyCards(cards)
    if (savedSt)   setStarters(savedSt)
    if (savedBe)   setBench(savedBe)
    if (savedForm) setFormation(savedForm)
    setHasGift(lastGift !== new Date().toISOString().slice(0, 10))
  }, [])

  const power        = calcPower([...starters, ...bench])
  const chemistry    = calcChemistry(starters)
  const starterCount = starters.filter(Boolean).length
  const benchCount   = bench.filter(Boolean).length

  // ── Slot interactions ──────────────────────────────────────────────────────

  function isAlreadyPlaced(player, excludeKind, excludeIdx) {
    return [...starters, ...bench].some((p, i) => {
      if (!p) return false
      const k = i < 11 ? 'starter' : 'bench'
      const j = i < 11 ? i : i - 11
      if (k === excludeKind && j === excludeIdx) return false
      return p.id === player.id
    })
  }

  function handleSlotPress(kind, idx) {
    if (selected) {
      if (isAlreadyPlaced(selected, kind, idx)) return // منع التكرار
      place(kind, idx, selected)
      setSelected(null)
      setActiveSlot(null)
    } else {
      const currentPlayer = kind === 'starter' ? starters[idx] : bench[idx]
      if (currentPlayer) {
        setActionSlot({ kind, index: idx, player: currentPlayer })
      } else {
        const same = activeSlot?.kind === kind && activeSlot?.index === idx
        if (same) {
          setActiveSlot(null)
        } else {
          setActiveSlot({ kind, index: idx })
          setTab('cards')
        }
      }
    }
  }

  function handleCardPress(player) {
    if (activeSlot) {
      place(activeSlot.kind, activeSlot.index, player)
      const returnTab = activeSlot.kind === 'bench' ? 'bench' : 'formation'
      setActiveSlot(null)
      setSelected(null)
      setTab(returnTab)
    } else {
      setSelected(prev =>
        prev?.id === player.id && prev?.obtainedAt === player.obtainedAt ? null : player
      )
    }
  }

  function place(kind, idx, player) {
    if (kind === 'starter') {
      const next = [...starters]
      next[idx] = player
      setStarters(next)
      localStorage.setItem('korax_starters', JSON.stringify(next))
    } else {
      const next = [...bench]
      next[idx] = player
      setBench(next)
      localStorage.setItem('korax_bench', JSON.stringify(next))
    }
  }

  function removeSlot(kind, idx) {
    if (kind === 'starter') {
      const next = [...starters]; next[idx] = null
      setStarters(next); localStorage.setItem('korax_starters', JSON.stringify(next))
    } else {
      const next = [...bench]; next[idx] = null
      setBench(next); localStorage.setItem('korax_bench', JSON.stringify(next))
    }
  }

  function changeFormation(f) {
    setFormation(f)
    setStarters(Array(11).fill(null))
    setActiveSlot(null); setSelected(null)
    localStorage.setItem('korax_formation', f)
    localStorage.removeItem('korax_starters')
  }

  function handleShare() {
    const flatPos = FORMATION_POSITIONS[formation].flat()
    const lines = [`⚽ فريقي في KoraX — ${formation}`, '']
    starters.forEach((p, i) => {
      const lbl = POS_AR[flatPos[i]] || flatPos[i]
      lines.push(`${lbl}: ${p ? `${p.flag} ${p.name} (${p.rating})` : '—'}`)
    })
    if (bench.some(Boolean)) {
      lines.push('', '🔄 الاحتياطيون:')
      bench.filter(Boolean).forEach(p => lines.push(`  ${p.flag} ${p.name}`))
    }
    lines.push('', `⚡ قوة ${power} · انسجام ${chemistry}`)
    lines.push('🏆 كأس العالم 2026 · KoraX App')
    const text = lines.join('\n')
    if (navigator.share) {
      navigator.share({ title: 'فريقي في KoraX', text })
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true); setTimeout(() => setCopied(false), 2500)
      })
    }
  }

  const hint = selected
    ? `اضغط على مكان لوضع ${selected.name}`
    : activeSlot
      ? activeSlot.kind === 'bench'
        ? 'اختر لاعباً للاحتياطي من كروتي'
        : 'اختر لاعباً للتشكيلة من كروتي'
      : 'اضغط على مكان فارغ لاختيار لاعب'

  return (
    <div>
      <Header title="فريقي" />
      <div className="page-content">

        {/* Stats bar */}
        <div className="px-4 pt-4 mb-3">
          <div className="card px-3 py-3 flex items-center justify-around">
            <StatPill label="القوة"       value={power > 0 ? power : '—'}           icon="🔥" color="text-live"                    />
            <div className="w-px h-10 bg-border" />
            <StatPill label="الانسجام"   value={chemistry > 0 ? chemistry : '—'}   icon="🤝" color={chemistry > 0 ? chemColor(chemistry) : 'text-muted'} />
            <div className="w-px h-10 bg-border" />
            <StatPill label="الأساسيون"  value={`${starterCount}/11`}              icon="👥" color="text-primary"                  />
            <div className="w-px h-10 bg-border" />
            <button onClick={handleShare} className="flex flex-col items-center gap-0.5 active:scale-95 transition-transform">
              <span className="text-lg">{copied ? '✅' : '📤'}</span>
              <span className="text-[9px] text-muted">{copied ? 'نُسخ!' : 'شارك'}</span>
            </button>
          </div>
        </div>

        {/* Formation selector */}
        <div className="tab-bar mb-3">
          {FORMATIONS.map(f => (
            <button key={f} onClick={() => changeFormation(f)}
              className={`tab-item ${formation === f ? 'active' : ''}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Main tabs */}
        <div className="flex gap-2 px-4 mb-4">
          {[
            { id: 'formation', label: `التشكيلة ${starterCount}/11` },
            { id: 'bench',     label: `الاحتياطي ${benchCount}/7`  },
            { id: 'cards',     label: `كروتي (${myCards.length})`  },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-[11px] transition-all ${
                tab === t.id
                  ? t.id === 'bench' ? 'bg-gold text-black' : 'bg-primary text-white'
                  : 'bg-card border border-border text-muted'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Formation view ── */}
        {tab === 'formation' && (
          <>
            <FormationPitch
              formation={formation}
              starters={starters}
              activeSlot={activeSlot?.kind === 'starter' ? activeSlot.index : null}
              onSlotPress={i => handleSlotPress('starter', i)}
              onRemove={i => removeSlot('starter', i)}
            />
            <p className="text-center text-xs text-muted px-4 pb-2">{hint}</p>
            {starterCount > 0 && (
              <ChemistryBar chemistry={chemistry} starters={starters} formation={formation} />
            )}
          </>
        )}

        {/* ── Bench view ── */}
        {tab === 'bench' && (
          <>
            <BenchView
              bench={bench}
              activeSlot={activeSlot?.kind === 'bench' ? activeSlot.index : null}
              onSlotPress={i => handleSlotPress('bench', i)}
              onRemove={i => removeSlot('bench', i)}
            />
            <p className="text-center text-xs text-muted px-4 pb-3">{hint}</p>
          </>
        )}

        {/* ── Cards view ── */}
        {tab === 'cards' && (
          <CardsView
            cards={myCards}
            selected={selected}
            activeSlot={activeSlot}
            onSelect={handleCardPress}
            placedIds={new Set([...starters, ...bench].filter(Boolean).map(p => p.id))}
          />
        )}

        {/* Action sheet — حذف أو تغيير لاعب */}
        {actionSlot && (
          <SlotActionSheet
            player={actionSlot.player}
            onReplace={() => {
              setActiveSlot({ kind: actionSlot.kind, index: actionSlot.index })
              setActionSlot(null)
              setTab('cards')
            }}
            onRemove={() => {
              removeSlot(actionSlot.kind, actionSlot.index)
              setActionSlot(null)
            }}
            onClose={() => setActionSlot(null)}
          />
        )}

        {/* هدية يومية */}
        {hasGift && (
          <div className="mx-4 mb-4 card p-4 border-gold/30 bg-gold-bg">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🎁</span>
              <div className="flex-1">
                <p className="font-bold text-text text-sm">هديتك اليومية جاهزة!</p>
                <p className="text-xs text-muted">اختر لاعباً من بين لاعبَين</p>
              </div>
              <Link href="/gift" className="px-4 py-2 rounded-xl bg-gold text-black text-xs font-black active:scale-95 transition-transform">
                افتح
              </Link>
            </div>
          </div>
        )}

        {myCards.length === 0 && tab === 'cards' && (
          <div className="px-4 mb-4 text-center">
            <p className="text-sm text-muted mb-3">لا يوجد كروت بعد</p>
            <Link href="/gift" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-bold text-sm">
              🎁 احصل على أول لاعب
            </Link>
          </div>
        )}

      </div>
      <BottomNav />
    </div>
  )
}

// ─── Formation Pitch ───────────────────────────────────────────────────────────

function FormationPitch({ formation, starters, activeSlot, onSlotPress, onRemove }) {
  const rows = FORMATION_POSITIONS[formation] || FORMATION_POSITIONS['4-3-3']
  let idx = 0

  return (
    <div className="pitch mx-4 mb-2 px-3 py-4 relative" style={{ minHeight: 370 }}>
      <div className="flex flex-col h-full justify-around gap-2 relative">
        {rows.map((positions, rowIdx) => {
          const slots = positions.map(pos => {
            const i      = idx++
            const player = starters[i]
            return (
              <FormationSlot
                key={i}
                slotIdx={i}
                pos={pos}
                player={player}
                isActive={activeSlot === i}
                onPress={onSlotPress}
                onRemove={onRemove}
              />
            )
          })
          return (
            <div key={rowIdx} className="flex justify-around items-end">
              {slots}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FormationSlot({ slotIdx, pos, player, isActive, onPress, onRemove }) {
  const cfg   = player ? (RARITY[player.rarity] || RARITY.common) : null
  const good  = player ? inPosition(player, pos) : true
  const posLbl = POS_AR[pos] || pos

  return (
    <div className="flex flex-col items-center gap-0.5" style={{ minWidth: 52 }}>
      <button
        onClick={() => onPress(slotIdx)}
        className={`w-[52px] h-[52px] rounded-full border-2 flex flex-col items-center justify-center transition-all duration-200 relative ${
          player
            ? `${cfg.border} ${cfg.bg} shadow-lg ${cfg.glow} ${good ? '' : 'ring-2 ring-amber-400/70'}`
            : isActive
              ? 'border-gold bg-gold/20 animate-pulse scale-110'
              : 'border-white/25 bg-white/5 active:scale-90'
        }`}
      >
        {player ? (
          <>
            <span className="text-[22px] leading-none">{player.flag}</span>
            <span className={`text-[9px] font-black leading-none ${cfg.text}`}>{player.rating}</span>
            {!good && (
              <span className="absolute -top-1 -right-0.5 text-[10px]">⚠️</span>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-white/25 text-lg leading-none">+</span>
            <span className="text-[7px] text-white/30 font-bold leading-none">{posLbl}</span>
          </div>
        )}
      </button>

      {player ? (
        <>
          <span className="text-[9px] text-white/85 font-bold max-w-[54px] text-center leading-tight truncate">
            {player.name.split(' ').at(-1)}
          </span>
          {!good && (
            <span className="text-[7px] text-amber-400 font-bold leading-none">خارج مركزه</span>
          )}
        </>
      ) : (
        <span className="text-[8px] text-white/20">{posLbl}</span>
      )}
    </div>
  )
}

// ─── Chemistry Bar ─────────────────────────────────────────────────────────────

function ChemistryBar({ chemistry, starters, formation }) {
  const flatPos     = FORMATION_POSITIONS[formation].flat()
  const outOfPos    = starters.filter((p, i) => p && !inPosition(p, flatPos[i])).length
  const inPosCount  = starters.filter((p, i) => p && inPosition(p, flatPos[i])).length

  return (
    <div className="mx-4 mb-4 card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-text">تحليل الفريق</span>
        <span className={`text-xs font-black ${chemColor(chemistry)}`}>انسجام {chemistry}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-border overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            chemistry >= 15 ? 'bg-green' : chemistry >= 7 ? 'bg-gold' : 'bg-muted'
          }`}
          style={{ width: `${Math.min((chemistry / 30) * 100, 100)}%` }}
        />
      </div>
      <div className="flex gap-3 text-center">
        <div className="flex-1">
          <p className="text-sm font-black text-green">{inPosCount}</p>
          <p className="text-[9px] text-muted">في مركزه</p>
        </div>
        <div className="flex-1">
          <p className="text-sm font-black text-amber-400">{outOfPos}</p>
          <p className="text-[9px] text-muted">خارج مركزه</p>
        </div>
        <div className="flex-1">
          <p className="text-sm font-black text-primary">{starters.filter(Boolean).length}</p>
          <p className="text-[9px] text-muted">لاعب</p>
        </div>
      </div>
    </div>
  )
}

// ─── Bench View ────────────────────────────────────────────────────────────────

function BenchView({ bench, activeSlot, onSlotPress, onRemove }) {
  return (
    <div className="mx-4 mb-4">
      <p className="text-xs text-muted text-center mb-3">اضغط على مكان فارغ لإضافة لاعب · اضغط على لاعب لتغييره أو حذفه</p>
      <div className="card p-4">
        <div className="grid grid-cols-4 gap-3">
          {bench.map((player, i) => {
            const cfg   = player ? (RARITY[player.rarity] || RARITY.common) : null
            const isAct = activeSlot === i
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <button
                  onClick={() => onSlotPress(i)}
                  className={`w-full aspect-square rounded-2xl border-2 flex flex-col items-center justify-center transition-all ${
                    player
                      ? `${cfg.border} ${cfg.bg} shadow-md ${cfg.glow}`
                      : isAct
                        ? 'border-gold bg-gold/20 animate-pulse scale-110'
                        : 'border-white/20 bg-white/5 active:scale-95'
                  }`}
                  style={{ minHeight: 56 }}
                >
                  {player ? (
                    <>
                      <span className="text-[22px] leading-none">{player.flag}</span>
                      <span className={`text-[9px] font-black leading-none mt-0.5 ${cfg.text}`}>{player.rating}</span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-white/25 text-xl leading-none">+</span>
                      <span className="text-[7px] text-white/30">احتياطي</span>
                    </div>
                  )}
                </button>
                {player && (
                  <span className="text-[9px] text-white/80 font-bold text-center leading-tight truncate w-full">
                    {player.name.split(' ').at(-1)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Cards View ────────────────────────────────────────────────────────────────

function CardsView({ cards, selected, activeSlot, onSelect, placedIds }) {
  if (cards.length === 0) return null

  return (
    <div className="px-4 mb-4">
      {activeSlot && (
        <div className="mb-3 py-2.5 px-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
          <p className="text-xs text-primary font-bold">
            {activeSlot.kind === 'bench' ? '🔄 اختر لاعباً للاحتياطي' : '⚽ اختر لاعباً للتشكيلة الأساسية'}
          </p>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2">
        {cards.map((player, i) => {
          const cfg     = RARITY[player.rarity] || RARITY.common
          const isSel   = selected?.id === player.id && selected?.obtainedAt === player.obtainedAt
          const isPlaced = placedIds?.has(player.id)
          return (
            <button
              key={i}
              onClick={() => !isPlaced && onSelect(player)}
              disabled={isPlaced}
              className={`rounded-2xl p-3 text-center border-2 transition-all relative ${
                isSel
                  ? `${cfg.border} scale-105 shadow-xl ${cfg.glow}`
                  : isPlaced
                    ? 'border-border bg-card opacity-40 cursor-not-allowed'
                    : 'border-border bg-card active:scale-95'
              }`}
            >
              {isPlaced && (
                <span className="absolute top-1 right-1 text-[9px] bg-primary text-white rounded-full px-1 font-bold">✓</span>
              )}
              <div className="text-2xl mb-1">{player.flag}</div>
              <p className="text-[10px] font-black text-text leading-tight">{player.name}</p>
              <p className="text-[9px] text-muted leading-tight mt-0.5">{player.position}</p>
              <p className={`text-[9px] font-bold mt-0.5 ${cfg.text}`}>{RARITY_AR[player.rarity]}</p>
              {player.rating && <p className="text-[9px] text-muted font-bold mt-0.5">{player.rating}</p>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Slot Action Sheet ─────────────────────────────────────────────────────────

function SlotActionSheet({ player, onReplace, onRemove, onClose }) {
  const cfg = RARITY[player.rarity] || RARITY.common
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[480px] bg-card border-t border-border rounded-t-3xl p-6 pb-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

        {/* Player info */}
        <div className={`flex items-center gap-3 mb-5 p-3 rounded-2xl border-2 ${cfg.border} ${cfg.bg}`}>
          <span className="text-4xl">{player.flag}</span>
          <div className="flex-1">
            <p className="font-black text-text">{player.name}</p>
            <p className="text-xs text-muted">{player.position} · {RARITY_AR[player.rarity]}</p>
          </div>
          <span className={`text-xl font-black ${cfg.text}`}>{player.rating}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onReplace}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm active:scale-95 transition-transform"
          >
            🔄 تغيير اللاعب
          </button>
          <button
            onClick={onRemove}
            className="w-full py-4 rounded-2xl border border-live/40 text-live font-bold text-sm active:scale-95 transition-transform"
          >
            🗑️ حذف من التشكيلة
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Stat Pill ─────────────────────────────────────────────────────────────────

function StatPill({ label, value, icon, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xl">{icon}</span>
      <span className={`text-base font-black ${color}`}>{value}</span>
      <span className="text-[9px] text-muted">{label}</span>
    </div>
  )
}
