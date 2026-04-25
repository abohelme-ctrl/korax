'use client'

import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'

const NOTIFS = [
  { id: 1, icon: '🎁', title: 'هديتك اليومية جاهزة!',        desc: 'اختر لاعباً جديداً لمنتخبك',          time: 'الآن',      href: '/gift',   unread: true  },
  { id: 2, icon: '⚽', title: 'مباراة تبدأ خلال 30 دقيقة',   desc: 'البرازيل vs المغرب — لا تنسَ توقعك', time: 'قبل ساعة', href: '/',       unread: true  },
  { id: 3, icon: '🏆', title: 'أحسنت! توقعك كان صحيحاً',     desc: 'ربحت لاعباً نادراً جديداً',           time: 'أمس',       href: '/gift',   unread: false },
  { id: 4, icon: '🔥', title: 'سلسلة رائعة!',                 desc: '3 توقعات صحيحة متتالية — استمر!',    time: 'أمس',       href: '/profile',unread: false },
  { id: 5, icon: '👥', title: 'انضم صديق لمجموعتك',          desc: 'فهد الغامدي انضم لـ "أصدقاء العمل"', time: 'منذ يومين', href: '/rankings',unread: false },
]

export default function NotificationsPage() {
  const unreadCount = NOTIFS.filter(n => n.unread).length

  return (
    <div>
      <Header back title="الإشعارات" />

      <div className="page-content px-4 py-4">

        {unreadCount > 0 && (
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted">{unreadCount} إشعارات جديدة</span>
            <button className="text-xs text-primary font-bold">تحديد الكل كمقروء</button>
          </div>
        )}

        <div className="card overflow-hidden">
          {NOTIFS.map((n, i) => (
            <Link
              key={n.id}
              href={n.href}
              className={`flex items-start gap-3 px-4 py-4 border-b border-border last:border-b-0 active:bg-card-hover transition-colors ${
                n.unread ? 'bg-primary/5' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl ${
                n.unread ? 'bg-primary/20' : 'bg-card-hover'
              }`}>
                {n.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${n.unread ? 'text-text' : 'text-muted-light'}`}>{n.title}</p>
                <p className="text-xs text-muted mt-0.5 leading-relaxed">{n.desc}</p>
                <p className="text-[10px] text-muted mt-1">{n.time}</p>
              </div>
              {n.unread && (
                <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
              )}
            </Link>
          ))}
        </div>

      </div>
      <BottomNav />
    </div>
  )
}
