import axios from 'axios'
import { POINTS } from '@/lib/scoring'

const STRAPI_URL   = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN
const ADMIN_SECRET = process.env.ADMIN_SECRET

const strapi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${STRAPI_TOKEN}`,
  },
})

/**
 * POST /api/admin/update-result
 *
 * Body للمباريات:
 * { secret, type: 'match', matchId, actualHome, actualAway }
 *
 * Body للجوائز:
 * { secret, type: 'award', awardId: 'champion'|'finalist'|..., actualValue }
 *
 * Body لترتيب المجموعات:
 * { secret, type: 'group', group: 'A', slot: '1st'|'2nd', actualTeam }
 */
export async function POST(req) {
  const body = await req.json()
  const { secret, type } = body

  // ─── التحقق من السر ──────────────────────────────────────────────────────────
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return Response.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    if (type === 'match') {
      return await handleMatch(body)
    } else if (type === 'award') {
      return await handleAward(body)
    } else if (type === 'group') {
      return await handleGroup(body)
    } else {
      return Response.json({ error: 'نوع غير معروف' }, { status: 400 })
    }
  } catch (err) {
    console.error('[admin] update-result error:', err.message)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

// ─── تحديث نتيجة مباراة ───────────────────────────────────────────────────────
async function handleMatch({ matchId, actualHome, actualAway }) {
  const aHome = Number(actualHome)
  const aAway = Number(actualAway)

  // جلب كل التوقعات لهذه المباراة
  const res = await strapi.get('/predictions', {
    params: {
      filters: { matchId: { $eq: matchId } },
      pagination: { pageSize: 500 },
    },
  })
  const predictions = res.data.data || []
  if (predictions.length === 0) {
    return Response.json({ message: 'لا توجد توقعات لهذه المباراة', updated: 0 })
  }

  let updated = 0
  let exact = 0
  let winner = 0

  for (const pred of predictions) {
    const pHome = pred.attributes?.homeScore ?? pred.homeScore ?? null
    const pAway = pred.attributes?.awayScore ?? pred.awayScore ?? null
    if (pHome === null || pAway === null) continue

    let pts = 0
    let status = 'wrong'

    if (pHome === aHome && pAway === aAway) {
      // نتيجة دقيقة
      pts    = POINTS.MATCH_EXACT
      status = 'exact'
      exact++
    } else {
      // هل توقّع الفائز صح؟
      const predWinner = pHome > pAway ? 'home' : pAway > pHome ? 'away' : 'draw'
      const realWinner = aHome > aAway ? 'home' : aAway > aHome ? 'away' : 'draw'
      if (predWinner === realWinner) {
        pts    = POINTS.MATCH_WINNER
        status = 'won'
        winner++
      }
    }

    await strapi.put(`/predictions/${pred.id}`, {
      data: {
        points:          pts,
        status,
        actualHomeScore: aHome,
        actualAwayScore: aAway,
      },
    })
    updated++
  }

  return Response.json({
    message: `✅ تم تحديث ${updated} توقع`,
    updated,
    exact,
    winner,
    wrong: updated - exact - winner,
  })
}

// ─── تحديث نتيجة جائزة ───────────────────────────────────────────────────────
async function handleAward({ awardId, actualValue }) {
  const matchId = `award_${awardId}`
  const pointsMap = {
    champion:   POINTS.AWARD_CHAMPION,
    finalist:   POINTS.AWARD_FINALIST,
    topScorer:  POINTS.AWARD_TOPSCORER,
    bestPlayer: POINTS.AWARD_BESTPLAYER,
    surprise:   POINTS.AWARD_SURPRISE,
  }
  const awardPts = pointsMap[awardId]
  if (!awardPts) return Response.json({ error: 'معرف جائزة غير معروف' }, { status: 400 })

  const res = await strapi.get('/predictions', {
    params: {
      filters: { matchId: { $eq: matchId } },
      pagination: { pageSize: 500 },
    },
  })
  const predictions = res.data.data || []
  if (predictions.length === 0) {
    return Response.json({ message: 'لا توجد توقعات لهذه الجائزة', updated: 0 })
  }

  let updated = 0
  let correct = 0

  for (const pred of predictions) {
    const predicted = pred.attributes?.homeTeam || pred.homeTeam || ''
    const isCorrect = predicted.trim().toLowerCase() === actualValue.trim().toLowerCase()
    const pts       = isCorrect ? awardPts : 0
    const status    = isCorrect ? 'won' : 'wrong'

    await strapi.put(`/predictions/${pred.id}`, {
      data: { points: pts, status },
    })
    updated++
    if (isCorrect) correct++
  }

  return Response.json({
    message: `✅ تم تحديث ${updated} توقع — ${correct} أصابوا`,
    updated,
    correct,
    wrong: updated - correct,
  })
}

// ─── تحديث ترتيب مجموعة ──────────────────────────────────────────────────────
async function handleGroup({ group, slot, actualTeam }) {
  const matchId  = `group_${group}_${slot}`
  const pts      = slot === '1st' ? POINTS.GROUP_FIRST : POINTS.GROUP_SECOND

  const res = await strapi.get('/predictions', {
    params: {
      filters: { matchId: { $eq: matchId } },
      pagination: { pageSize: 500 },
    },
  })
  const predictions = res.data.data || []
  if (predictions.length === 0) {
    return Response.json({ message: 'لا توجد توقعات لهذه المجموعة', updated: 0 })
  }

  let updated = 0
  let correct = 0

  for (const pred of predictions) {
    const predicted = pred.attributes?.homeTeam || pred.homeTeam || ''
    const isCorrect = predicted.trim().toLowerCase() === actualTeam.trim().toLowerCase()
    const predPts   = isCorrect ? pts : 0
    const status    = isCorrect ? 'won' : 'wrong'

    await strapi.put(`/predictions/${pred.id}`, {
      data: { points: predPts, status },
    })
    updated++
    if (isCorrect) correct++
  }

  return Response.json({
    message: `✅ تم تحديث ${updated} توقع — ${correct} أصابوا`,
    updated,
    correct,
    wrong: updated - correct,
  })
}
