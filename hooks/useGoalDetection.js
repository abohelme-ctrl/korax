'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * يكشف الأهداف والأحداث الجديدة ويُطلق إشعارات
 */
export function useGoalDetection({ events = [], homeScore, awayScore, homeTeam, awayTeam, status }) {
  const prevEventsLen  = useRef(0)
  const prevHome       = useRef(null)
  const prevAway       = useRef(null)
  const notifGranted   = useRef(false)

  const [goalFlash, setGoalFlash] = useState(null)   // { team, player, score }
  const [latestNew, setLatestNew] = useState(null)   // آخر حدث جديد

  // — طلب إذن الإشعارات عند فتح الصفحة ─────────────────────────────────────
  useEffect(() => {
    if (typeof Notification === 'undefined') return
    if (Notification.permission === 'granted') {
      notifGranted.current = true
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(p => {
        notifGranted.current = p === 'granted'
      })
    }
  }, [])

  // — كشف الأحداث الجديدة ──────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'LIVE') return
    if (events.length <= prevEventsLen.current) {
      prevEventsLen.current = events.length
      return
    }

    // أحداث جديدة منذ آخر تحقق
    const newEvents = events.slice(prevEventsLen.current)
    prevEventsLen.current = events.length

    for (const ev of newEvents) {
      if (ev.type === 'goal' || ev.type === 'penalty') {
        const isHome  = String(ev.team) === String(homeTeam?.id) || ev.team === 'home'
        const team    = isHome ? homeTeam : awayTeam
        const scoreStr = `${homeScore ?? 0} - ${awayScore ?? 0}`

        // Toast داخل التطبيق
        setGoalFlash({ team, player: ev.player, score: scoreStr, minute: ev.minute })
        setTimeout(() => setGoalFlash(null), 5000)

        // إشعار المتصفح
        if (notifGranted.current) {
          new Notification(`⚽ هدف! ${team?.flag || ''} ${team?.name || ''}`, {
            body: `${ev.player} — ${scoreStr} | الدقيقة ${ev.minute}'`,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
          })
        }
      }
      setLatestNew(ev)
    }
  }, [events, status, homeTeam, awayTeam, homeScore, awayScore])

  // — تحديث عنوان التاب ────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'LIVE') {
      document.title = 'KoraX'
      return
    }
    const h = homeTeam?.flag || ''
    const a = awayTeam?.flag || ''
    document.title = `🔴 ${h} ${homeScore ?? 0} - ${awayScore ?? 0} ${a} | مباشر`
    return () => { document.title = 'KoraX' }
  }, [status, homeScore, awayScore, homeTeam, awayTeam])

  return { goalFlash, latestNew }
}
