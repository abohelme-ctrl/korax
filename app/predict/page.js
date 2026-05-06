'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

// ─── جميع المنتخبات الـ 48 ────────────────────────────────────────────────────
const ALL_TEAMS = [
  { id: '16',   name: 'المكسيك',             flag: '🇲🇽', stars: 0, group: 'A' },
  { id: '1531', name: 'جنوب أفريقيا',        flag: '🇿🇦', stars: 0, group: 'A' },
  { id: '149',  name: 'كوريا الجنوبية',      flag: '🇰🇷', stars: 0, group: 'A' },
  { id: '798',  name: 'التشيك',               flag: '🇨🇿', stars: 0, group: 'A' },
  { id: '101',  name: 'كندا',                 flag: '🇨🇦', stars: 0, group: 'B' },
  { id: '776',  name: 'البوسنة والهرسك',     flag: '🇧🇦', stars: 0, group: 'B' },
  { id: '164',  name: 'قطر',                  flag: '🇶🇦', stars: 0, group: 'B' },
  { id: '15',   name: 'سويسرا',               flag: '🇨🇭', stars: 0, group: 'B' },
  { id: '6',    name: 'البرازيل',             flag: '🇧🇷', stars: 5, group: 'C' },
  { id: '32',   name: 'المغرب',               flag: '🇲🇦', stars: 0, group: 'C' },
  { id: '507',  name: 'هايتي',                flag: '🇭🇹', stars: 0, group: 'C' },
  { id: '1108', name: 'اسكتلندا',             flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', stars: 0, group: 'C' },
  { id: '2',    name: 'الولايات المتحدة',    flag: '🇺🇸', stars: 0, group: 'D' },
  { id: '779',  name: 'باراغواي',             flag: '🇵🇾', stars: 0, group: 'D' },
  { id: '25',   name: 'أستراليا',             flag: '🇦🇺', stars: 0, group: 'D' },
  { id: '741',  name: 'تركيا',                flag: '🇹🇷', stars: 0, group: 'D' },
  { id: '3',    name: 'ألمانيا',              flag: '🇩🇪', stars: 4, group: 'E' },
  { id: '1532', name: 'كوراساو',              flag: '🇨🇼', stars: 0, group: 'E' },
  { id: '31',   name: 'ساحل العاج',           flag: '🇨🇮', stars: 0, group: 'E' },
  { id: '57',   name: 'الإكوادور',            flag: '🇪🇨', stars: 0, group: 'E' },
  { id: '1',    name: 'هولندا',               flag: '🇳🇱', stars: 0, group: 'F' },
  { id: '2601', name: 'اليابان',              flag: '🇯🇵', stars: 0, group: 'F' },
  { id: '744',  name: 'السويد',               flag: '🇸🇪', stars: 0, group: 'F' },
  { id: '4601', name: 'تونس',                 flag: '🇹🇳', stars: 0, group: 'F' },
  { id: '4',    name: 'بلجيكا',              flag: '🇧🇪', stars: 0, group: 'G' },
  { id: '36',   name: 'مصر',                  flag: '🇪🇬', stars: 0, group: 'G' },
  { id: '66',   name: 'إيران',                flag: '🇮🇷', stars: 0, group: 'G' },
  { id: '1537', name: 'نيوزيلندا',            flag: '🇳🇿', stars: 0, group: 'G' },
  { id: '9',    name: 'إسبانيا',              flag: '🇪🇸', stars: 1, group: 'H' },
  { id: '1533', name: 'الرأس الأخضر',         flag: '🇨🇻', stars: 0, group: 'H' },
  { id: '141',  name: 'السعودية',             flag: '🇸🇦', stars: 0, group: 'H' },
  { id: '13',   name: 'أوروغواي',             flag: '🇺🇾', stars: 2, group: 'H' },
  { id: '2',    name: 'فرنسا',               flag: '🇫🇷', stars: 2, group: 'I' },
  { id: '33',   name: 'السنغال',              flag: '🇸🇳', stars: 0, group: 'I' },
  { id: '796',  name: 'العراق',               flag: '🇮🇶', stars: 0, group: 'I' },
  { id: '755',  name: 'النرويج',              flag: '🇳🇴', stars: 0, group: 'I' },
  { id: '26',   name: 'الأرجنتين',            flag: '🇦🇷', stars: 3, group: 'J' },
  { id: '46',   name: 'الجزائر',              flag: '🇩🇿', stars: 0, group: 'J' },
  { id: '775',  name: 'النمسا',               flag: '🇦🇹', stars: 0, group: 'J' },
  { id: '765',  name: 'الأردن',               flag: '🇯🇴', stars: 0, group: 'J' },
  { id: '27',   name: 'البرتغال',             flag: '🇵🇹', stars: 0, group: 'K' },
  { id: '56',   name: 'كولومبيا',             flag: '🇨🇴', stars: 0, group: 'K' },
  { id: '1534', name: 'أوزبكستان',            flag: '🇺🇿', stars: 0, group: 'K' },
  { id: '1535', name: 'الكونغو',              flag: '🇨🇩', stars: 0, group: 'K' },
  { id: '10',   name: 'إنجلترا',              flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', stars: 1, group: 'L' },
  { id: '3001', name: 'كرواتيا',              flag: '🇭🇷', stars: 0, group: 'L' },
  { id: '14',   name: 'غانا',                 flag: '🇬🇭', stars: 0, group: 'L' },
  { id: '1536', name: 'بنما',                 flag: '🇵🇦', stars: 0, group: 'L' },
]

const AWARDS = [
  { id: 'champion',   label: 'بطل كأس العالم 2026',  icon: '🏆', desc: 'من ستتوج بطلة؟',          type: 'team',   color: 'text-gold   border-gold/40   bg-gold/5'   },
  { id: 'finalist',   label: 'الوصيف',               icon: '🥈', desc: 'من يصل للنهائي ويخسره؟',  type: 'team',   color: 'text-muted  border-border    bg-card'      },
  { id: 'surprise',   label: 'منتخب المفاجأة',       icon: '⚡', desc: 'من يصنع المفاجأة الكبرى؟', type: 'team',   color: 'text-purple-400 border-purple-400/30 bg-purple-400/5' },
  { id: 'topScorer',  label: 'هداف البطولة',          icon: '👟', desc: 'من سيحمل الحذاء الذهبي؟', type: 'player', color: 'text-green-400  border-green-400/30  bg-green-400/5'  },
  { id: 'bestPlayer', label: 'أفضل لاعب',             icon: '⭐', desc: 'من سيحمل الكرة الذهبية؟', type: 'player', color: 'text-primary border-primary/30  bg-primary/5' },
]

const LS_KEY = 'korax_award_picks'

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
export default function PredictPage() {
  const [picks, setPicks]           = useState({})
  const [modal, setModal]           = useState(null)   // award.id | null
  const [search, setSearch]         = useState('')
  const [toast, setToast]           = useState('')
  const [showCard, setShowCard]     = useState(false)
  const cardRef                     = useRef(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || '{}')
      setPicks(saved)
    } catch {}
  }, [])

  function savePick(awardId, value) {
    const next = { ...picks, [awardId]: value }
    setPicks(next)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
    setModal(null)
    setSearch('')
    showToast('تم الحفظ ✓')
  }

  function removePick(awardId) {
    const next = { ...picks }
    delete next[awardId]
    setPicks(next)
    localStorage.setItem(LS_KEY, JSON.stringify(next))
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2000)
  }

  async function handleShare() {
    const champion = picks.champion
    const finalist = picks.finalist
    const surprise = picks.surprise
    const scorer   = picks.topScorer
    const best     = picks.bestPlayer

    let lines = ['🏆 توقعاتي لكأس العالم 2026:\n']
    if (champion)  lines.push(`🥇 البطل: ${champion.flag} ${champion.name}`)
    if (finalist)  lines.push(`🥈 الوصيف: ${finalist.flag} ${finalist.name}`)
    if (surprise)  lines.push(`⚡ المفاجأة: ${surprise.flag} ${surprise.name}`)
    if (scorer)    lines.push(`👟 الهداف: ${scorer}`)
    if (best)      lines.push(`⭐ أفضل لاعب: ${best}`)
    lines.push('\nوأنت؟ شارك توقعاتك 👇\nkorax.live')

    const text = lines.join('\n')

    if (navigator.share) {
      try {
        await navigator.share({ title: 'KoraX · توقعاتي', text, url: 'https://korax.live' })
      } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      showToast('تم نسخ التوقعات ✓')
    }
  }

  const donePicks  = AWARDS.filter(a => picks[a.id])
  const totalDone  = donePicks.length
  const progress   = Math.round((totalDone / AWARDS.length) * 100)

  const activeAward = AWARDS.find(a => a.id === modal)
  const teamSearch  = search.trim().toLowerCase()
  const filteredTeams = teamSearch
    ? ALL_TEAMS.filter(t => t.name.includes(search.trim()))
    : ALL_TEAMS

  return (
    <div>
      <Header title="توقعاتي الكبرى" back />

      <div className="page-content pb-24">

        {/* ─── Progress bar ─── */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-bold text-text">اكتمال التوقعات</span>
            <span className="text-primary font-black">{totalDone}/{AWARDS.length}</span>
          </div>
          <div className="h-2 bg-card rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-gold rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ─── Award Cards ─── */}
        <div className="px-4 pt-2 space-y-3">
          {AWARDS.map(award => {
            const pick = picks[award.id]
            return (
              <div key={award.id} className={`card border-2 ${award.color} overflow-hidden`}>
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{award.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-text">{award.label}</p>
                      <p className="text-[11px] text-muted">{award.desc}</p>
                    </div>
                    {pick && (
                      <button
                        onClick={() => removePick(award.id)}
                        className="text-muted text-xs active:scale-95 transition-transform p-1"
                      >✕</button>
                    )}
                  </div>

                  {pick ? (
                    /* اختيار محفوظ */
                    <button
                      onClick={() => { setModal(award.id); setSearch('') }}
                      className="mt-3 flex items-center gap-3 w-full bg-bg/60 rounded-xl p-3 active:scale-95 transition-transform"
                    >
                      {award.type === 'team' ? (
                        <>
                          <span className="text-3xl">{pick.flag}</span>
                          <div className="text-right flex-1">
                            <p className="font-black text-base text-text">{pick.name}</p>
                            <p className="text-[10px] text-muted">المجموعة {pick.group} {pick.stars > 0 ? '· ' + '⭐'.repeat(pick.stars) : ''}</p>
                          </div>
                          <span className="text-muted text-xs">تغيير</span>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl">✏️</span>
                          <p className="font-bold text-text flex-1 text-right">{pick}</p>
                          <span className="text-muted text-xs">تغيير</span>
                        </>
                      )}
                    </button>
                  ) : (
                    /* زر الاختيار */
                    <button
                      onClick={() => { setModal(award.id); setSearch('') }}
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

        {/* ─── Share Card Preview ─── */}
        {totalDone > 0 && (
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
                <ShareCard picks={picks} ref={cardRef} />
                <p className="text-center text-[10px] text-muted mt-2">
                  اضغط زر المشاركة أو صوّر الشاشة وأرسل لأصدقائك
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─── Share Button ─── */}
        {totalDone > 0 && (
          <div className="px-4 mt-4">
            <button
              onClick={handleShare}
              className="w-full py-4 rounded-2xl bg-primary text-white font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary/30"
            >
              <span>📤</span>
              <span>شارك توقعاتي مع الأصدقاء</span>
            </button>
          </div>
        )}

        {/* ─── Link to Simulator ─── */}
        <div className="mx-4 mt-4">
          <Link
            href="/simulator"
            className="flex items-center gap-3 card p-4 border-border active:border-primary transition-colors"
          >
            <span className="text-3xl">🏟️</span>
            <div className="flex-1">
              <p className="font-black text-sm text-text">محاكي البطولة</p>
              <p className="text-[11px] text-muted">جهّز البطولة كاملة من المجموعات حتى النهائي</p>
            </div>
            <span className="text-primary text-lg">←</span>
          </Link>
        </div>

      </div>

      {/* ─── Toast ─── */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-card border border-border px-4 py-2 rounded-full text-sm font-bold text-text shadow-xl z-50 animate-fade-in">
          {toast}
        </div>
      )}

      {/* ─── Modal: Team Picker ─── */}
      {modal && activeAward?.type === 'team' && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => { setModal(null); setSearch('') }} />
          <div className="bg-bg rounded-t-3xl max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
              <p className="font-black text-text">
                {activeAward.icon} {activeAward.label}
              </p>
              <button onClick={() => { setModal(null); setSearch('') }} className="text-muted">✕</button>
            </div>
            {/* Search */}
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
            {/* Teams grid */}
            <div className="overflow-y-auto px-4 pb-6">
              <div className="grid grid-cols-3 gap-2 pt-2">
                {filteredTeams.map(team => (
                  <button
                    key={`${team.id}-${team.group}`}
                    onClick={() => savePick(modal, team)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all active:scale-95 ${
                      picks[modal]?.name === team.name
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
      {modal && activeAward?.type === 'player' && (
        <PlayerInputModal
          award={activeAward}
          current={picks[modal] || ''}
          onSave={val => savePick(modal, val)}
          onClose={() => { setModal(null); setSearch('') }}
        />
      )}

      <BottomNav />
    </div>
  )
}

// ─── بطاقة المشاركة ───────────────────────────────────────────────────────────
import { forwardRef } from 'react'

const ShareCard = forwardRef(function ShareCard({ picks }, ref) {
  const champion = picks.champion
  const finalist = picks.finalist
  const surprise = picks.surprise
  const scorer   = picks.topScorer
  const best     = picks.bestPlayer

  return (
    <div
      ref={ref}
      className="relative rounded-3xl overflow-hidden mx-auto"
      style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #0F2240 50%, #1A1040 100%)',
        maxWidth: 380,
        boxShadow: '0 0 40px rgba(59,130,246,0.3)',
      }}
    >
      {/* Glow circles */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle, #3B82F6, transparent)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full opacity-15"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)', transform: 'translate(-30%, 30%)' }} />

      {/* Top gold line */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)' }} />

      <div className="px-6 py-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-black text-blue-300 tracking-widest">KORAX.LIVE</span>
          <span className="text-[11px] text-blue-300/70">كأس العالم 2026</span>
        </div>

        <p className="text-white font-black text-lg text-center mb-4">توقعاتي الكبرى 🏆</p>

        {/* Champion — الأبرز */}
        {champion && (
          <div className="flex flex-col items-center mb-4 py-4 rounded-2xl"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <span className="text-[10px] text-yellow-400 font-bold mb-1">🏆 بطل البطولة</span>
            <span className="text-6xl mb-1">{champion.flag}</span>
            <span className="text-white font-black text-xl">{champion.name}</span>
            {champion.stars > 0 && (
              <span className="text-yellow-400 text-xs mt-0.5">{'⭐'.repeat(Math.min(champion.stars, 5))}</span>
            )}
          </div>
        )}

        {/* Secondary picks */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {finalist && (
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <p className="text-[9px] text-gray-400 mb-1">🥈 الوصيف</p>
              <span className="text-2xl">{finalist.flag}</span>
              <p className="text-white text-[11px] font-bold mt-0.5">{finalist.name}</p>
            </div>
          )}
          {surprise && (
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(167,139,250,0.1)' }}>
              <p className="text-[9px] text-purple-300 mb-1">⚡ المفاجأة</p>
              <span className="text-2xl">{surprise.flag}</span>
              <p className="text-white text-[11px] font-bold mt-0.5">{surprise.name}</p>
            </div>
          )}
          {scorer && (
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(52,211,153,0.08)' }}>
              <p className="text-[9px] text-green-400 mb-1">👟 الهداف</p>
              <p className="text-white text-[11px] font-bold">{scorer}</p>
            </div>
          )}
          {best && (
            <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(59,130,246,0.08)' }}>
              <p className="text-[9px] text-blue-400 mb-1">⭐ أفضل لاعب</p>
              <p className="text-white text-[11px] font-bold">{best}</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-[11px] text-blue-300/80">وأنت؟ شاركني توقعاتك 👇</p>
          <p className="text-[13px] font-black text-white mt-0.5">korax.live</p>
        </div>
      </div>

      {/* Bottom gold line */}
      <div className="h-1" style={{ background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)' }} />
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
