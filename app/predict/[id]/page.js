'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import ScoreInput from '@/components/prediction/ScoreInput'
import { fetchMatchDetails } from '@/lib/api-football'
import { formatMatchTime, getUserTimezone } from '@/lib/utils'
import { useAuth } from '@/lib/useAuth'

export default function PredictPage() {
  const { id }   = useParams()
  const router   = useRouter()
  const { isLoggedIn, strapiId, strapiToken, isLoading: authLoading } = useAuth()

  const [match, setMatch]       = useState(null)
  const [homeGoals, setHome]    = useState(0)
  const [awayGoals, setAway]    = useState(0)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [loadingMatch, setLoadingMatch] = useState(true)
  const [existing, setExisting] = useState(null)
  const [error, setError]       = useState(null)

  // تحميل بيانات المباراة
  useEffect(() => {
    fetchMatchDetails(id)
      .then(m => {
        setMatch(m)
        if (m.status !== 'UPCOMING') router.replace(`/match/${id}`)
      })
      .finally(() => setLoadingMatch(false))
  }, [id, router])

  // تحميل التوقع المحفوظ إن وجد
  useEffect(() => {
    if (!isLoggedIn) return
    fetch(`/api/predictions?matchId=${id}`)
      .then(r => r.json())
      .then(data => {
        const pred = Array.isArray(data) ? data.find(p => {
          const attr = p.attributes || p
          return Number(attr.matchId) === Number(id)
        }) : null
        if (pred) {
          const attr = pred.attributes || pred
          setExisting(pred)
          setHome(attr.homeScore ?? 0)
          setAway(attr.awayScore ?? 0)
        }
      }).catch(() => {})
  }, [isLoggedIn, id])

  async function handleSave() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }
    setError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId:   Number(id),
          homeScore: homeGoals,
          awayScore: awayGoals,
          homeTeam:  match?.homeTeam?.name || '',
          awayTeam:  match?.awayTeam?.name || '',
          matchDate: match?.startTime,
        }),
      })
      if (!res.ok) throw new Error('فشل الحفظ')
      setSaved(true)
      setTimeout(() => router.push('/'), 1200)
    } catch (err) {
      setError('حدث خطأ، تأكد من اتصال Strapi وحاول مرة أخرى')
    } finally {
      setSaving(false)
    }
  }

  if (loadingMatch || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-4xl animate-pulse">⚽</div>
      </div>
    )
  }

  if (!match) return null

  const time = formatMatchTime(match.startTime, getUserTimezone())

  return (
    <div className="min-h-screen flex flex-col">
      <Header back title="توقع النتيجة" notif={false} />

      <div className="flex-1 flex flex-col px-6">

        {/* Match info */}
        <div className="text-center pt-6 pb-4">
          <p className="text-muted text-sm font-medium">{match.group}</p>
          <p className="text-muted-light text-xs mt-0.5">
            {new Date(match.startTime).toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' })}
            {' • '}
            {time}
          </p>
          {existing && (
            <p className="text-xs text-primary mt-1 font-bold">✏️ تعديل توقعك السابق</p>
          )}
        </div>

        {/* تنبيه تسجيل الدخول */}
        {!isLoggedIn && (
          <div className="mb-4 p-3 rounded-2xl bg-primary/10 border border-primary/20 text-center">
            <p className="text-sm text-primary font-bold mb-1">سجّل دخولك لحفظ التوقع</p>
            <Link href="/login" className="text-xs text-primary underline">تسجيل الدخول</Link>
          </div>
        )}

        {/* Score input */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex items-center justify-center gap-6 w-full">
            <ScoreInput
              value={homeGoals}
              onChange={setHome}
              teamName={match.homeTeam.name}
              teamFlag={match.homeTeam.flag}
              side="home"
            />

            <div className="flex flex-col items-center gap-1 pb-16">
              <span className="text-3xl text-muted font-light">:</span>
            </div>

            <ScoreInput
              value={awayGoals}
              onChange={setAway}
              teamName={match.awayTeam.name}
              teamFlag={match.awayTeam.flag}
              side="away"
            />
          </div>

          {/* نظام النقاط */}
          <div className="mt-8 card p-4 w-full">
            <p className="text-center text-xs text-muted font-medium mb-2">نظام النقاط</p>
            <div className="flex justify-around">
              <PointsChip label="نتيجة صحيحة" points="+3" color="text-green" />
              <PointsChip label="الفائز صحيح"  points="+1" color="text-gold"  />
              <PointsChip label="خطأ"           points="0"  color="text-muted" />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-live text-xs text-center mb-3">{error}</p>
        )}

        {/* Save button */}
        <div className="pb-10 pt-6">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`
              w-full py-5 rounded-2xl font-black text-xl transition-all duration-300
              ${saved
                ? 'bg-green text-white scale-95'
                : 'bg-primary text-white active:scale-95 shadow-lg shadow-primary/40'
              }
              disabled:opacity-80
            `}
          >
            {saved   ? '✓ تم الحفظ' :
             saving  ? 'جاري الحفظ...' :
             existing ? 'تعديل التوقع' :
             'حفظ التوقع'}
          </button>
        </div>

      </div>
    </div>
  )
}

function PointsChip({ label, points, color }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className={`text-base font-black ${color}`}>{points}</span>
      <span className="text-[10px] text-muted text-center">{label}</span>
    </div>
  )
}
