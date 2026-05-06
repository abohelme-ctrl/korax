'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import MatchCard from '@/components/match/MatchCard'
import Onboarding from '@/components/Onboarding'
import { fetchTodayMatches, fetchAllFixtures, INTERVAL_LIVE, INTERVAL_IDLE } from '@/lib/api-football'

// كأس العالم 2026 يبدأ 11 يونيو 2026 الساعة 22:00 بتوقيت السعودية
const WC_START = new Date('2026-06-11T19:00:00Z')

// أول 14 مباراة — الجولة الأولى من دور المجموعات
const FIRST_MATCHES = [
  { id: 1489369, date: 'الخميس 11 يونيو',  time: '10:00 م', home: 'المكسيك',          homeFlag: '🇲🇽', away: 'جنوب أفريقيا',   awayFlag: '🇿🇦', city: 'مكسيكو سيتي' },
  { id: 1538999, date: 'الجمعة 12 يونيو',  time: '05:00 ص', home: 'كوريا الجنوبية',   homeFlag: '🇰🇷', away: 'التشيك',          awayFlag: '🇨🇿', city: 'زاپوپان'      },
  { id: 1539000, date: 'الجمعة 12 يونيو',  time: '10:00 م', home: 'كندا',              homeFlag: '🇨🇦', away: 'البوسنة والهرسك', awayFlag: '🇧🇦', city: 'كندا'         },
  { id: 1489370, date: 'السبت 13 يونيو',   time: '04:00 ص', home: 'الولايات المتحدة', homeFlag: '🇺🇸', away: 'باراغواي',        awayFlag: '🇵🇾', city: 'أمريكا'       },
  { id: 1489373, date: 'السبت 13 يونيو',   time: '10:00 م', home: 'قطر',               homeFlag: '🇶🇦', away: 'سويسرا',          awayFlag: '🇨🇭', city: 'أمريكا'       },
  { id: 1489371, date: 'الأحد 14 يونيو',   time: '01:00 ص', home: 'البرازيل',          homeFlag: '🇧🇷', away: 'المغرب',          awayFlag: '🇲🇦', city: 'أمريكا'       },
  { id: 1489372, date: 'الأحد 14 يونيو',   time: '04:00 ص', home: 'هايتي',             homeFlag: '🇭🇹', away: 'اسكتلندا',        awayFlag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', city: 'أمريكا'       },
  { id: 1539001, date: 'الأحد 14 يونيو',   time: '07:00 ص', home: 'أستراليا',          homeFlag: '🇦🇺', away: 'تركيا',           awayFlag: '🇹🇷', city: 'أمريكا'       },
  { id: 1489374, date: 'الأحد 14 يونيو',   time: '08:00 م', home: 'ألمانيا',           homeFlag: '🇩🇪', away: 'كوراساو',         awayFlag: '🇨🇼', city: 'أمريكا'       },
  { id: 1489376, date: 'الأحد 14 يونيو',   time: '11:00 م', home: 'هولندا',            homeFlag: '🇳🇱', away: 'اليابان',         awayFlag: '🇯🇵', city: 'أمريكا'       },
  { id: 1489375, date: 'الأحد 14 يونيو',   time: '02:00 ص', home: 'ساحل العاج',        homeFlag: '🇨🇮', away: 'الإكوادور',       awayFlag: '🇪🇨', city: 'أمريكا'       },
  { id: 1539002, date: 'الاثنين 15 يونيو', time: '05:00 ص', home: 'السويد',             homeFlag: '🇸🇪', away: 'تونس',            awayFlag: '🇹🇳', city: 'أمريكا'       },
  { id: 1489380, date: 'الاثنين 15 يونيو', time: '07:00 م', home: 'إسبانيا',           homeFlag: '🇪🇸', away: 'الرأس الأخضر',   awayFlag: '🇨🇻', city: 'أمريكا'       },
  { id: 1489377, date: 'الاثنين 15 يونيو', time: '10:00 م', home: 'بلجيكا',            homeFlag: '🇧🇪', away: 'مصر',             awayFlag: '🇪🇬', city: 'أمريكا'       },
]

const TABS = [
  { id: 'all',      label: 'الكل'     },
  { id: 'LIVE',     label: 'مباشر'    },
  { id: 'UPCOMING', label: 'القادمة'  },
  { id: 'FINISHED', label: 'المنتهية' },
]

export default function HomePage() {
  const [matches, setMatches]         = useState([])
  const [allFixtures, setAllFixtures] = useState(FIRST_MATCHES)
  const [activeTab, setActiveTab]     = useState('all')
  const [loading, setLoading]         = useState(true)
  const [loadingAll, setLoadingAll]   = useState(false)
  const [countdown, setCountdown]     = useState(null)

  // Countdown timer — يبدأ فقط في المتصفح لتجنب hydration mismatch
  useEffect(() => {
    setCountdown(calcCountdown())
    const timer = setInterval(() => setCountdown(calcCountdown()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetchTodayMatches()
      .then(setMatches)
      .finally(() => setLoading(false))
  }, [])

  // قبل البطولة: جلب كل المباريات المجدولة
  useEffect(() => {
    if (countdown !== null && countdown.total > 0) {
      setLoadingAll(true)
      fetchAllFixtures()
        .then(fixtures => {
          if (fixtures && fixtures.length > 0) setAllFixtures(fixtures)
        })
        .catch(() => {})
        .finally(() => setLoadingAll(false))
    }
  }, [countdown !== null])

  // Smart refresh: 10s live / 5min idle
  useEffect(() => {
    let timeoutId
    function scheduleNext(current) {
      const hasLive = current.some(m => m.status === 'LIVE')
      const delay   = hasLive ? INTERVAL_LIVE : INTERVAL_IDLE
      timeoutId = setTimeout(async () => {
        const updated = await fetchTodayMatches()
        setMatches(updated)
        scheduleNext(updated)
      }, delay)
    }
    scheduleNext(matches)
    return () => clearTimeout(timeoutId)
  }, [matches])

  const filtered   = activeTab === 'all' ? matches : matches.filter(m => m.status === activeTab)
  const liveCount  = matches.filter(m => m.status === 'LIVE').length
  const started    = countdown ? countdown.total <= 0 : false

  return (
    <div>
      <Onboarding />
      <Header title="KoraX" />

      <div className="page-content">

        {/* ── Countdown Hero ── */}
        {!started && countdown && <CountdownHero countdown={countdown} />}

        {/* ── Quick Feature Cards ── */}
        <div className="px-4 pt-3 pb-1 grid grid-cols-2 gap-2">
          <Link href="/predict"
            className="card p-3 flex items-center gap-2.5 border-gold/30 bg-gold/5 active:scale-95 transition-transform">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-xs font-black text-text">توقعاتي الكبرى</p>
              <p className="text-[10px] text-muted">من سيتوج؟ الهداف؟</p>
            </div>
          </Link>
          <Link href="/simulator"
            className="card p-3 flex items-center gap-2.5 border-primary/30 bg-primary/5 active:scale-95 transition-transform">
            <span className="text-2xl">🏟️</span>
            <div>
              <p className="text-xs font-black text-text">محاكي البطولة</p>
              <p className="text-[10px] text-muted">جهّز الكأس بنفسك</p>
            </div>
          </Link>
        </div>

        {/* ── Today's matches or schedule ── */}
        {!started && loadingAll && (
          <div className="flex items-center justify-center py-4 gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-muted">جاري تحميل الجدول...</span>
          </div>
        )}
        {started ? (
          <>
            {/* Tab bar */}
            <div className="tab-bar pt-2 pb-3">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
                >
                  {tab.label}
                  {tab.id === 'LIVE' && liveCount > 0 && (
                    <span className="mr-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-live text-white text-[9px] font-black">
                      {liveCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="px-4 space-y-3 pb-4">
              {loading ? <LoadingSkeleton /> : filtered.length === 0 ? (
                <EmptyState tab={activeTab} />
              ) : (
                filtered.map(m => <MatchCard key={m.id} match={m} />)
              )}
            </div>
          </>
        ) : (
          /* Schedule before tournament starts */
          <SchedulePreview matches={allFixtures} />
        )}

      </div>

      {/* Footer — مطلوب من Google للتحقق */}
      <footer className="px-4 py-6 text-center border-t border-border mt-4">
        <p className="text-xs font-black text-primary mb-2">KoraX — كأس العالم 2026</p>
        <p className="text-[10px] text-muted mb-3">توقع نتائج المباريات وتنافس مع أصدقائك · Play · Predict · Win</p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/privacy" className="text-[10px] text-muted underline">سياسة الخصوصية</Link>
          <Link href="/terms"   className="text-[10px] text-muted underline">شروط الاستخدام</Link>
        </div>
      </footer>

      <BottomNav />
    </div>
  )
}

// ─── Countdown calculation ─────────────────────────────────────────────────────

function calcCountdown() {
  const total   = WC_START - Date.now()
  if (total <= 0) return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 }
  const days    = Math.floor(total / (1000 * 60 * 60 * 24))
  const hours   = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((total % (1000 * 60)) / 1000)
  return { total, days, hours, minutes, seconds }
}

// ─── Countdown Hero ────────────────────────────────────────────────────────────

function CountdownHero({ countdown }) {
  const { days, hours, minutes, seconds } = countdown

  return (
    <div className="relative mx-4 mt-4 mb-5 rounded-3xl overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#0d2137] to-[#0a1628]" />

      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-green/10 blur-2xl" />

      {/* Hex pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <div className="relative p-5">

        {/* Trophy + title */}
        <div className="flex items-center justify-center gap-3 mb-1">
          <span className="text-3xl">🏆</span>
          <div className="text-center">
            <p className="text-xs font-bold text-primary uppercase tracking-widest">FIFA</p>
            <p className="text-lg font-black text-white leading-tight">كأس العالم 2026</p>
          </div>
          <span className="text-3xl">⚽</span>
        </div>

        {/* Host flags */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xl">🇨🇦</span>
          <span className="text-[10px] text-muted font-medium">كندا · المكسيك · أمريكا</span>
          <span className="text-xl">🇲🇽</span>
          <span className="text-xl">🇺🇸</span>
        </div>

        {/* Countdown boxes */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <CountBox value={days}    label="يوم"    highlight />
          <Colon />
          <CountBox value={hours}   label="ساعة"   />
          <Colon />
          <CountBox value={minutes} label="دقيقة"  />
          <Colon />
          <CountBox value={seconds} label="ثانية"  pulse />
        </div>

        {/* Start date */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-px flex-1 bg-white/10" />
          <p className="text-xs text-muted font-medium px-2">الانطلاق: الخميس 11 يونيو 2026</p>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Stats */}
        <div className="flex justify-around mt-3 pt-3 border-t border-white/10">
          <TournamentStat value="48"  label="منتخب"   />
          <TournamentStat value="12"  label="مجموعة"  />
          <TournamentStat value="104" label="مباراة"  />
          <TournamentStat value="16"  label="ملعب"    />
        </div>
      </div>
    </div>
  )
}

function CountBox({ value, label, highlight, pulse }) {
  return (
    <div className={`flex flex-col items-center rounded-2xl px-3 py-2 min-w-[60px] ${
      highlight
        ? 'bg-primary shadow-lg shadow-primary/40'
        : 'bg-white/8 border border-white/10'
    }`}>
      <span className={`text-3xl font-black tabular-nums text-white ${pulse ? 'animate-pulse' : ''}`}>
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-[9px] text-white/60 font-medium mt-0.5">{label}</span>
    </div>
  )
}

function Colon() {
  return <span className="text-2xl font-black text-white/40 mb-3">:</span>
}

function TournamentStat({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-base font-black text-white">{value}</span>
      <span className="text-[9px] text-muted">{label}</span>
    </div>
  )
}

// ─── Schedule Preview ──────────────────────────────────────────────────────────

function SchedulePreview({ matches }) {
  const [activeRound, setActiveRound] = useState(null)

  // استخراج الجولات المتاحة
  const rounds = [...new Set(matches.map(m => m.group || m.groupEn || 'الجولة الأولى'))].filter(Boolean)

  const filtered = activeRound
    ? matches.filter(m => (m.group || m.groupEn) === activeRound)
    : matches

  // تجميع حسب التاريخ
  const grouped = filtered.reduce((acc, m) => {
    const dateKey = m.date || (m.startTime
      ? new Date(m.startTime).toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' })
      : 'غير محدد')
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(m)
    return acc
  }, {})

  return (
    <div className="pb-4">
      {/* Round filter */}
      {rounds.length > 1 && (
        <div className="tab-bar mb-4">
          <button
            onClick={() => setActiveRound(null)}
            className={`tab-item ${!activeRound ? 'active' : ''}`}
          >
            الكل ({matches.length})
          </button>
          {rounds.map(r => (
            <button
              key={r}
              onClick={() => setActiveRound(r)}
              className={`tab-item ${activeRound === r ? 'active' : ''}`}
            >
              {r}
            </button>
          ))}
        </div>
      )}

      <div className="px-4 space-y-3">
        {Object.entries(grouped).map(([date, dayMatches]) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                {date}
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-2">
              {dayMatches.map((m, i) => (
                <ScheduleMatchRow key={i} match={m} />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted">
            <span className="text-4xl block mb-2">📅</span>
            <p className="text-sm">لا توجد مباريات في هذه الجولة</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ScheduleMatchRow({ match }) {
  // دعم بنية API (homeTeam/awayTeam) و hardcoded (home/away)
  const homeName = match.homeTeam?.name || match.home || ''
  const awayName = match.awayTeam?.name || match.away || ''
  const homeFlag = match.homeTeam?.flag || match.homeFlag || '🏳️'
  const awayFlag = match.awayTeam?.flag || match.awayFlag || '🏳️'
  const city     = match.city || match.homeTeam?.city || ''
  const timeStr  = match.time || (match.startTime
    ? new Date(match.startTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    : '')

  return (
    <div className="card p-3">
      <div className="flex items-center gap-3">

        {/* Time */}
        <div className="flex flex-col items-center min-w-[44px]">
          <span className="text-xs font-black text-primary">{timeStr}</span>
          <span className="text-[9px] text-muted">KSA</span>
        </div>

        <div className="w-px h-8 bg-border" />

        {/* Home */}
        <div className="flex flex-col items-center gap-0.5 flex-1">
          <span className="text-2xl">{homeFlag}</span>
          <span className="text-[10px] font-bold text-text text-center leading-tight">{homeName}</span>
        </div>

        {/* VS */}
        <div className="flex flex-col items-center gap-0.5 px-1">
          <span className="text-xs font-black text-muted">VS</span>
          <span className="text-[8px] text-muted/60">{city}</span>
        </div>

        {/* Away */}
        <div className="flex flex-col items-center gap-0.5 flex-1">
          <span className="text-2xl">{awayFlag}</span>
          <span className="text-[10px] font-bold text-text text-center leading-tight">{awayName}</span>
        </div>
      </div>

      {/* زر التوقع */}
      <div className="mt-2.5 pt-2.5 border-t border-border flex gap-2">
        {match.id ? (
          <>
            <Link
              href={`/match/${match.id}`}
              className="flex items-center justify-center gap-1 flex-1 py-2 rounded-xl bg-card-hover border border-border text-muted-light text-xs font-bold active:scale-95 transition-transform"
            >
              📋 التفاصيل
            </Link>
            <Link
              href={`/predict/${match.id}`}
              className="flex items-center justify-center gap-1 flex-1 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold active:scale-95 transition-transform"
            >
              ⚽ توقع
            </Link>
          </>
        ) : (
          <span className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold">
            ⚽ التوقع يفتح قريباً
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Loading / Empty ───────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map(i => (
        <div key={i} className="card h-36 animate-pulse">
          <div className="h-full bg-card-hover rounded-2xl" />
        </div>
      ))}
    </>
  )
}

function EmptyState({ tab }) {
  const msgs = {
    LIVE:     'لا توجد مباريات مباشرة الآن',
    UPCOMING: 'لا توجد مباريات قادمة اليوم',
    FINISHED: 'لا توجد مباريات منتهية',
    all:      'لا توجد مباريات اليوم',
  }
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-muted">
      <span className="text-5xl">⚽</span>
      <p className="text-sm font-medium">{msgs[tab] || msgs.all}</p>
    </div>
  )
}
