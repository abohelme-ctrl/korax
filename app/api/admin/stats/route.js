/**
 * GET /api/admin/stats
 * إحصائيات الموقع للوحة الإدارة
 */

import axios from 'axios'

const STRAPI_URL   = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN
const ADMIN_SECRET = process.env.ADMIN_SECRET

const strapi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${STRAPI_TOKEN}` },
})

function todayISO()     { return new Date().toISOString().slice(0, 10) }
function weekAgoISO()   { const d = new Date(); d.setDate(d.getDate() - 7);  return d.toISOString() }
function monthAgoISO()  { const d = new Date(); d.setDate(d.getDate() - 30); return d.toISOString() }

export async function GET(req) {
  const secret = req.headers.get('x-admin-secret') || new URL(req.url).searchParams.get('secret')
  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return Response.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const today     = todayISO()
    const weekAgo   = weekAgoISO()
    const monthAgo  = monthAgoISO()

    // ─── جلب كل الإحصائيات بالتوازي ──────────────────────────────────────────
    const [
      usersAll,
      usersGoogle,
      usersToday,
      usersWeek,
      predsAll,
      predsToday,
      predsResolved,
      groupsAll,
      topUsers,
    ] = await Promise.allSettled([
      // كل المستخدمين
      strapi.get('/users', { params: { 'pagination[pageSize]': 1, 'pagination[page]': 1 } }),
      // مسجّلون بـ Google
      strapi.get('/users', { params: { 'filters[provider][$eq]': 'google', 'pagination[pageSize]': 1 } }),
      // مسجّلون اليوم
      strapi.get('/users', { params: { 'filters[createdAt][$gte]': `${today}T00:00:00.000Z`, 'pagination[pageSize]': 100 } }),
      // مسجّلون آخر 7 أيام
      strapi.get('/users', { params: { 'filters[createdAt][$gte]': weekAgo, 'pagination[pageSize]': 1 } }),
      // كل التوقعات
      strapi.get('/predictions', { params: { 'pagination[pageSize]': 1 } }),
      // توقعات اليوم
      strapi.get('/predictions', { params: { 'filters[createdAt][$gte]': `${today}T00:00:00.000Z`, 'pagination[pageSize]': 1 } }),
      // توقعات محسوبة (won/exact/wrong)
      strapi.get('/predictions', { params: { 'filters[status][$ne]': 'pending', 'pagination[pageSize]': 1 } }),
      // كل المجموعات
      strapi.get('/friend-groups', { params: { 'pagination[pageSize]': 1 } }),
      // أفضل 5 مستخدمين بالنقاط
      strapi.get('/users', { params: {
        'pagination[pageSize]': 5,
        'sort': 'createdAt:desc',
        'populate': 'predictions',
      }}),
    ])

    // استخراج الأرقام بأمان
    const get = (result, path) => {
      if (result.status !== 'fulfilled') return 0
      try {
        return path.split('.').reduce((o, k) => o?.[k], result.value.data) ?? 0
      } catch { return 0 }
    }

    const totalUsers    = get(usersAll,      'meta.pagination.total')    || usersAll.value?.data?.length || 0
    const googleUsers   = get(usersGoogle,   'meta.pagination.total')    || 0
    const todayUsers    = usersToday.status === 'fulfilled' ? (usersToday.value?.data?.length || 0) : 0
    const weekUsers     = get(usersWeek,     'meta.pagination.total')    || 0
    const totalPreds    = get(predsAll,      'meta.pagination.total')    || 0
    const todayPreds    = get(predsToday,    'meta.pagination.total')    || 0
    const resolvedPreds = get(predsResolved, 'meta.pagination.total')    || 0
    const totalGroups   = get(groupsAll,     'meta.pagination.total')    || 0

    // أحدث المسجّلين اليوم
    const newUsersToday = usersToday.status === 'fulfilled'
      ? (usersToday.value?.data || []).map(u => ({
          id:       u.id,
          name:     u.username || u.email?.split('@')[0] || 'مستخدم',
          email:    u.email,
          provider: u.provider || 'email',
          joined:   u.createdAt,
        }))
      : []

    return Response.json({
      ok: true,
      timestamp: new Date().toISOString(),
      users: {
        total:        totalUsers,
        google:       googleUsers,
        email:        totalUsers - googleUsers,
        newToday:     todayUsers,
        newThisWeek:  weekUsers,
        list:         newUsersToday,
      },
      predictions: {
        total:    totalPreds,
        today:    todayPreds,
        resolved: resolvedPreds,
        pending:  totalPreds - resolvedPreds,
      },
      groups: {
        total: totalGroups,
      },
    })
  } catch (err) {
    console.error('[admin/stats]', err.message)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
