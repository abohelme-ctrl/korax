import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const NEWS_API_KEY   = process.env.NEWS_API_KEY
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY

// Cache in memory (server-side) — 24 ساعة = طلب واحد فقط في اليوم
let cache = { data: null, ts: 0 }
const CACHE_TTL = 24 * 60 * 60 * 1000

export async function GET() {
  // Return cached if fresh
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data)
  }

  if (!NEWS_API_KEY) {
    return NextResponse.json({ error: 'NEWS_API_KEY not set' }, { status: 500 })
  }

  try {
    // ── 1. جلب الأخبار من NewsAPI ──────────────────────────────────────────
    const url = `https://newsapi.org/v2/everything?` + new URLSearchParams({
      q:        '"World Cup 2026" OR "FIFA 2026"',
      language: 'en',
      sortBy:   'publishedAt',
      pageSize: '10',
      apiKey:   NEWS_API_KEY,
    })

    const res      = await fetch(url, { next: { revalidate: 3600 } })
    const json     = await res.json()
    const articles = (json.articles || []).filter(a =>
      a.title && a.description && !a.title.includes('[Removed]')
    )

    // ── 2. تلخيص بالعربي مع Claude (إن كان المفتاح موجوداً) ───────────────
    let news = articles.map(a => ({
      title:       a.title,
      titleAr:     null,
      summaryAr:   a.description,
      url:         a.url,
      image:       a.urlToImage,
      source:      a.source?.name || '',
      publishedAt: a.publishedAt,
    }))

    if (ANTHROPIC_KEY && articles.length > 0) {
      try {
        const client = new Anthropic({ apiKey: ANTHROPIC_KEY })

        // نترجم كل المقالات دفعة واحدة
        const toSummarize = articles
        const prompt = toSummarize.map((a, i) =>
          `${i + 1}. العنوان: ${a.title}\nالوصف: ${a.description}`
        ).join('\n\n')

        const msg = await client.messages.create({
          model:      'claude-haiku-4-5',
          max_tokens: 1600,
          messages: [{
            role:    'user',
            content: `أنت محلل رياضي متخصص في كأس العالم. ترجم هذه الأخبار إلى العربية وقدم ملخصاً موجزاً لكل منها (جملتان فقط بالعربية الفصحى).
أجب بـ JSON array فقط بهذا الشكل بالضبط (${toSummarize.length} عنصر، بدون أي نص خارج الـ JSON):
[{"titleAr":"العنوان بالعربية","summaryAr":"الملخص بالعربية"}]

الأخبار:
${prompt}`,
          }],
        })

        const raw  = msg.content[0].text.trim()
        const json = JSON.parse(raw.match(/\[[\s\S]*\]/)?.[0] || '[]')

        json.forEach((item, i) => {
          if (news[i]) {
            news[i].titleAr   = item.titleAr   || news[i].title
            news[i].summaryAr = item.summaryAr || news[i].summaryAr
          }
        })
      } catch (e) {
        console.error('Claude summarization failed:', e.message)
      }
    }

    cache = { data: news, ts: Date.now() }
    return NextResponse.json(news)

  } catch (err) {
    console.error('News API error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
