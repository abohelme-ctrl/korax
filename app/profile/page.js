'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { useAuth } from '@/lib/useAuth'
import { getRandomPlayer, rarityFromPoints, saveCardToStorage } from '@/lib/players'
import { useTheme } from '@/lib/useTheme'
import { getScoreBreakdown, getRankTitle } from '@/lib/scoring'

export default function ProfilePage() {
  const { user, strapiId, strapiToken, isLoading, isLoggedIn, logout } = useAuth()
  const [tab, setTab]           = useState('history')
  const [predictions, setPredictions] = useState([])
  const [loadingData, setLoadingData] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) return
    setLoadingData(true)
    fetch('/api/predictions')
      .then(r => r.json())
      .then(data => setPredictions(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoadingData(false))
  }, [isLoggedIn])

  // حساب الإحصائيات
  const calculated    = predictions.filter(p => p.status === 'calculated' || p.attributes?.status === 'calculated')
  const matchPoints   = calculated.reduce((s, p) => s + (p.points ?? p.attributes?.points ?? 0), 0)
  const correctExact  = calculated.filter(p => (p.points ?? p.attributes?.points) === 3).length
  const correctWinner = calculated.filter(p => (p.points ?? p.attributes?.points) === 1).length
  const breakdown     = getScoreBreakdown(predictions)
  const totalPoints   = breakdown.total
  const rankInfo      = getRankTitle(totalPoints)
  const maxPoints     = Math.max(totalPoints + 50, 100)
  const progress      = Math.min((totalPoints / maxPoints) * 100, 100)

  // حرف اسم المستخدم
  const initials = user?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || '؟'

  // غير مسجّل دخول
  if (!isLoading && !isLoggedIn) {
    return (
      <div>
        <Header title="حسابي" notif={false} />
        <div className="page-content flex flex-col items-center justify-center px-6 py-16">
          <div className="w-24 h-24 rounded-3xl bg-primary/20 flex items-center justify-center mb-6">
            <span className="text-4xl">👤</span>
          </div>
          <h2 className="text-xl font-black text-text mb-2">سجّل دخولك</h2>
          <p className="text-sm text-muted text-center mb-8 leading-relaxed">
            سجّل الدخول للمشاركة في التوقعات وجمع النقاط والتنافس مع أصدقائك في كأس العالم 2026
          </p>
          <Link
            href="/login"
            className="w-full py-4 rounded-2xl bg-primary text-white font-black text-center text-base shadow-lg shadow-primary/30"
          >
            تسجيل الدخول
          </Link>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div>
      <Header title="حسابي" notif={false} />

      <div className="page-content px-4 py-4 space-y-4">

        {/* User Hero */}
        <div className="card p-5">
          <div className="flex items-center gap-4 mb-4">
            {user?.image ? (
              <img src={user.image} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-green flex items-center justify-center font-black text-2xl text-white">
                {isLoading ? '...' : initials}
              </div>
            )}
            <div className="flex-1">
              <p className="text-xl font-black text-text">{user?.name || user?.email || '...'}</p>
              <p className="text-muted text-xs mt-0.5">{user?.email || 'كأس العالم 2026'}</p>
              <span className={`text-xs font-bold ${rankInfo.color}`}>{rankInfo.icon} {rankInfo.title}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-black text-primary">{totalPoints}</span>
              <span className="text-[10px] text-muted">نقطة</span>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-muted">مجموع النقاط</span>
              <span className="text-xs font-bold text-primary">{totalPoints}</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border">
            <MiniStat label="التوقعات"  value={predictions.length}  color="text-text"    />
            <MiniStat label="النقاط"    value={totalPoints}          color="text-primary" />
            <MiniStat label="صحيح تام"  value={correctExact}         color="text-green"   />
            <MiniStat label="فائز فقط"  value={correctWinner}        color="text-gold"    />
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="card p-4">
          <p className="font-black text-sm text-text mb-3">تفصيل النقاط</p>
          <div className="space-y-2">
            {Object.values(breakdown).filter(v => typeof v === 'object').map(item => (
              <div key={item.label} className="flex items-center gap-3">
                <span className="text-xl w-7 text-center">{item.icon}</span>
                <span className="flex-1 text-xs text-muted">{item.label}</span>
                <span className={`text-sm font-black ${item.points > 0 ? 'text-primary' : 'text-muted'}`}>
                  +{item.points}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              <span className="text-xl w-7 text-center">🎯</span>
              <span className="flex-1 text-xs font-black text-text">المجموع الكلي</span>
              <span className="text-sm font-black text-primary">{breakdown.total}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: 'history',  label: 'التوقعات'  },
            { id: 'badges',   label: 'الإنجازات' },
            { id: 'settings', label: 'الإعدادات' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
                tab === t.id ? 'bg-primary text-white' : 'bg-card border border-border text-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'history'  && <HistoryTab predictions={predictions} loading={loadingData} />}
        {tab === 'badges'   && <BadgesTab correct={correctExact} total={predictions.length} />}
        {tab === 'settings' && <SettingsTab logout={logout} userEmail={user?.email} />}

      </div>

      <BottomNav />
    </div>
  )
}

// ─── History ───────────────────────────────────────────────────────────────────

function HistoryTab({ predictions, loading }) {
  const [claimedRewards, setClaimedRewards] = useState({})
  const [rewardCard, setRewardCard]         = useState(null)

  useEffect(() => {
    // تحميل قائمة المكافآت المستلمة من localStorage
    const claimed = {}
    predictions.forEach(p => {
      const attr    = p.attributes || p
      const matchId = attr.matchId
      if (localStorage.getItem(`korax_reward_${matchId}`)) {
        claimed[matchId] = true
      }
    })
    setClaimedRewards(claimed)
  }, [predictions])

  function claimReward(matchId, points) {
    const rarity = rarityFromPoints(points)
    const player = getRandomPlayer(rarity)
    saveCardToStorage(player, `prediction_${matchId}`)
    localStorage.setItem(`korax_reward_${matchId}`, '1')
    setClaimedRewards(prev => ({ ...prev, [matchId]: true }))
    setRewardCard(player)
    setTimeout(() => setRewardCard(null), 3000)
  }

  if (loading) {
    return (
      <div className="card p-8 text-center text-muted">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm">جاري التحميل...</p>
      </div>
    )
  }

  if (predictions.length === 0) {
    return (
      <div className="card p-8 text-center">
        <span className="text-3xl block mb-2">🎯</span>
        <p className="text-sm text-muted">لم تسجّل أي توقع بعد</p>
        <p className="text-xs text-muted mt-1">ابدأ بتوقع نتائج المباريات من الصفحة الرئيسية</p>
      </div>
    )
  }

  const RARITY_LABEL = { legendary: 'أسطوري', rare: 'نادر', common: 'عادي' }
  const RARITY_COLOR = { legendary: 'text-yellow-400', rare: 'text-purple-400', common: 'text-blue-400' }

  return (
    <>
      {/* بطاقة مكافأة منبثقة */}
      {rewardCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
          <div className="card p-6 text-center animate-bounce-in max-w-xs mx-4">
            <p className="text-3xl mb-2">🎉</p>
            <p className="font-black text-text text-base mb-1">حصلت على لاعب جديد!</p>
            <div className="text-4xl my-3">{rewardCard.flag}</div>
            <p className="font-black text-sm text-text">{rewardCard.name}</p>
            <p className={`text-xs font-bold mt-1 ${RARITY_COLOR[rewardCard.rarity]}`}>
              {RARITY_LABEL[rewardCard.rarity]} · {rewardCard.rating}
            </p>
            <p className="text-[10px] text-muted mt-2">تمت الإضافة إلى فريقك</p>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {predictions.slice(0, 20).map((p, i) => {
          const attr    = p.attributes || p
          const pts     = attr.points ?? 0
          const status  = attr.status
          const matchId = attr.matchId
          const canClaim = status === 'calculated' && pts > 0 && !claimedRewards[matchId]

          return (
            <div key={p.id || i} className="flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0">
              <PointsBadge points={pts} pending={status === 'pending'} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text truncate">
                  {attr.homeTeam} vs {attr.awayTeam}
                </p>
                <p className="text-xs text-muted">
                  توقعك: <span className="font-bold text-muted-light">{attr.homeScore}-{attr.awayScore}</span>
                  {status === 'calculated' && attr.actualHomeScore !== undefined && (
                    <> &nbsp;|&nbsp; النتيجة: <span className="font-bold text-muted-light">{attr.actualHomeScore}-{attr.actualAwayScore}</span></>
                  )}
                </p>
                {canClaim && (
                  <button
                    onClick={() => claimReward(matchId, pts)}
                    className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gold/15 border border-gold/40 text-gold text-[11px] font-black active:scale-95 transition-transform"
                  >
                    🎁 استلم بطاقة لاعب
                  </button>
                )}
                {status === 'calculated' && pts > 0 && claimedRewards[matchId] && (
                  <p className="mt-1 text-[10px] text-green font-bold">✓ تم استلام البطاقة</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

function PointsBadge({ points, pending }) {
  if (pending) {
    return (
      <span className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black border flex-shrink-0 bg-card border-border text-muted">
        ⏳
      </span>
    )
  }
  const cfg = {
    3: { label: '+3', cls: 'bg-green-bg text-green border-green/30'   },
    1: { label: '+1', cls: 'bg-gold-bg text-gold border-gold/30'      },
    0: { label: '0',  cls: 'bg-live-bg text-live border-live/30'      },
  }
  const { label, cls } = cfg[points] || cfg[0]
  return (
    <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black border flex-shrink-0 ${cls}`}>
      {label}
    </span>
  )
}

// ─── Badges ────────────────────────────────────────────────────────────────────

function BadgesTab({ correct, total }) {
  const badges = [
    { icon: '🏆', label: 'أول توقع',       unlocked: total >= 1,    desc: 'سجّلت أول توقع لك'        },
    { icon: '🎯', label: 'قناص',           unlocked: correct >= 3,  desc: '3 توقعات صحيحة تامة'       },
    { icon: '🔥', label: 'سلسلة نار',      unlocked: false,         desc: '3 صحيحة متتالية'            },
    { icon: '⭐', label: 'خبير',           unlocked: correct >= 10, desc: '10 توقعات صحيحة'           },
    { icon: '🧠', label: 'عقل تكتيكي',    unlocked: total >= 10,   desc: '10 توقعات مسجّلة'          },
    { icon: '🌍', label: 'متابع المونديال', unlocked: total >= 20,   desc: '20 توقعًا في كأس العالم'   },
  ]
  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map(b => (
        <div key={b.label} className={`card p-3 flex flex-col items-center gap-1.5 ${!b.unlocked ? 'opacity-40 grayscale' : ''}`}>
          <span className="text-3xl">{b.icon}</span>
          <span className="text-xs font-bold text-text text-center">{b.label}</span>
          <span className="text-[9px] text-muted text-center leading-tight">{b.desc}</span>
        </div>
      ))}
    </div>
  )
}

const POPULAR_TEAMS = [
  { id: '26',  name: 'الأرجنتين', flag: '🇦🇷' },
  { id: '6',   name: 'البرازيل',  flag: '🇧🇷' },
  { id: '2',   name: 'فرنسا',     flag: '🇫🇷' },
  { id: '9',   name: 'إسبانيا',   flag: '🇪🇸' },
  { id: '3',   name: 'ألمانيا',   flag: '🇩🇪' },
  { id: '10',  name: 'إنجلترا',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: '27',  name: 'البرتغال',  flag: '🇵🇹' },
  { id: '1',   name: 'هولندا',    flag: '🇳🇱' },
  { id: '141', name: 'السعودية',  flag: '🇸🇦' },
  { id: '32',  name: 'المغرب',    flag: '🇲🇦' },
  { id: '36',  name: 'مصر',       flag: '🇪🇬' },
  { id: '33',  name: 'السنغال',   flag: '🇸🇳' },
]

// ─── Settings ─────────────────────────────────────────────────────────────────

function SettingsTab({ logout, userEmail }) {
  const { theme, toggleTheme }        = useTheme()
  const [notifs, setNotifs]           = useState(true)
  const [before, setBefore]           = useState(30)
  const [favorites, setFavorites]     = useState([])
  const [showFavModal, setShowFavModal] = useState(false)
  const [deferredPrompt, setDeferred] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS]             = useState(false)
  const [showIOSHint, setShowIOSHint] = useState(false)

  useEffect(() => {
    // تحميل الفرق المفضلة
    try {
      const saved = JSON.parse(localStorage.getItem('korax_favorites') || '[]')
      setFavorites(saved)
    } catch {}

    // PWA install detection
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(ios)

    const handler = e => { e.preventDefault(); setDeferred(e) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function handleInstall() {
    if (isIOS) { setShowIOSHint(true); return }
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setIsInstalled(true)
  }

  function toggleFav(id) {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id)
        : prev.length < 3 ? [...prev, id] : prev
      localStorage.setItem('korax_favorites', JSON.stringify(next))
      return next
    })
  }

  const favTeams = POPULAR_TEAMS.filter(t => favorites.includes(t.id))

  return (
    <div className="space-y-3">

      {/* الفريق المفضل */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-black text-text">منتخبي المفضل</p>
          <button
            onClick={() => setShowFavModal(true)}
            className="text-xs text-primary font-bold px-3 py-1 rounded-lg bg-primary/10 border border-primary/20"
          >
            {favTeams.length > 0 ? 'تغيير' : 'اختر'}
          </button>
        </div>
        {favTeams.length > 0 ? (
          <div className="flex gap-2">
            {favTeams.map(t => (
              <div key={t.id} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-3xl">{t.flag}</span>
                <span className="text-[9px] text-muted text-center">{t.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted">لم تختر منتخباً بعد — اختر حتى 3 منتخبات</p>
        )}
      </div>

      {/* تثبيت التطبيق */}
      {!isInstalled && (
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📲</span>
            <div className="flex-1">
              <p className="text-sm font-black text-text">ثبّت KoraX على هاتفك</p>
              <p className="text-xs text-muted">وصول سريع مثل التطبيقات</p>
            </div>
            <button
              onClick={handleInstall}
              className="px-3 py-2 rounded-xl bg-primary text-white text-xs font-bold active:scale-95 transition-transform"
            >
              تثبيت
            </button>
          </div>
          {showIOSHint && (
            <div className="mt-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary text-center">
                اضغط <span className="font-black">↑ مشاركة</span> ثم <span className="font-black">"أضف إلى الشاشة الرئيسية"</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* باقي الإعدادات */}
      <div className="card divide-y divide-border">
        {userEmail && (
          <div className="px-4 py-3">
            <p className="text-[10px] text-muted mb-0.5">البريد الإلكتروني</p>
            <p className="text-sm font-bold text-text">{userEmail}</p>
          </div>
        )}
        <SettingRow label="إشعار قبل المباراة">
          <select
            value={before}
            onChange={e => setBefore(Number(e.target.value))}
            className="bg-bg border border-border rounded-lg px-2 py-1 text-xs text-text"
          >
            <option value={15}>15 دقيقة</option>
            <option value={30}>30 دقيقة</option>
            <option value={60}>ساعة</option>
          </select>
        </SettingRow>
        <SettingRow label="تنبيه الهدية اليومية">
          <Toggle value={notifs} onChange={setNotifs} />
        </SettingRow>
        <SettingRow label={theme === 'dark' ? 'الوضع الداكن' : 'الوضع الفاتح'}>
          <button
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${theme === 'light' ? 'bg-gold' : 'bg-card-hover border border-border'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow transition-all ${theme === 'light' ? 'right-0.5 bg-white' : 'left-0.5 bg-muted/30'}`}>
              {theme === 'light' ? '☀️' : '🌙'}
            </span>
          </button>
        </SettingRow>
        <SettingRow label="تسجيل الخروج">
          <button
            onClick={logout}
            className="text-xs font-bold text-live px-3 py-1 rounded-lg bg-live-bg border border-live/30"
          >
            خروج
          </button>
        </SettingRow>
      </div>

      {/* Modal اختيار الفريق */}
      {showFavModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setShowFavModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[480px] bg-card rounded-t-3xl p-6 pb-10" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-black text-text">اختر منتخبك المفضل</h2>
              <span className="text-xs text-muted">{favorites.length}/3</span>
            </div>
            <div className="grid grid-cols-6 gap-2 mb-5">
              {POPULAR_TEAMS.map(team => {
                const sel = favorites.includes(team.id)
                return (
                  <button
                    key={team.id}
                    onClick={() => toggleFav(team.id)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all border-2 ${
                      sel ? 'bg-primary/20 border-primary' : 'bg-bg border-border'
                    }`}
                  >
                    <span className="text-2xl">{team.flag}</span>
                    <span className="text-[8px] font-bold text-text leading-tight text-center">{team.name}</span>
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setShowFavModal(false)}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-sm"
            >
              حفظ
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingRow({ label, children }) {
  return (
    <div className="flex items-center justify-between px-4 py-4">
      <span className="text-sm font-medium text-text">{label}</span>
      {children}
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-primary' : 'bg-border'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${value ? 'right-0.5' : 'left-0.5'}`} />
    </button>
  )
}

function MiniStat({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-lg font-black ${color}`}>{value}</span>
      <span className="text-[9px] text-muted text-center">{label}</span>
    </div>
  )
}
