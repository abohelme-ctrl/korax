'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0)  return `منذ ${d} ${d === 1 ? 'يوم' : 'أيام'}`
  if (h > 0)  return `منذ ${h} ${h === 1 ? 'ساعة' : 'ساعات'}`
  if (m > 0)  return `منذ ${m} دقيقة`
  return 'الآن'
}

export default function NewsPage() {
  const [news, setNews]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  async function loadNews(force = false) {
    try {
      force ? setRefreshing(true) : setLoading(true)
      setError(null)
      const res  = await fetch('/api/news')
      if (!res.ok) throw new Error('فشل تحميل الأخبار')
      const data = await res.json()
      if (Array.isArray(data)) setNews(data)
      else throw new Error(data.error || 'خطأ غير معروف')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadNews() }, [])

  return (
    <div>
      <Header title="أخبار كأس العالم" />

      <div className="page-content px-4 py-4">

        {/* AI badge + refresh */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20 flex-1 ml-2">
            <span className="text-base">🤖</span>
            <p className="text-xs text-primary font-bold">ملخصات بالذكاء الاصطناعي · تتجدد كل ساعة</p>
          </div>
          <button
            onClick={() => loadNews(true)}
            disabled={refreshing}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-card border border-border active:scale-90 transition-transform flex-shrink-0"
          >
            <span className={`text-base ${refreshing ? 'animate-spin inline-block' : ''}`}>🔄</span>
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            <div className="card h-56 animate-pulse"><div className="h-full bg-card-hover rounded-2xl" /></div>
            {[1, 2, 3].map(i => (
              <div key={i} className="card h-24 animate-pulse"><div className="h-full bg-card-hover rounded-2xl" /></div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center gap-3 py-16 text-muted">
            <span className="text-5xl">📡</span>
            <p className="text-sm font-medium text-center">{error}</p>
            <button
              onClick={() => loadNews()}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-bold active:scale-95 transition-transform"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && news.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-muted">
            <span className="text-5xl">📰</span>
            <p className="text-sm">لا توجد أخبار حالياً</p>
          </div>
        )}

        {/* News list */}
        {!loading && !error && news.length > 0 && (
          <div className="space-y-3">
            <NewsCardFeatured article={news[0]} />
            {news.slice(1).map((article, i) => (
              <NewsCard key={i} article={article} />
            ))}
          </div>
        )}

        {!loading && (
          <p className="text-center text-[10px] text-muted mt-4 pb-2">
            المصدر: NewsAPI · الملخصات: Claude AI (Anthropic)
          </p>
        )}

      </div>

      <BottomNav />
    </div>
  )
}

// ─── Featured Card (أول خبر كبير) ─────────────────────────────────────────────

function NewsCardFeatured({ article }) {
  if (!article) return null
  const title   = article.titleAr   || article.title   || ''
  const summary = article.summaryAr || ''

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block card overflow-hidden active:scale-[0.98] transition-transform"
    >
      {article.image && (
        <div className="w-full h-44 overflow-hidden bg-card-hover">
          <img
            src={article.image}
            alt={title}
            className="w-full h-full object-cover"
            onError={e => { e.target.parentElement.style.display = 'none' }}
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {article.source}
          </span>
          <span className="text-[10px] text-muted">{timeAgo(article.publishedAt)}</span>
          <span className="mr-auto text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded-full font-bold">🤖 AI</span>
        </div>
        <h2 className="font-black text-text text-sm leading-snug mb-2 line-clamp-3">{title}</h2>
        {summary && <p className="text-xs text-muted leading-relaxed line-clamp-3">{summary}</p>}
        <div className="mt-3 flex items-center gap-1 text-primary text-xs font-bold">
          <span>اقرأ المزيد</span>
          <span>←</span>
        </div>
      </div>
    </a>
  )
}

// ─── Regular Card ──────────────────────────────────────────────────────────────

function NewsCard({ article }) {
  const title   = article.titleAr   || article.title   || ''
  const summary = article.summaryAr || ''

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 card p-3 active:scale-[0.98] transition-transform"
    >
      {article.image ? (
        <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-card-hover">
          <img
            src={article.image}
            alt={title}
            className="w-full h-full object-cover"
            onError={e => { e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:1.5rem">📰</div>' }}
          />
        </div>
      ) : (
        <div className="w-20 h-20 rounded-xl bg-card-hover flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">📰</span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[9px] font-bold text-primary truncate max-w-[80px]">{article.source}</span>
          <span className="text-[9px] text-muted">· {timeAgo(article.publishedAt)}</span>
          <span className="mr-auto text-[9px] text-gold">🤖</span>
        </div>
        <h3 className="text-xs font-black text-text leading-snug line-clamp-2 mb-1">{title}</h3>
        {summary && <p className="text-[10px] text-muted leading-relaxed line-clamp-2">{summary}</p>}
      </div>
    </a>
  )
}
