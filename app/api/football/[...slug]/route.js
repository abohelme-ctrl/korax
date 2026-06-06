/**
 * Proxy route — يُمرّر طلبات API-Football عبر السيرفر
 * الـ API key لا يظهر في المتصفح أبداً
 */

const API_KEY  = process.env.API_FOOTBALL_KEY
const BASE_URL = process.env.NEXT_PUBLIC_API_FOOTBALL_BASE || 'https://v3.football.api-sports.io'

export async function GET(req, { params }) {
  // ── لا مفتاح → لا نكشف سبب الخطأ ────────────────────────────────────────
  if (!API_KEY) {
    return Response.json({ error: 'service unavailable' }, { status: 503 })
  }

  try {
    const slug   = (await params).slug?.join('/') || ''
    const search = new URL(req.url).search
    const url    = `${BASE_URL}/${slug}${search}`

    const res = await fetch(url, {
      headers: {
        'x-apisports-key': API_KEY,   // يُرسل للسيرفر الخارجي فقط، لا يعود للمتصفح
        'Content-Type':    'application/json',
      },
      cache: 'no-store',
    })

    // ── خطأ من API-Football ────────────────────────────────────────────────
    if (!res.ok) {
      // نُرجع status فقط بدون أي تفاصيل داخلية
      return Response.json(
        { error: 'upstream error' },
        { status: res.status >= 500 ? 502 : res.status }
      )
    }

    const data = await res.json()
    return Response.json(data)

  } catch {
    // ── خطأ شبكة أو غير ذلك — لا نكشف err.message أبداً ────────────────
    return Response.json({ error: 'service unavailable' }, { status: 503 })
  }
}
