'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { formatDateAr } from '@/lib/utils'

export default function Header({ title, back = false, notif = true }) {
  const [today, setToday] = useState('')
  const [hasGift, setHasGift] = useState(false)

  useEffect(() => {
    setToday(formatDateAr(new Date().toISOString()))
    // تحقق هل الهدية اليومية متاحة (لم تُؤخذ اليوم)
    const lastClaim = localStorage.getItem('korax_last_gift')
    const todayStr  = new Date().toISOString().slice(0, 10)
    setHasGift(lastClaim !== todayStr)
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-bg/90 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">

        {/* Right side */}
        <div className="flex items-center gap-3">
          {back ? (
            <BackButton />
          ) : (
            <Link href="/" className="flex items-center gap-2 active:scale-95 transition-transform">
              <Image src="/logo.png" alt="KoraX" width={36} height={36} className="rounded-xl" />
            </Link>
          )}
          {title && !back && (
            <span className="text-muted text-sm hidden sm:block">{today}</span>
          )}
          {title && back && (
            <span className="font-bold text-base text-text">{title}</span>
          )}
        </div>

        {/* Left side — أيقونات */}
        {notif && (
          <div className="flex items-center gap-2">

            {/* 🎁 هدية يومية */}
            <Link href="/gift" className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border active:scale-95 transition-transform">
              <GiftIcon />
              {hasGift && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-gold rounded-full animate-pulse" />
              )}
            </Link>

            {/* 🔔 إشعارات */}
            <Link href="/notifications" className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border active:scale-95 transition-transform">
              <BellIcon />
            </Link>

            {/* 👤 حساب */}
            <Link href="/profile" className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border active:scale-95 transition-transform">
              <PersonIcon />
            </Link>

          </div>
        )}
      </div>

      {/* Sub-title / date on main pages */}
      {title && !back && (
        <div className="px-4 pb-2">
          <h1 className="font-black text-xl text-text">{title}</h1>
          <p className="text-muted text-xs mt-0.5">{today}</p>
        </div>
      )}
    </header>
  )
}

function BackButton() {
  return (
    <Link href="javascript:history.back()" className="w-9 h-9 flex items-center justify-center rounded-xl bg-card border border-border active:scale-95 transition-transform">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M14 18l-6-6 6-6" stroke="#F9FAFB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Link>
  )
}

function GiftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 12v10H4V12" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M22 7H2v5h20V7z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
