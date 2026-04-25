'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

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

export default function Onboarding() {
  const router  = useRouter()
  const [show, setShow]       = useState(false)
  const [picked, setPicked]   = useState([])
  const [saving, setSaving]   = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('korax_welcomed')) setShow(true)
  }, [])

  function toggleTeam(id) {
    setPicked(prev =>
      prev.includes(id) ? prev.filter(x => x !== id)
        : prev.length < 3 ? [...prev, id] : prev
    )
  }

  function handleDone() {
    setSaving(true)
    localStorage.setItem('korax_welcomed', '1')
    if (picked.length > 0) localStorage.setItem('korax_favorites', JSON.stringify(picked))
    setShow(false)
  }

  function handleLogin() {
    localStorage.setItem('korax_welcomed', '1')
    if (picked.length > 0) localStorage.setItem('korax_favorites', JSON.stringify(picked))
    router.push('/login')
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Sheet */}
      <div className="relative w-full max-w-[480px] bg-card rounded-t-3xl p-6 pb-10 animate-in">

        {/* Handle */}
        <div className="w-10 h-1 bg-border rounded-full mx-auto mb-5" />

        {/* Title */}
        <div className="text-center mb-5">
          <span className="text-5xl block mb-3">🏆</span>
          <h1 className="text-xl font-black text-text mb-1">مرحباً في KoraX!</h1>
          <p className="text-sm text-muted">توقع نتائج كأس العالم 2026 وتنافس مع أصدقائك</p>
        </div>

        {/* Favorite teams */}
        <div className="mb-5">
          <p className="text-xs font-bold text-muted-light mb-3 text-center">
            اختر منتخبك المفضل {picked.length > 0 ? `(${picked.length}/3)` : '(اختياري)'}
          </p>
          <div className="grid grid-cols-6 gap-2">
            {POPULAR_TEAMS.map(team => {
              const sel = picked.includes(team.id)
              return (
                <button
                  key={team.id}
                  onClick={() => toggleTeam(team.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
                    sel
                      ? 'bg-primary/20 border-2 border-primary'
                      : 'bg-bg border-2 border-border'
                  }`}
                >
                  <span className="text-2xl">{team.flag}</span>
                  <span className="text-[8px] font-bold text-text leading-tight text-center">{team.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={handleLogin}
          className="w-full py-4 rounded-2xl bg-primary text-white font-black text-sm mb-3 active:scale-95 transition-transform"
        >
          سجّل دخولك للحفظ
        </button>
        <button
          onClick={handleDone}
          className="w-full py-3 rounded-2xl border border-border text-muted-light font-bold text-sm active:scale-95 transition-transform"
        >
          متابعة بدون تسجيل
        </button>
      </div>
    </div>
  )
}
