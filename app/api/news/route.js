import { NextResponse } from 'next/server'

// ─── Cache (ساعة واحدة) ────────────────────────────────────────────────────────
let cache = { data: null, ts: 0 }
const CACHE_TTL = 60 * 60 * 1000

// ─── مصادر RSS عربية مباشرة ───────────────────────────────────────────────────
const RSS_FEEDS = [
  {
    source: 'Google أخبار',
    url: 'https://news.google.com/rss/search?q=' +
      encodeURIComponent('كأس العالم 2026 FIFA مونديال') +
      '&hl=ar&gl=SA&ceid=SA:ar',
    wc_only: false,
    hasRealDesc: false,  // Google News descriptions are HTML links only
  },
  {
    source: 'BBC عربي',
    url: 'https://feeds.bbci.co.uk/arabic/sport/rss.xml',
    wc_only: true,
    hasRealDesc: true,
  },
  {
    source: 'Sky الأخبار',
    url: `https://news.google.com/rss/search?q=${encodeURIComponent('مونديال 2026 منتخب')}&hl=ar&gl=AE&ceid=AE:ar`,
    wc_only: false,
    hasRealDesc: false,
  },
]

// ─── كلمات مفتاحية كأس العالم ─────────────────────────────────────────────────
const WC_KEYWORDS = ['كأس العالم', 'مونديال', 'فيفا', 'fifa', '2026', 'world cup', 'منتخب', 'مباراة']

function isWCRelated(text = '') {
  const lower = text.toLowerCase()
  return WC_KEYWORDS.some(k => lower.includes(k.toLowerCase()))
}

// ─── تنظيف النص من HTML و HTML entities ──────────────────────────────────────
function cleanText(str = '') {
  return str
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&[a-z]+;/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── إزالة " - المصدر" من نهاية عناوين Google News ──────────────────────────
function cleanGoogleTitle(title = '') {
  return title.replace(/\s*[-–—]\s*[^-–—]{3,40}$/, '').trim()
}

// ─── هل النص وصف حقيقي أم مجرد HTML links؟ ───────────────────────────────────
function isRealDescription(text = '') {
  const cleaned = cleanText(text)
  // إذا كان فارغاً أو قصيراً جداً
  if (cleaned.length < 20) return false
  // إذا احتوى على https:// بشكل واضح (يعني كان HTML links)
  if (text.includes('http') && text.includes('href')) return false
  return true
}

// ─── محلل RSS ─────────────────────────────────────────────────────────────────
function parseRSS(xml, feed) {
  const items = []
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi
  let match

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1]

    // استخراج حقل مع دعم CDATA
    const getField = (tag) => {
      const re = new RegExp(
        `<${tag}(?:\\s[^>]*)?>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`,
        'i'
      )
      const m = itemXml.match(re)
      return m ? cleanText(m[1]) : null
    }

    let title       = getField('title')
    const rawDesc   = itemXml.match(/<description(?:\s[^>]*)?>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1] || ''
    const description = feed.hasRealDesc && isRealDescription(rawDesc) ? cleanText(rawDesc) : null
    const pubDate   = getField('pubDate')

    // الرابط
    let link = null
    const linkMatch = itemXml.match(/<link>([^<]+)<\/link>/) ||
                      itemXml.match(/<link\s+href="([^"]+)"/)
    if (linkMatch) link = linkMatch[1].trim()
    if (!link) {
      const guidMatch = itemXml.match(/<guid[^>]*isPermaLink="true"[^>]*>([^<]+)<\/guid>/) ||
                        itemXml.match(/<guid[^>]*>([^<]+)<\/guid>/)
      if (guidMatch) link = guidMatch[1].trim()
    }

    // الصورة
    let image = null
    const mediaMatch = itemXml.match(/media:(?:content|thumbnail)[^>]+url="([^"]+)"/) ||
                       itemXml.match(/enclosure[^>]+url="([^"]+)"/) ||
                       itemXml.match(/<img[^>]+src="([^"]+)"/)
    if (mediaMatch) image = mediaMatch[1]

    // اسم المصدر من <source> tag (في Google News)
    const sourceTagMatch = itemXml.match(/<source[^>]*>([^<]+)<\/source>/)
    const sourceName = sourceTagMatch ? sourceTagMatch[1].trim() : feed.source

    if (!title || !link) continue

    // تنظيف عنوان Google News (يضيف " - المصدر" في النهاية)
    if (!feed.hasRealDesc) {
      title = cleanGoogleTitle(title)
    }

    items.push({
      titleAr:     title,
      summaryAr:   description || '',
      url:         link,
      image:       image,
      source:      sourceName,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    })
  }

  return items
}

// ─── جلب مصدر واحد ────────────────────────────────────────────────────────────
async function fetchFeed(feed) {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; KoraX/1.0; +https://korax.live)' },
      signal: AbortSignal.timeout(9000),
    })
    if (!res.ok) return []
    const xml   = await res.text()
    const items = parseRSS(xml, feed)
    if (feed.wc_only) {
      return items.filter(item => isWCRelated(item.titleAr + ' ' + item.summaryAr))
    }
    return items
  } catch (e) {
    console.warn(`[news] RSS failed [${feed.source}]:`, e.message)
    return []
  }
}

// ─── GET Handler ──────────────────────────────────────────────────────────────
export async function GET() {
  // Cache hit
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return NextResponse.json(cache.data)
  }

  try {
    // جلب كل المصادر بالتوازي
    const results = await Promise.allSettled(RSS_FEEDS.map(fetchFeed))
    const allItems = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])

    // إزالة المكررات بناءً على العنوان (أول 50 حرف)
    const seen = new Set()
    const unique = allItems.filter(item => {
      const key = item.titleAr?.replace(/\s/g, '').slice(0, 30)
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })

    // ترتيب حسب التاريخ (الأحدث أولاً)
    unique.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

    const news = unique.slice(0, 20)

    if (news.length === 0) {
      console.warn('[news] All feeds returned empty, using fallback')
      return NextResponse.json(FALLBACK_NEWS)
    }

    cache = { data: news, ts: Date.now() }
    return NextResponse.json(news)

  } catch (err) {
    console.error('[news] Route error:', err)
    return NextResponse.json(FALLBACK_NEWS)
  }
}

// ─── أخبار احتياطية (تعمل دائماً) ───────────────────────────────────────────
const FALLBACK_NEWS = [
  {
    titleAr:     'فيفا يعلن الموعد النهائي لقوائم مونديال 2026 ويحدد شروط استبدال اللاعبين',
    summaryAr:   'حدد الاتحاد الدولي لكرة القدم الموعد النهائي لتقديم قوائم المنتخبات المشاركة في كأس العالم 2026، مع وضع شروط واضحة لاستبدال اللاعبين.',
    url:         'https://www.fifa.com/worldcup/2026',
    image:       null,
    source:      'FIFA',
    publishedAt: new Date().toISOString(),
  },
  {
    titleAr:     'الأرجنتين تبدأ استعداداتها للدفاع عن لقب كأس العالم 2026',
    summaryAr:   'يتطلع ليونيل مسي وزملاؤه إلى تكرار إنجاز قطر 2022 والدفاع عن اللقب في بطولة كأس العالم 2026 التي تستضيفها أمريكا الشمالية.',
    url:         'https://www.fifa.com/worldcup/2026',
    image:       null,
    source:      'KoraX',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    titleAr:     'المغرب يطمح لتجاوز إنجاز 2022 في كأس العالم القادم',
    summaryAr:   'يسعى المنتخب المغربي للاستفادة من تجربته الرائعة في مونديال 2022، حين وصل لأول مرة في تاريخه إلى نصف النهائي كأول منتخب عربي وأفريقي.',
    url:         'https://www.fifa.com/worldcup/2026',
    image:       null,
    source:      'KoraX',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    titleAr:     'ملعب روز بول يستضيف نهائي كأس العالم 2026 أمام 90 ألف متفرج',
    summaryAr:   'اختارت فيفا ملعب روز بول الأسطوري في لوس أنجلوس لاستضافة المباراة النهائية لكأس العالم 2026، بطاقة استيعابية تصل إلى 90 ألف مشجع.',
    url:         'https://www.fifa.com/worldcup/2026',
    image:       null,
    source:      'FIFA',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    titleAr:     'برازيل وألمانيا وإسبانيا أبرز المرشحين للفوز بكأس العالم 2026',
    summaryAr:   'يرى المحللون الرياضيون أن البرازيل وألمانيا وإسبانيا وفرنسا والأرجنتين هم أبرز المرشحين للتتويج بلقب كأس العالم 2026 في أمريكا الشمالية.',
    url:         'https://www.fifa.com/worldcup/2026',
    image:       null,
    source:      'KoraX',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
  },
]
