import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import axios from 'axios'
import { getSettings } from '@/app/api/settings/route'

const STRAPI_URL   = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN

const strapi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${STRAPI_TOKEN}`,
  },
})

// GET /api/predictions — توقعات المستخدم الحالي
export async function GET(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userEmail = session.user.email

  try {
    // ابحث عن المستخدم في Strapi بالإيميل
    const usersRes = await strapi.get('/users', {
      params: { filters: { email: { $eq: userEmail } } },
    })
    const strapiUser = usersRes.data?.[0]
    if (!strapiUser) return Response.json([])

    const res = await strapi.get('/predictions', {
      params: {
        filters: { user: { id: { $eq: strapiUser.id } } },
        sort: 'createdAt:desc',
        populate: '*',
      },
    })
    return Response.json(res.data.data || [])
  } catch (err) {
    console.error('GET predictions error:', err.message)
    return Response.json([])
  }
}

// POST /api/predictions — حفظ توقع
export async function POST(req) {
  const session = await getServerSession(authOptions)
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const userEmail = session.user.email
  const body = await req.json()
  const { matchId, homeScore, awayScore, homeTeam, awayTeam, matchDate } = body

  // ─── التحقق من القفل ──────────────────────────────────────────────────────
  try {
    const settings = await getSettings()
    const matchIdStr = String(matchId)

    // جوائز مقفلة؟
    if (matchIdStr.startsWith('award_') && settings.awardsLocked) {
      return Response.json({ error: 'توقعات الجوائز مغلقة' }, { status: 403 })
    }

    // مجموعة مقفلة؟
    if (matchIdStr.startsWith('group_')) {
      const groupLetter = matchIdStr.split('_')[1] // group_A_1st → A
      if (settings.lockedGroups.includes(groupLetter)) {
        return Response.json({ error: `توقعات المجموعة ${groupLetter} مغلقة` }, { status: 403 })
      }
    }

    // مباراة عادية: تحقق من الوقت (قفل تلقائي قبل ساعة)
    if (!matchIdStr.startsWith('award_') && !matchIdStr.startsWith('group_') && matchIdStr !== '_korax_settings_') {
      if (matchDate) {
        const kickoff = new Date(matchDate).getTime()
        const now     = Date.now()
        const oneHour = 60 * 60 * 1000
        if (now >= kickoff - oneHour) {
          return Response.json({ error: 'انتهى وقت التوقع لهذه المباراة' }, { status: 403 })
        }
      }
    }
  } catch (lockErr) {
    console.warn('[predictions] lock check failed (non-blocking):', lockErr.message)
  }

  try {
    // ابحث عن المستخدم في Strapi أو أنشئه
    const usersRes = await strapi.get('/users', {
      params: { filters: { email: { $eq: userEmail } } },
    })
    let strapiUser = usersRes.data?.[0]

    if (!strapiUser) {
      // أنشئ المستخدم في Strapi
      const createRes = await strapi.post('/auth/local/register', {
        username: session.user.name?.replace(/\s+/g, '_') || userEmail.split('@')[0],
        email:    userEmail,
        password: Math.random().toString(36).slice(-12) + 'Aa1!',
      })
      strapiUser = createRes.data.user
    }

    // تحقق هل يوجد توقع سابق
    const existingRes = await strapi.get('/predictions', {
      params: {
        filters: {
          user:    { id: { $eq: strapiUser.id } },
          matchId: { $eq: matchId },
        },
      },
    })
    const existing = existingRes.data.data?.[0]

    if (existing) {
      // تحديث
      const res = await strapi.put(`/predictions/${existing.id}`, {
        data: { homeScore, awayScore },
      })
      return Response.json(res.data.data)
    }

    // إنشاء جديد
    const res = await strapi.post('/predictions', {
      data: {
        user:      strapiUser.id,
        matchId,
        homeScore,
        awayScore,
        homeTeam:  homeTeam || '',
        awayTeam:  awayTeam || '',
        matchDate: matchDate || null,
        points:    0,
        status:    'pending',
      },
    })
    return Response.json(res.data.data)
  } catch (err) {
    console.error('POST prediction error:', err.response?.data || err.message)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
