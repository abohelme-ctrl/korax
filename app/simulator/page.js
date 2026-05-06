'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

// ─── بيانات المجموعات الـ 12 ────────────────────────────────────────────────
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
    { id: 'D1',   name: 'الولايات المتحدة', flag: '🇺🇸', stars: 0 },
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
    { id: '2601', name: 'اليابان',           flag: '🇯🇵', stars: 0 },
    { id: '744',  name: 'السويد',            flag: '🇸🇪', stars: 0 },
    { id: '4601', name: 'تونس',              flag: '🇹🇳', stars: 0 },
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
    { id: 'I1',   name: 'فرنسا',             flag: '🇫🇷', stars: 2 },
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
    { id: '3001', name: 'كرواتيا',           flag: '🇭🇷', stars: 0 },
    { id: '14',   name: 'غانا',              flag: '🇬🇭', stars: 0 },
    { id: '1536', name: 'بنما',              flag: '🇵🇦', stars: 0 },
  ]},
]

const LS_KEY = 'korax_simulator'

// بناء مباريات دور الـ32 (16 مباراة)
// تزاوج: 1A vs 2B, 1B vs 2A, 1C vs 2D, 1D vs 2C, ...
function buildBracket(gp, thirdTeams) {
  const pairings = [
    ['A','B'], ['B','A'],
    ['C','D'], ['D','C'],
    ['E','F'], ['F','E'],
    ['G','H'], ['H','G'],
    ['I','J'], ['J','I'],
    ['K','L'], ['L','K'],
  ]
  const r32 = pairings.map(([g1, g2]) => ({
    home: gp[g1]?.first  || null,
    away: gp[g2]?.second || null,
  }))
  // 4 مباريات للمراكز الثالثة
  for (let i = 0; i < 8; i += 2) {
    r32.push({ home: thirdTeams[i] || null, away: thirdTeams[i + 1] || null })
  }
  return r32 // 16 مباراة
}

function buildRound(prevWinners) {
  const matches = []
  for (let i = 0; i < prevWinners.length; i += 2) {
    matches.push({ home: prevWinners[i] || null, away: prevWinners[i + 1] || null })
  }
  return matches
}

export default function SimulatorPage() {
  const [phase, setPhase] = useState('groups')     // 'groups' | 'thirds' | 'bracket' | 'done'
  const [groupPicks, setGroupPicks] = useState({}) // { A: { first: team, second: team }, ... }
  const [thirdPicks, setThirdPicks] = useState([]) // 8 فرق من المراكز الثالثة
  const [bracketPicks, setBracketPicks] = useState({}) // { r32: [t,t,...], r16: [...], qf, sf, final }
  const [champion, setChampion] = useState(null)
  const [confetti, setConfetti] = useState(false)

  // Load from localStorage
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
      if (s.phase)        setPhase(s.phase)
      if (s.groupPicks)   setGroupPicks(s.groupPicks)
      if (s.thirdPicks)   setThirdPicks(s.thirdPicks)
      if (s.bracketPicks) setBracketPicks(s.bracketPicks)
      if (s.champion)     setChampion(s.champion)
    } catch {}
  }, [])

  function save(patch) {
    const state = { phase, groupPicks, thirdPicks, bracketPicks, champion, ...patch }
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  }

  function pickGroup(groupId, rank, team) {
    const current = groupPicks[groupId] || {}
    let next = { ...current }

    if (rank === 'first') {
      // إذا كان نفس الفريق محدداً كثانٍ، احذفه من ثانٍ
      if (next.second?.id === team.id) delete next.second
      next.first = team
    } else {
      if (next.first?.id === team.id) delete next.first
      next.second = team
    }

    const newGP = { ...groupPicks, [groupId]: next }
    setGroupPicks(newGP)
    save({ groupPicks: newGP })
  }

  function toggleThird(team) {
    setThirdPicks(prev => {
      const exists = prev.some(t => t.id === team.id)
      let next
      if (exists) {
        next = prev.filter(t => t.id !== team.id)
      } else if (prev.length < 8) {
        next = [...prev, team]
      } else {
        return prev // وصل للحد
      }
      save({ thirdPicks: next })
      return next
    })
  }

  function goToBracket() {
    const bp = { r32: Array(16).fill(null), r16: Array(8).fill(null), qf: Array(4).fill(null), sf: Array(2).fill(null), final: null }
    setBracketPicks(bp)
    setPhase('bracket')
    save({ phase: 'bracket', bracketPicks: bp })
  }

  function pickBracket(round, idx, team) {
    setBracketPicks(prev => {
      const next = { ...prev, [round]: [...(prev[round] || [])] }
      next[round][idx] = team

      // إذا اكتمل الدور، ابنِ الدور التالي
      const roundOrder = ['r32', 'r16', 'qf', 'sf']
      const ri = roundOrder.indexOf(round)

      if (ri !== -1) {
        const nextRound = roundOrder[ri + 1]
        if (nextRound) {
          const matchIdx = Math.floor(idx / 2)
          if (!next[nextRound]) next[nextRound] = Array(Math.ceil(next[round].length / 2)).fill(null)
          // احذف الاختيار في الدور التالي إذا تغير
          next[nextRound][matchIdx] = null
        }
      }

      // إذا كان النهائي
      if (round === 'sf') {
        next.final = null
      }
      if (round === 'final') {
        setChampion(team)
        setConfetti(true)
        setPhase('done')
        setTimeout(() => setConfetti(false), 5000)
        save({ phase: 'done', bracketPicks: next, champion: team })
      }

      save({ bracketPicks: next })
      return next
    })
  }

  function resetAll() {
    setPhase('groups')
    setGroupPicks({})
    setThirdPicks([])
    setBracketPicks({})
    setChampion(null)
    localStorage.removeItem(LS_KEY)
  }

  // ── حساب المجموعات المكتملة
  const completedGroups = GROUPS.filter(g => groupPicks[g.id]?.first && groupPicks[g.id]?.second).length
  const allGroupsDone   = completedGroups === 12

  // ── المراكز الثالثة: فريق واحد من كل مجموعة غير الأول والثاني
  const thirdPlaceTeams = GROUPS.map(g => {
    const fp = groupPicks[g.id]?.first
    const sp = groupPicks[g.id]?.second
    const others = g.teams.filter(t => t.id !== fp?.id && t.id !== sp?.id)
    // أفضل فريق ثالث (الأكثر نجوماً، أو الأول في القائمة)
    return others.sort((a, b) => b.stars - a.stars)[0] || null
  }).filter(Boolean)

  // ── بناء الـ bracket
  const r32Matches = (phase === 'bracket' || phase === 'done')
    ? buildBracket(groupPicks, thirdPicks)
    : []

  const r16Winners  = bracketPicks.r32 || []
  const qfWinners   = bracketPicks.r16 || []
  const sfWinners   = bracketPicks.qf  || []
  const finalTeams  = bracketPicks.sf  || []

  const r16Matches  = buildRound(r16Winners.filter(Boolean))
  const qfMatches   = buildRound(qfWinners.filter(Boolean))
  const sfMatches   = buildRound(sfWinners.filter(Boolean))
  const finalMatch  = finalTeams.filter(Boolean).length === 2
    ? [{ home: finalTeams[0], away: finalTeams[1] }]
    : []

  // ── progress لكل الـ32
  const r32Done = (bracketPicks.r32 || []).filter(Boolean).length

  return (
    <div>
      <Header title="محاكي البطولة" back />

      <div className="page-content pb-24">

        {/* ─── Phase Tabs ─── */}
        <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto hide-scrollbar">
          {[
            { id: 'groups',  label: 'المجموعات', icon: '🏟️' },
            { id: 'thirds',  label: 'أفضل ثالث',  icon: '🎯' },
            { id: 'bracket', label: 'الكأس',      icon: '🏆' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'groups') setPhase('groups')
                if (tab.id === 'thirds' && allGroupsDone) setPhase('thirds')
                if (tab.id === 'bracket' && thirdPicks.length === 8) setPhase('bracket')
                if (tab.id === 'bracket' && phase === 'done') setPhase('bracket')
              }}
              disabled={
                (tab.id === 'thirds'  && !allGroupsDone) ||
                (tab.id === 'bracket' && thirdPicks.length < 8 && phase !== 'done')
              }
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                (phase === tab.id || (phase === 'done' && tab.id === 'bracket'))
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-muted disabled:opacity-40'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
          <div className="flex-shrink-0 px-2 py-1.5 text-[10px] text-muted self-center">
            {completedGroups}/12 مجموعة
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            Phase 1: Groups
        ════════════════════════════════════════════════════════════ */}
        {phase === 'groups' && (
          <div className="px-4 space-y-3 pb-4">
            <p className="text-xs text-muted text-center">
              اختر المتأهل الأول والثاني من كل مجموعة
            </p>

            {GROUPS.map(group => {
              const gp = groupPicks[group.id] || {}
              const done = gp.first && gp.second
              return (
                <div key={group.id} className={`card overflow-hidden ${done ? 'border-primary/30' : ''}`}>
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border bg-card-hover">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${done ? 'bg-primary text-white' : 'bg-bg text-muted border border-border'}`}>
                      {done ? '✓' : group.id}
                    </div>
                    <span className="font-black text-text text-sm">المجموعة {group.id}</span>
                    {done && (
                      <div className="flex gap-1 mr-auto">
                        <span className="text-xs bg-gold/20 text-gold px-1.5 py-0.5 rounded-full">1. {gp.first.name}</span>
                        <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">2. {gp.second.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="divide-y divide-border">
                    {group.teams.map(team => {
                      const isFirst  = gp.first?.id  === team.id
                      const isSecond = gp.second?.id === team.id
                      return (
                        <div key={team.id} className="flex items-center px-4 py-2.5 gap-3">
                          <span className="text-2xl">{team.flag}</span>
                          <span className="text-sm font-bold text-text flex-1">{team.name}</span>
                          {team.stars > 0 && (
                            <span className="text-[9px] text-gold">{'⭐'.repeat(Math.min(team.stars, 3))}</span>
                          )}
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => pickGroup(group.id, 'first', team)}
                              className={`w-8 h-7 rounded-lg text-[10px] font-black transition-all active:scale-90 ${
                                isFirst
                                  ? 'bg-gold text-black'
                                  : 'bg-card border border-border text-muted'
                              }`}
                            >1</button>
                            <button
                              onClick={() => pickGroup(group.id, 'second', team)}
                              className={`w-8 h-7 rounded-lg text-[10px] font-black transition-all active:scale-90 ${
                                isSecond
                                  ? 'bg-primary text-white'
                                  : 'bg-card border border-border text-muted'
                              }`}
                            >2</button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {allGroupsDone && (
              <button
                onClick={() => setPhase('thirds')}
                className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/30"
              >
                <span>التالي: أفضل ثالث</span>
                <span>←</span>
              </button>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            Phase 2: 3rd Place Selection
        ════════════════════════════════════════════════════════════ */}
        {phase === 'thirds' && (
          <div className="px-4 pb-4">
            <div className="card p-4 mb-4 bg-primary/5 border-primary/20">
              <p className="text-sm font-bold text-text mb-1">
                اختر أفضل 8 فرق من المراكز الثالثة ({thirdPicks.length}/8)
              </p>
              <p className="text-[11px] text-muted">
                ستُضاف هذه الفرق لدور الـ32 جانباً للأوائل والثواني
              </p>
            </div>

            {/* Progress */}
            <div className="h-2 bg-card rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${(thirdPicks.length / 8) * 100}%` }}
              />
            </div>

            <div className="space-y-2">
              {thirdPlaceTeams.map(team => {
                const selected = thirdPicks.some(t => t.id === team.id)
                const disabled = !selected && thirdPicks.length >= 8
                return (
                  <button
                    key={team.id}
                    onClick={() => !disabled && toggleThird(team)}
                    disabled={disabled}
                    className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all active:scale-95 ${
                      selected
                        ? 'bg-primary/10 border-primary'
                        : disabled
                          ? 'bg-card border-border opacity-40'
                          : 'bg-card border-border'
                    }`}
                  >
                    <span className="text-2xl">{team.flag}</span>
                    <span className="font-bold text-text flex-1 text-right">{team.name}</span>
                    {team.stars > 0 && <span className="text-[10px] text-gold">{'⭐'.repeat(Math.min(team.stars,3))}</span>}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selected ? 'bg-primary border-primary' : 'border-border'
                    }`}>
                      {selected && <span className="text-white text-[10px]">✓</span>}
                    </div>
                  </button>
                )
              })}
            </div>

            {thirdPicks.length === 8 && (
              <button
                onClick={goToBracket}
                className="w-full mt-4 py-4 rounded-2xl bg-primary text-white font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/30"
              >
                <span>ابدأ البطولة</span>
                <span>🏆</span>
              </button>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════
            Phase 3 + Done: Bracket
        ════════════════════════════════════════════════════════════ */}
        {(phase === 'bracket' || phase === 'done') && (
          <div className="px-4 pb-4 space-y-4">

            {/* Champion banner */}
            {phase === 'done' && champion && (
              <div
                className="relative rounded-3xl overflow-hidden p-6 text-center"
                style={{ background: 'linear-gradient(135deg, #0F172A, #1A2F1A)' }}
              >
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <span className="text-[200px]">🏆</span>
                </div>
                <p className="text-yellow-400 font-black text-sm mb-2 relative">بطل كأس العالم 2026</p>
                <p className="text-[80px] relative">{champion.flag}</p>
                <p className="text-white font-black text-2xl relative">{champion.name}</p>
                {champion.stars > 0 && (
                  <p className="text-yellow-400 text-xl mt-1 relative">{'⭐'.repeat(Math.min(champion.stars, 5))}</p>
                )}
                <p className="text-gray-400 text-xs mt-3 relative">وفق محاكي KoraX</p>
              </div>
            )}

            {/* Round of 32 */}
            <BracketRound
              title="دور الـ32"
              subtitle={`${r32Done}/16 مباراة`}
              matches={r32Matches}
              winners={bracketPicks.r32 || []}
              onPick={(idx, team) => pickBracket('r32', idx, team)}
            />

            {/* Round of 16 */}
            {(bracketPicks.r32 || []).filter(Boolean).length > 0 && (
              <BracketRound
                title="دور الـ16"
                matches={buildRound(bracketPicks.r32?.filter(Boolean) || [])}
                winners={bracketPicks.r16 || []}
                onPick={(idx, team) => pickBracket('r16', idx, team)}
              />
            )}

            {/* Quarter Finals */}
            {(bracketPicks.r16 || []).filter(Boolean).length > 0 && (
              <BracketRound
                title="ربع النهائي"
                matches={buildRound(bracketPicks.r16?.filter(Boolean) || [])}
                winners={bracketPicks.qf || []}
                onPick={(idx, team) => pickBracket('qf', idx, team)}
              />
            )}

            {/* Semi Finals */}
            {(bracketPicks.qf || []).filter(Boolean).length > 0 && (
              <BracketRound
                title="نصف النهائي"
                matches={buildRound(bracketPicks.qf?.filter(Boolean) || [])}
                winners={bracketPicks.sf || []}
                onPick={(idx, team) => pickBracket('sf', idx, team)}
              />
            )}

            {/* Final */}
            {(bracketPicks.sf || []).filter(Boolean).length === 2 && (
              <div className="card overflow-hidden border-gold/40">
                <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-gold/5">
                  <span className="text-gold text-lg">🏆</span>
                  <span className="font-black text-text">النهائي الكبير</span>
                </div>
                <div className="p-4">
                  <MatchPick
                    home={bracketPicks.sf[0]}
                    away={bracketPicks.sf[1]}
                    winner={bracketPicks.final}
                    onPick={(team) => pickBracket('final', 0, team)}
                    isGold
                  />
                </div>
              </div>
            )}

            {/* Reset */}
            <button
              onClick={resetAll}
              className="w-full py-3 rounded-2xl bg-card border border-border text-muted text-sm font-bold active:scale-95 transition-transform"
            >
              🔄 إعادة البدء من الصفر
            </button>

          </div>
        )}

      </div>

      {/* Confetti */}
      {confetti && <ConfettiEffect />}

      <BottomNav />
    </div>
  )
}

// ─── Bracket Round Component ──────────────────────────────────────────────────
function BracketRound({ title, subtitle, matches, winners, onPick }) {
  if (!matches || matches.length === 0) return null

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-card-hover">
        <span className="font-black text-text text-sm">{title}</span>
        {subtitle && <span className="text-[10px] text-muted">{subtitle}</span>}
      </div>
      <div className="p-3 space-y-2">
        {matches.map((match, idx) => (
          <MatchPick
            key={idx}
            home={match.home}
            away={match.away}
            winner={winners[idx]}
            onPick={(team) => onPick(idx, team)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Match Pick Component ─────────────────────────────────────────────────────
function MatchPick({ home, away, winner, onPick, isGold }) {
  if (!home || !away) {
    return (
      <div className="flex items-center justify-center py-3 text-muted text-xs">
        في انتظار نتائج الدور السابق...
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Home */}
      <button
        onClick={() => onPick(home)}
        className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 transition-all active:scale-95 ${
          winner?.id === home.id
            ? isGold
              ? 'bg-gold/10 border-gold'
              : 'bg-primary/10 border-primary'
            : winner
              ? 'opacity-40 bg-card border-border'
              : 'bg-card border-border hover:border-primary/50'
        }`}
      >
        <span className="text-2xl">{home.flag}</span>
        <span className="text-[10px] font-bold text-text text-center leading-tight">{home.name}</span>
        {winner?.id === home.id && (
          <span className={`text-[9px] font-black ${isGold ? 'text-gold' : 'text-primary'}`}>✓ فائز</span>
        )}
      </button>

      {/* VS */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[10px] font-black text-muted">VS</span>
        {!winner && (
          <span className="text-[8px] text-muted">اختر</span>
        )}
      </div>

      {/* Away */}
      <button
        onClick={() => onPick(away)}
        className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 transition-all active:scale-95 ${
          winner?.id === away.id
            ? isGold
              ? 'bg-gold/10 border-gold'
              : 'bg-primary/10 border-primary'
            : winner
              ? 'opacity-40 bg-card border-border'
              : 'bg-card border-border hover:border-primary/50'
        }`}
      >
        <span className="text-2xl">{away.flag}</span>
        <span className="text-[10px] font-bold text-text text-center leading-tight">{away.name}</span>
        {winner?.id === away.id && (
          <span className={`text-[9px] font-black ${isGold ? 'text-gold' : 'text-primary'}`}>✓ فائز</span>
        )}
      </button>
    </div>
  )
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
function ConfettiEffect() {
  const PIECES = Array.from({ length: 50 }, (_, i) => ({
    id:    i,
    left:  Math.random() * 100,
    delay: Math.random() * 3,
    dur:   2 + Math.random() * 3,
    color: ['#F59E0B','#3B82F6','#10B981','#EF4444','#8B5CF6'][Math.floor(Math.random() * 5)],
    size:  6 + Math.random() * 10,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {PIECES.map(p => (
        <div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left:      `${p.left}%`,
            top:       '-20px',
            width:     p.size,
            height:    p.size,
            background: p.color,
            animation: `confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0%   { transform: translateY(0)    rotate(0deg);   opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
