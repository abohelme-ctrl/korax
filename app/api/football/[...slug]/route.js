/**
 * Proxy route — يُمرّر طلبات API-Football عبر السيرفر
 * الـ API key لا يظهر في المتصفح
 */

const API_KEY  = process.env.API_FOOTBALL_KEY                                  // مفتاح آمن — سيرفر فقط
const BASE_URL = process.env.NEXT_PUBLIC_API_FOOTBALL_BASE || 'https://v3.football.api-sports.io'

export async function GET(req, { params }) {
  try {
    const slug   = (await params).slug?.join('/') || ''
    const search = new URL(req.url).search
    const url    = `${BASE_URL}/${slug}${search}`

    const res = await fetch(url, {
      headers: {
        'x-apisports-key': API_KEY,
        'Content-Type':    'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      return Response.json({ error: 'upstream error', status: res.status }, { status: res.status })
    }

    const data = await res.json()
    return Response.json(data)
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
