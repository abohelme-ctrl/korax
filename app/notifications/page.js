'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'

// مباريات قادمة للإشعارات (نفس البيانات الموجودة)
const UPCOMING_MATCHES = [
  { id: 1, date: '2026-06-11T19:00:00Z', home: 'المكسيك',          homeFlag: '🇲🇽', away: 'جنوب أفريقيا',   awayFlag: '🇿🇦' },
  { id: 2, date: '2026-06-12T02:00:00Z', home: 'كوريا الجنوبية',   homeFlag: '🇰🇷', away: 'التشيك',          awayFlag: '🇨🇿' },
  { id: 3, date: '2026-06-12T19:00:00Z', home: 'كندا',              homeFlag: '🇨🇦', away: 'البوسنة والهرسك', awayFlag: '🇧🇦' },
  { id: 4, date: '2026-06-13T01:00:00Z', home: 'الولايات المتحدة', homeFlag: '🇺🇸', away: 'باراغواي',        awayFlag: '🇵🇾' },
  { id: 5, date: '2026-06-13T19:00:00Z', home: 'قطر',               homeFlag: '🇶🇦', away: 'سويسرا',          awayFlag: '🇨🇭' },
  { id: 6, date: '2026-06-13T22:00:00Z', home: 'البرازيل',          homeFlag: '🇧🇷', away: 'المغرب',          awayFlag: '🇲🇦' },
]

const ACTIVITY = [
  { id: 1, icon: '⚽', title: 'مباراة البرازيل vs المغرب',      desc: 'سيُشعَر بك قبل 30 دقيقة من الانطلاق', time: '14 يونيو 2026', type: 'match'  },
  { id: 2, icon: '🏆', title: 'تذكير بتوقعاتك',                desc: 'لم تُكمل توقعاتك الكبرى بعد',         time: 'الآن',           type: 'remind' },
  { id: 3, icon: '❓', title: 'التحدي اليومي',                  desc: 'سؤال جديد ينتظرك اليوم',              time: 'الآن',           type: 'quiz'   },
  { id: 4, icon: '🎁', title: 'هديتك اليومية',                  desc: 'لم تأخذ هديتك اليوم بعد',             time: 'الآن',           type: 'gift'   },
]

export default function NotificationsPage() {
  const [permission,  setPermission]  = useState('default')
  const [enabled,     setEnabled]     = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [toast,       setToast]       = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
      setEnabled(Notification.permission === 'granted' && localStorage.getItem('korax_notif_enabled') === '1')
    }
  }, [])

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function requestPermission() {
    if (!('Notification' in window)) {
      showToast('المتصفح لا يدعم الإشعارات')
      return
    }

    setLoading(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === 'granted') {
        setEnabled(true)
        localStorage.setItem('korax_notif_enabled', '1')
        scheduleTestNotification()
        showToast('تم تفعيل الإشعارات! ✓')
      } else {
        showToast('تم رفض الإذن. فعّله من إعدادات المتصفح.')
      }
    } finally {
      setLoading(false)
    }
  }

  function toggleNotifications() {
    if (enabled) {
      setEnabled(false)
      localStorage.setItem('korax_notif_enabled', '0')
      showToast('تم إيقاف الإشعارات')
    } else {
      if (permission === 'granted') {
        setEnabled(true)
        localStorage.setItem('korax_notif_enabled', '1')
        scheduleTestNotification()
        showToast('تم تفعيل الإشعارات! ✓')
      } else {
        requestPermission()
      }
    }
  }

  function scheduleTestNotification() {
    // إشعار تجريبي بعد 3 ثوانٍ
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('KoraX 🏆', {
          body: 'تم تفعيل إشعارات المباريات بنجاح! ستُبلَّغ قبل كل مباراة بـ30 دقيقة.',
          icon: '/logo.png',
          badge: '/logo.png',
        })
      }
    }, 3000)
  }

  function sendMatchReminder(match) {
    if (Notification.permission !== 'granted') return
    new Notification(`⚽ مباراة قريبة — KoraX`, {
      body: `${match.homeFlag} ${match.home} vs ${match.away} ${match.awayFlag} · تبدأ خلال 30 دقيقة`,
      icon: '/logo.png',
    })
    showToast('تم إرسال إشعار تجريبي!')
  }

  const permStatus = {
    granted: { label: 'مُفعَّل', color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30' },
    denied:  { label: 'مرفوض', color: 'text-red-400',    bg: 'bg-red-400/10   border-red-400/30'   },
    default: { label: 'غير محدد', color: 'text-muted',     bg: 'bg-card         border-border'       },
  }[permission] || { label: 'غير مدعوم', color: 'text-muted', bg: 'bg-card border-border' }

  return (
    <div>
      <Header back title="الإشعارات" />

      <div className="page-content px-4 py-4 space-y-4 pb-24">

        {/* ─── بطاقة الإشعارات الرئيسية ─── */}
        <div className={`card border-2 ${enabled ? 'border-primary/40 bg-primary/5' : 'border-border'} p-5`}>
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 ${enabled ? 'bg-primary/20' : 'bg-card-hover'}`}>
              🔔
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-black text-base text-text">إشعارات المباريات</p>
                {/* Toggle */}
                <button
                  onClick={toggleNotifications}
                  disabled={loading}
                  className={`relative w-12 h-6 rounded-full transition-all flex-shrink-0 ${enabled ? 'bg-primary' : 'bg-card-hover border border-border'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
              <p className="text-muted text-xs mt-1 leading-relaxed">
                احصل على تنبيه قبل كل مباراة بـ30 دقيقة حتى لا تفوتك لحظة
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${permStatus.bg} ${permStatus.color}`}>
                  إذن المتصفح: {permStatus.label}
                </span>
              </div>
            </div>
          </div>

          {/* زر الطلب إذا لم يُمنح الإذن */}
          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              disabled={loading || permission === 'denied'}
              className={`mt-4 w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                permission === 'denied'
                  ? 'bg-card border border-border text-muted cursor-not-allowed'
                  : 'bg-primary text-white shadow-lg shadow-primary/30'
              }`}
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> جاري الطلب...</>
              ) : permission === 'denied' ? (
                '⚠️ مرفوض — فعّله من إعدادات المتصفح'
              ) : (
                <><span>🔔</span> السماح بالإشعارات</>
              )}
            </button>
          )}

          {permission === 'denied' && (
            <div className="mt-3 bg-red-400/10 border border-red-400/20 rounded-xl p-3">
              <p className="text-xs text-red-400 leading-relaxed">
                لتفعيل الإشعارات: اضغط على أيقونة القفل/المعلومات في شريط العنوان ← الإشعارات ← سماح
              </p>
            </div>
          )}
        </div>

        {/* ─── اختبر الإشعارات ─── */}
        {enabled && (
          <div className="card p-4">
            <p className="font-black text-sm text-text mb-3 flex items-center gap-2">
              <span>🧪</span> اختبر إشعار مباراة
            </p>
            <div className="space-y-2">
              {UPCOMING_MATCHES.slice(0, 3).map(m => (
                <button
                  key={m.id}
                  onClick={() => sendMatchReminder(m)}
                  className="w-full flex items-center gap-3 p-3 card border-border active:border-primary transition-colors rounded-xl text-right"
                >
                  <span className="text-lg">{m.homeFlag}</span>
                  <span className="text-muted text-sm">vs</span>
                  <span className="text-lg">{m.awayFlag}</span>
                  <span className="flex-1 text-xs text-text font-bold truncate">
                    {m.home} vs {m.away}
                  </span>
                  <span className="text-primary text-xs">إشعار</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ─── روابط سريعة ─── */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-black text-sm text-text">روابط سريعة</p>
          </div>
          {[
            { icon: '❓', label: 'التحدي اليومي',    desc: 'سؤال جديد كل يوم',         href: '/quiz',      color: 'text-indigo-400' },
            { icon: '🏆', label: 'توقعاتي الكبرى',   desc: 'من سيفوز بكأس العالم؟',    href: '/predict',   color: 'text-gold'       },
            { icon: '🏟️', label: 'محاكي البطولة',    desc: 'جهّز الكأس بنفسك',         href: '/simulator', color: 'text-primary'    },
            { icon: '🏟️', label: 'الملاعب',          desc: 'تعرّف على ملاعب 2026',     href: '/stadiums',  color: 'text-green-400'  },
            { icon: '🎁', label: 'الهدية اليومية',   desc: 'هدية مجانية كل يوم',       href: '/gift',      color: 'text-purple-400' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 active:bg-card-hover transition-colors"
            >
              <span className={`text-xl w-8 text-center ${item.color}`}>{item.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-text">{item.label}</p>
                <p className="text-[10px] text-muted">{item.desc}</p>
              </div>
              <span className="text-muted text-xs">←</span>
            </Link>
          ))}
        </div>

        {/* ─── ملاحظة ─── */}
        <div className="card p-4 bg-card-hover border-border">
          <p className="text-[11px] text-muted leading-relaxed text-center">
            الإشعارات تعمل عند فتح التطبيق أو عند تثبيته كـ PWA على هاتفك.
            لأفضل تجربة ثبّت التطبيق من ملف الحساب.
          </p>
        </div>

      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-card border border-border px-4 py-2 rounded-full text-sm font-bold text-text shadow-xl z-50">
          {toast}
        </div>
      )}

      <BottomNav />
    </div>
  )
}
