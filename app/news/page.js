'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

const CATEGORIES = [
  { id: 'all',      label: 'الكل'         },
  { id: 'teams',    label: 'المنتخبات'    },
  { id: 'players',  label: 'اللاعبون'     },
  { id: 'analysis', label: 'تحليلات'      },
  { id: 'wc2026',   label: 'كأس العالم'   },
  { id: 'groups',   label: 'المجموعات'    },
]

const NEWS = [
  {
    id: 1,
    title: 'الأرجنتين تبدأ رحلة الدفاع عن لقبها أمام الجزائر في المجموعة J',
    excerpt: 'يستعد المنتخب الأرجنتيني بقيادة النجم ليونيل ميسي للدفاع عن لقبه في مونديال 2026، حيث سيواجه في مباراته الافتتاحية المنتخب الجزائري.',
    category: 'teams',
    categoryLabel: 'المنتخبات',
    date: '23 أبريل 2026',
    readTime: '3 دقائق',
    emoji: '🇦🇷',
    featured: true,
    tag: 'عاجل',
  },
  {
    id: 2,
    title: 'مبابي يقود فرنسا في أولى مباريات الدفاع عن المركز الثاني',
    excerpt: 'يتطلع كيليان مبابي إلى قيادة المنتخب الفرنسي نحو التتويج بكأس العالم 2026 بعد الوصول إلى النهائي في قطر 2022.',
    category: 'players',
    categoryLabel: 'اللاعبون',
    date: '22 أبريل 2026',
    readTime: '4 دقائق',
    emoji: '🇫🇷',
    featured: false,
    tag: null,
  },
  {
    id: 3,
    title: 'تحليل: هل تكرر البرازيل إنجاز 2002 في كأس العالم 2026؟',
    excerpt: 'يحلل خبراء كرة القدم فرص المنتخب البرازيلي في مونديال 2026 في ظل جيل موهوب بقيادة فينيسيوس جونيور ورودريغو.',
    category: 'analysis',
    categoryLabel: 'تحليلات',
    date: '21 أبريل 2026',
    readTime: '6 دقائق',
    emoji: '🇧🇷',
    featured: false,
    tag: 'تحليل',
  },
  {
    id: 4,
    title: 'كأس العالم 2026: كل ما تريد معرفته عن البطولة التاريخية',
    excerpt: '48 منتخباً في 16 مجموعة، 104 مباريات، 3 دول مضيفة — أمريكا وكندا والمكسيك. تعرف على كل تفاصيل بطولة كأس العالم الأكبر في التاريخ.',
    category: 'wc2026',
    categoryLabel: 'كأس العالم',
    date: '20 أبريل 2026',
    readTime: '8 دقائق',
    emoji: '🏆',
    featured: false,
    tag: 'مميز',
  },
  {
    id: 5,
    title: 'المجموعة C: البرازيل والمغرب في مواجهة النار',
    excerpt: 'تُعدّ المجموعة C من أقوى مجموعات الدور الأول، حيث تجمع البرازيل صاحبة الألقاب الخمسة مع المغرب بطل أفريقيا.',
    category: 'groups',
    categoryLabel: 'المجموعات',
    date: '19 أبريل 2026',
    readTime: '3 دقائق',
    emoji: '⚽',
    featured: false,
    tag: null,
  },
  {
    id: 6,
    title: 'فينيسيوس جونيور: "هدفنا الوحيد هو إعادة الكأس إلى البرازيل"',
    excerpt: 'تحدث نجم ريال مدريد عن طموحاته مع منتخب البرازيل في كأس العالم 2026، مؤكداً أن الجيل الحالي قادر على إحياء أمجاد السيليساو.',
    category: 'players',
    categoryLabel: 'اللاعبون',
    date: '18 أبريل 2026',
    readTime: '4 دقائق',
    emoji: '🌟',
    featured: false,
    tag: null,
  },
  {
    id: 7,
    title: 'ألمانيا تعود بقوة: تحليل شامل للمانشافت في 2026',
    excerpt: 'بعد خيبة الأمل في كأسَي العالم السابقتين، يعود المنتخب الألماني بوجوه شابة وأسلوب لعب جديد يُبشر بمرحلة مختلفة.',
    category: 'analysis',
    categoryLabel: 'تحليلات',
    date: '17 أبريل 2026',
    readTime: '5 دقائق',
    emoji: '🇩🇪',
    featured: false,
    tag: 'تحليل',
  },
  {
    id: 8,
    title: 'الملاعب الأمريكية تستعد لاستقبال كأس العالم: جولة على 16 استاداً',
    excerpt: 'ملعب ميتلايف في نيويورك، سوفي ستاديوم في لوس أنجلوس، أتاتورك بريدجستون في دالاس — تعرف على الملاعب التي ستستضيف مباريات المونديال.',
    category: 'wc2026',
    categoryLabel: 'كأس العالم',
    date: '16 أبريل 2026',
    readTime: '7 دقائق',
    emoji: '🏟️',
    featured: false,
    tag: null,
  },
  {
    id: 9,
    title: 'إسبانيا واليافا: يوتيتشي يقود جيلاً ذهبياً جديداً',
    excerpt: 'يستعد المنتخب الإسباني بقيادة جيل موهوب من الشباب للتنافس على لقب كأس العالم 2026 بعد الفوز بيورو 2024.',
    category: 'teams',
    categoryLabel: 'المنتخبات',
    date: '15 أبريل 2026',
    readTime: '4 دقائق',
    emoji: '🇪🇸',
    featured: false,
    tag: null,
  },
  {
    id: 10,
    title: 'المجموعة J: الأرجنتين في طريق محفوف بالمخاطر',
    excerpt: 'تضم المجموعة J الأرجنتين بطلة العالم والجزائر التي أثبتت قوتها في السنوات الأخيرة، فضلاً عن النمسا والأردن.',
    category: 'groups',
    categoryLabel: 'المجموعات',
    date: '14 أبريل 2026',
    readTime: '3 دقائق',
    emoji: '🗓️',
    featured: false,
    tag: null,
  },
  {
    id: 11,
    title: 'ميسي: "2026 ستكون كأس العالم الأخيرة في مسيرتي"',
    excerpt: 'أكد الأرجنتيني ليونيل ميسي أن بطولة 2026 ستكون آخر مشاركاته في كأس العالم، وأنه يريد تتويج مسيرته بلقب ثانٍ.',
    category: 'players',
    categoryLabel: 'اللاعبون',
    date: '13 أبريل 2026',
    readTime: '5 دقائق',
    emoji: '🐐',
    featured: false,
    tag: 'حصري',
  },
  {
    id: 12,
    title: 'توقعات الخبراء: من سيرفع كأس العالم 2026؟',
    excerpt: 'استطلعنا آراء 20 محللاً وخبيراً في كرة القدم حول أبرز المرشحين للفوز بلقب كأس العالم 2026 في الولايات المتحدة.',
    category: 'analysis',
    categoryLabel: 'تحليلات',
    date: '12 أبريل 2026',
    readTime: '6 دقائق',
    emoji: '📊',
    featured: false,
    tag: 'تحليل',
  },
]

const TAG_COLORS = {
  'عاجل':   'bg-live/20 text-live',
  'مميز':   'bg-gold/20 text-gold',
  'تحليل':  'bg-primary/20 text-primary',
  'حصري':   'bg-green/20 text-green',
}

const CAT_COLORS = {
  'teams':    'bg-primary/10 text-primary',
  'players':  'bg-gold/10 text-gold',
  'analysis': 'bg-green/10 text-green',
  'wc2026':   'bg-live/10 text-live',
  'groups':   'bg-purple-500/10 text-purple-400',
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = NEWS.filter(n => {
    const matchCat = activeCategory === 'all' || n.category === activeCategory
    const matchSearch = !search || n.title.includes(search) || n.excerpt.includes(search)
    return matchCat && matchSearch
  })

  const featured = filtered.find(n => n.featured)
  const rest = filtered.filter(n => !n.featured || search || activeCategory !== 'all')

  return (
    <div>
      <Header title="أخبار كأس العالم" />

      <div className="page-content px-4 py-4">

        {/* Search */}
        <div className="relative mb-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث في الأخبار..."
            className="w-full bg-card border border-border rounded-2xl px-4 py-3 pr-10 text-text text-sm outline-none focus:border-primary transition-colors"
          />
          <span className="absolute right-3 top-3 text-muted text-lg">🔍</span>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 hide-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-muted'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured article */}
        {!search && activeCategory === 'all' && featured && (
          <div className="mb-5">
            <FeaturedCard article={featured} />
          </div>
        )}

        {/* Results or empty */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted">
            <span className="text-4xl block mb-2">📰</span>
            <p className="text-sm">لا توجد أخبار</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(search || activeCategory !== 'all' ? filtered : rest).map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        <p className="text-center text-[10px] text-muted mt-6">
          يتم تحديث الأخبار يومياً · KoraX News
        </p>

      </div>
      <BottomNav />
    </div>
  )
}

// ─── Featured Card ──────────────────────────────────────────────────────────────

function FeaturedCard({ article }) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 p-5">
      <div className="absolute top-0 left-0 w-40 h-40 opacity-10 rounded-full bg-primary blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between mb-3">
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${TAG_COLORS['عاجل']}`}>🔴 عاجل</span>
        <span className="text-4xl">{article.emoji}</span>
      </div>

      <h2 className="text-base font-black text-text leading-snug mb-2">{article.title}</h2>
      <p className="text-xs text-muted leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${CAT_COLORS[article.category]}`}>
            {article.categoryLabel}
          </span>
          <span className="text-[10px] text-muted">{article.date}</span>
        </div>
        <span className="text-[10px] text-muted flex items-center gap-1">
          ⏱ {article.readTime}
        </span>
      </div>
    </div>
  )
}

// ─── Article Card ───────────────────────────────────────────────────────────────

function ArticleCard({ article }) {
  return (
    <div className="card p-4 flex gap-3 active:scale-[0.99] transition-transform cursor-pointer">
      {/* Emoji thumbnail */}
      <div className="w-14 h-14 rounded-2xl bg-card-hover flex items-center justify-center flex-shrink-0">
        <span className="text-3xl">{article.emoji}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${CAT_COLORS[article.category]}`}>
            {article.categoryLabel}
          </span>
          {article.tag && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${TAG_COLORS[article.tag] || 'bg-muted/10 text-muted'}`}>
              {article.tag}
            </span>
          )}
        </div>

        <p className="text-sm font-bold text-text leading-snug line-clamp-2 mb-1.5">
          {article.title}
        </p>

        <div className="flex items-center gap-2 text-[10px] text-muted">
          <span>{article.date}</span>
          <span>·</span>
          <span>⏱ {article.readTime}</span>
        </div>
      </div>
    </div>
  )
}
