'use client'

import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [show, setShow]           = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS]         = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // لا تعرض إذا سبق رفضه أو تم التثبيت
    if (localStorage.getItem('korax_install_dismissed')) return

    // هل هو مثبت مسبقاً؟
    if (window.matchMedia('(display-mode: standalone)').matches) return

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    setIsIOS(ios)

    if (ios) {
      // على iOS نعرض التعليمات اليدوية
      setTimeout(() => setShow(true), 3000)
      return
    }

    // Android / Chrome — نستمع لحدث التثبيت
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShow(true), 3000)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem('korax_install_dismissed', '1')
    setShow(false)
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setShow(false)
    localStorage.setItem('korax_install_dismissed', '1')
  }

  if (!show || installed) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-[480px] mx-auto animate-in">
      <div className="card border border-primary/30 bg-card p-4 shadow-2xl shadow-primary/10">
        <div className="flex items-start gap-3">

          {/* Icon */}
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0 text-white font-black text-xl">
            K
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="font-black text-text text-sm mb-0.5">ثبّت KoraX على هاتفك</p>
            {isIOS ? (
              <p className="text-xs text-muted leading-relaxed">
                اضغط <span className="text-primary font-bold">↑ مشاركة</span> ثم{' '}
                <span className="text-primary font-bold">"أضف إلى الشاشة الرئيسية"</span>
              </p>
            ) : (
              <p className="text-xs text-muted">وصول سريع وتجربة مثل التطبيقات</p>
            )}
          </div>

          {/* Close */}
          <button
            onClick={dismiss}
            className="w-7 h-7 rounded-full bg-border flex items-center justify-center text-muted text-xs flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Buttons — Android only */}
        {!isIOS && (
          <div className="flex gap-2 mt-3">
            <button
              onClick={dismiss}
              className="flex-1 py-2.5 rounded-xl border border-border text-muted text-xs font-bold"
            >
              لاحقاً
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold active:scale-95 transition-transform"
            >
              📲 تثبيت
            </button>
          </div>
        )}

        {/* iOS hint */}
        {isIOS && (
          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-muted">
            <span>↑</span>
            <span>مشاركة</span>
            <span>←</span>
            <span>أضف إلى الشاشة الرئيسية</span>
          </div>
        )}
      </div>
    </div>
  )
}
