'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/',           icon: HomeIcon,      label: 'الرئيسية'  },
  { href: '/groups',     icon: GroupsIcon,    label: 'المجموعات' },
  { href: '/predict',    icon: PredictIcon,   label: 'توقعاتي'   },
  { href: '/simulator',  icon: SimulatorIcon, label: 'المحاكي'   },
  { href: '/news',       icon: NewsIcon,      label: 'الأخبار'   },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 flex-1 py-1 group">
              <div className={`
                flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200
                ${active ? 'bg-primary/15' : 'group-active:bg-white/5'}
              `}>
                <Icon
                  size={22}
                  className={`transition-colors duration-200 ${active ? 'text-primary' : 'text-muted'}`}
                />
              </div>
              <span className={`text-[10px] font-semibold transition-colors duration-200 ${active ? 'text-primary' : 'text-muted'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function HomeIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function GroupsIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
      <rect x="13" y="3" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
      <rect x="3" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
      <rect x="13" y="13" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

function TrophyIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M6 2h12M8 2v5a4 4 0 008 0V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M5 2H3a2 2 0 000 4h2M19 2h2a2 2 0 010 4h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 11v4M8 21h8M10 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function TeamIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M6 20v-1a6 6 0 0112 0v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="4" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M1 20v-.5a3 3 0 015-2.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="20" cy="10" r="2" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M23 20v-.5a3 3 0 00-5-2.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

function ProfileIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

function ShieldIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2L3 7v6c0 5 3.5 9.5 9 11 5.5-1.5 9-6 9-11V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PredictIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SimulatorIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function NewsIcon({ size = 24, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 14h-8M15 18h-5M10 6h8v4h-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
