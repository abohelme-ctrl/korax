'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

// ─── 16 ملعب رسمي لكأس العالم 2026 ──────────────────────────────────────────
const STADIUMS = [
  // الولايات المتحدة (11)
  {
    id:       1,
    name:     'Rose Bowl',
    nameAr:   'ملعب روز باول',
    city:     'لوس أنجلوس',
    state:    'كاليفورنيا',
    country:  'US',
    capacity: 88_565,
    matches:  6,
    isFinal:  true,
    built:    1922,
    emoji:    '🌹',
    color:    '#EF4444',
    fact:     'سيحتضن النهائي الكبير، استضاف نهائي 1994 أيضاً. أحد أجمل وأعرق ملاعب العالم.',
  },
  {
    id:       2,
    name:     'MetLife Stadium',
    nameAr:   'ملعب ميتلايف',
    city:     'نيوأرك (نيويورك)',
    state:    'نيو جيرسي',
    country:  'US',
    capacity: 82_500,
    matches:  8,
    isFinal:  false,
    built:    2010,
    emoji:    '🗽',
    color:    '#3B82F6',
    fact:     'الأكثر استيعاباً في أمريكا الشمالية، سيحتضن ثماني مباريات من بينها نصف النهائي.',
  },
  {
    id:       3,
    name:     'Estadio Azteca',
    nameAr:   'ملعب الأزتيكا',
    city:     'مكسيكو سيتي',
    state:    'المكسيك الاتحادية',
    country:  'MX',
    capacity: 87_523,
    matches:  5,
    isFinal:  false,
    built:    1966,
    emoji:    '🦅',
    color:    '#10B981',
    fact:     'أيقوني بامتياز. الملعب الوحيد الذي يستضيف ثلاث كؤوس عالم (1970، 1986، 2026). شاهد على أعظم لحظات كرة القدم.',
  },
  {
    id:       4,
    name:     'AT&T Stadium',
    nameAr:   'ملعب AT&T',
    city:     'أرلينغتون، دالاس',
    state:    'تكساس',
    country:  'US',
    capacity: 80_000,
    matches:  6,
    isFinal:  false,
    built:    2009,
    emoji:    '🤠',
    color:    '#8B5CF6',
    fact:     'يُعرف بـ"جيري ورلد"، ملعب فاخر بسقف منزلق وشاشة عرض عملاقة تُعدّ الأكبر في العالم.',
  },
  {
    id:       5,
    name:     'Arrowhead Stadium',
    nameAr:   'ملعب أروهيد',
    city:     'كانساس سيتي',
    state:    'ميزوري',
    country:  'US',
    capacity: 76_416,
    matches:  5,
    isFinal:  false,
    built:    1972,
    emoji:    '⚡',
    color:    '#F59E0B',
    fact:     'الأعلى صخباً في أمريكا، سجّل رقماً قياسياً في صوت الجمهور. جو لا يُوصف.',
  },
  {
    id:       6,
    name:     'NRG Stadium',
    nameAr:   'ملعب NRG',
    city:     'هيوستن',
    state:    'تكساس',
    country:  'US',
    capacity: 72_220,
    matches:  5,
    isFinal:  false,
    built:    2002,
    emoji:    '🚀',
    color:    '#06B6D4',
    fact:     'أول ملعب NFL بسقف منزلق قابل للفتح والإغلاق. هيوستن مدينة الفضاء والتنوع.',
  },
  {
    id:       7,
    name:     'SoFi Stadium',
    nameAr:   'ملعب SoFi',
    city:     'لوس أنجلوس',
    state:    'كاليفورنيا',
    country:  'US',
    capacity: 70_240,
    matches:  6,
    isFinal:  false,
    built:    2020,
    emoji:    '🌴',
    color:    '#EC4899',
    fact:     'الأحدث والأكثر تطوراً. يحتوي سقفاً زجاجياً شفافاً وشاشة عرض ضخمة مُعلّقة بالمنتصف.',
  },
  {
    id:       8,
    name:     'Bank of America Stadium',
    nameAr:   'ملعب بنك أوف أمريكا',
    city:     'شارلوت',
    state:    'كارولاينا الشمالية',
    country:  'US',
    capacity: 74_867,
    matches:  5,
    isFinal:  false,
    built:    1996,
    emoji:    '🌲',
    color:    '#0EA5E9',
    fact:     'ملعب متعدد الاستخدامات في قلب مدينة شارلوت، من أكثر الملاعب الأمريكية حيوية.',
  },
  {
    id:       9,
    name:     'Lincoln Financial Field',
    nameAr:   'ملعب لينكولن',
    city:     'فيلادلفيا',
    state:    'بنسلفانيا',
    country:  'US',
    capacity: 67_594,
    matches:  5,
    isFinal:  false,
    built:    2003,
    emoji:    '🔔',
    color:    '#16A34A',
    fact:     'في مدينة الحرية التاريخية، قريب من موقع الإعلان الأمريكي للاستقلال.',
  },
  {
    id:       10,
    name:     'Gillette Stadium',
    nameAr:   'ملعب جيليت',
    city:     'فوكسبورو، بوسطن',
    state:    'ماساتشوستس',
    country:  'US',
    capacity: 65_878,
    matches:  5,
    isFinal:  false,
    built:    2002,
    emoji:    '🦞',
    color:    '#DC2626',
    fact:     'ملعب نيو إنغلاند باتريوتس الشهير. بوسطن مركز التعليم والثقافة والتاريخ الأمريكي.',
  },
  {
    id:       11,
    name:     'Hard Rock Stadium',
    nameAr:   'ملعب هارد روك',
    city:     'ميامي',
    state:    'فلوريدا',
    country:  'US',
    capacity: 65_326,
    matches:  5,
    isFinal:  false,
    built:    1987,
    emoji:    '🏖️',
    color:    '#F97316',
    fact:     'ميامي، مدينة النجوم والشواطئ. الملعب يستضيف Super Bowl بانتظام.',
  },
  // كندا (3)
  {
    id:       12,
    name:     'BC Place',
    nameAr:   'ملعب BC بليس',
    city:     'فانكوفر',
    state:    'كولومبيا البريطانية',
    country:  'CA',
    capacity: 54_500,
    matches:  5,
    isFinal:  false,
    built:    1983,
    emoji:    '🍁',
    color:    '#DC2626',
    fact:     'استضاف نهائي كأس العالم للسيدات 2015. فانكوفر مدينة خضراء بين المحيط والجبال الثلجية.',
  },
  {
    id:       13,
    name:     'BMO Field',
    nameAr:   'ملعب BMO',
    city:     'تورنتو',
    state:    'أونتاريو',
    country:  'CA',
    capacity: 45_736,
    matches:  5,
    isFinal:  false,
    built:    2007,
    emoji:    '🏙️',
    color:    '#1D4ED8',
    fact:     'ملعب كرة القدم الوحيد في كندا المخصص لهذه الرياضة. تورنتو أكبر مدينة كندية.',
  },
  {
    id:       14,
    name:     'Stade Olympique',
    nameAr:   'الملعب الأولمبي',
    city:     'مونتريال',
    state:    'كيبيك',
    country:  'CA',
    capacity: 61_004,
    matches:  5,
    isFinal:  false,
    built:    1976,
    emoji:    '🗼',
    color:    '#9333EA',
    fact:     'بُني لأولمبياد 1976. مونتريال مدينة ثنائية اللغة (فرنسية-إنجليزية) بطابع أوروبي مميز.',
  },
  // المكسيك (2 إضافي)
  {
    id:       15,
    name:     'Estadio BBVA',
    nameAr:   'ملعب BBVA',
    city:     'مونتيري',
    state:    'نويفو ليون',
    country:  'MX',
    capacity: 53_460,
    matches:  5,
    isFinal:  false,
    built:    2015,
    emoji:    '⛰️',
    color:    '#0284C7',
    fact:     'محاط بجبال سييرا مادرة، يُعدّ من أجمل الملاعب بصرياً في العالم.',
  },
  {
    id:       16,
    name:     'Estadio Akron',
    nameAr:   'ملعب أكرون',
    city:     'غوادالاخارا',
    state:    'خاليسكو',
    country:  'MX',
    capacity: 49_850,
    matches:  5,
    isFinal:  false,
    built:    2010,
    emoji:    '🌺',
    color:    '#059669',
    fact:     'غوادالاخارا مدينة التقاليد المكسيكية، موطن موسيقى المارياتشي والتيكيلا الأصيل.',
  },
]

const COUNTRIES = [
  { id: 'all', label: 'الكل (16)',  flag: '🌍' },
  { id: 'US',  label: 'أمريكا (11)', flag: '🇺🇸' },
  { id: 'CA',  label: 'كندا (3)',    flag: '🇨🇦' },
  { id: 'MX',  label: 'المكسيك (2)', flag: '🇲🇽' },
]

function fmt(n) {
  return n.toLocaleString('ar-SA')
}

// ─── الصفحة ───────────────────────────────────────────────────────────────────
export default function StadiumsPage() {
  const [filter,   setFilter]   = useState('all')
  const [selected, setSelected] = useState(null)

  const visible = filter === 'all' ? STADIUMS : STADIUMS.filter(s => s.country === filter)
  const stadium = selected ? STADIUMS.find(s => s.id === selected) : null

  const totalCapacity = STADIUMS.reduce((a, s) => a + s.capacity, 0)

  return (
    <div>
      <Header title="الملاعب" back />

      <div className="page-content pb-24">

        {/* ─── Hero Stats ─── */}
        <div className="px-4 pt-4 pb-2">
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0F172A, #0F2240)' }}>
            <div className="p-4 flex items-center gap-4">
              <div className="text-center flex-1 border-l border-white/10">
                <p className="text-white font-black text-2xl">16</p>
                <p className="text-blue-300 text-[10px]">ملعب</p>
              </div>
              <div className="text-center flex-1 border-l border-white/10">
                <p className="text-white font-black text-2xl">3</p>
                <p className="text-blue-300 text-[10px]">دول</p>
              </div>
              <div className="text-center flex-1">
                <p className="text-white font-black text-lg">{(totalCapacity / 1000000).toFixed(1)}م</p>
                <p className="text-blue-300 text-[10px]">إجمالي المقاعد</p>
              </div>
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <span className="text-xs bg-white/10 text-white px-2 py-1 rounded-full">🇺🇸 11 ملعب</span>
              <span className="text-xs bg-white/10 text-white px-2 py-1 rounded-full">🇨🇦 3 ملاعب</span>
              <span className="text-xs bg-white/10 text-white px-2 py-1 rounded-full">🇲🇽 2 ملعب</span>
            </div>
          </div>
        </div>

        {/* ─── Filter ─── */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto hide-scrollbar">
          {COUNTRIES.map(c => (
            <button
              key={c.id}
              onClick={() => setFilter(c.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === c.id
                  ? 'bg-primary text-white'
                  : 'bg-card border border-border text-muted'
              }`}
            >
              {c.flag} {c.label}
            </button>
          ))}
        </div>

        {/* ─── Stadiums List ─── */}
        <div className="px-4 space-y-3 pb-4">

          {/* النهائي أولاً */}
          {filter === 'all' && (
            <div
              onClick={() => setSelected(1)}
              className="cursor-pointer active:scale-95 transition-transform rounded-3xl overflow-hidden border-2 border-yellow-500/40"
              style={{ background: 'linear-gradient(135deg, #1A1200, #2D1F00)' }}
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
                    style={{ background: 'rgba(245,158,11,0.15)' }}>
                    🏆
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[10px] bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-bold">ملعب النهائي</span>
                    </div>
                    <p className="font-black text-white text-base">ملعب روز باول</p>
                    <p className="text-yellow-300/70 text-[11px]">🌹 Rose Bowl · لوس أنجلوس، كاليفورنيا 🇺🇸</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-white/60">👥 {fmt(88565)}</span>
                      <span className="text-xs text-white/60">📅 بُني 1922</span>
                      <span className="text-xs text-yellow-400 font-bold">6 مباريات</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {visible.filter(s => !s.isFinal).map(s => (
            <div
              key={s.id}
              onClick={() => setSelected(s.id)}
              className="card cursor-pointer active:scale-95 transition-transform overflow-hidden"
            >
              <div className="flex items-center gap-4 p-4">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `${s.color}20` }}
                >
                  {s.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-black text-text text-sm">{s.nameAr}</p>
                  <p className="text-muted text-[11px] truncate">{s.city}، {s.country === 'US' ? '🇺🇸' : s.country === 'CA' ? '🇨🇦' : '🇲🇽'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted">👥 {fmt(s.capacity)}</span>
                    <span className="text-[10px] font-bold" style={{ color: s.color }}>{s.matches} مباريات</span>
                  </div>
                </div>

                {/* Capacity bar */}
                <div className="flex flex-col items-end gap-1">
                  <div className="w-16 h-1.5 bg-card-hover rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(s.capacity / 90000) * 100}%`, background: s.color }}
                    />
                  </div>
                  <span className="text-[10px] text-muted">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Stadium Detail Modal ─── */}
      {stadium && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="flex-1 bg-black/70 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="bg-bg rounded-t-3xl overflow-hidden max-h-[75vh] overflow-y-auto">

            {/* Header */}
            <div className="relative h-32 flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${stadium.color}30, #0F172A)` }}>
              <span className="text-6xl">{stadium.emoji}</span>
              {stadium.isFinal && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                  🏆 ملعب النهائي
                </div>
              )}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 text-white text-sm flex items-center justify-center"
              >✕</button>
            </div>

            <div className="px-5 pb-8 pt-4">
              <h2 className="font-black text-xl text-text">{stadium.nameAr}</h2>
              <p className="text-primary text-sm mt-0.5">{stadium.name}</p>
              <p className="text-muted text-xs mt-1">
                {stadium.city}، {stadium.state} ·{' '}
                {stadium.country === 'US' ? '🇺🇸 الولايات المتحدة' : stadium.country === 'CA' ? '🇨🇦 كندا' : '🇲🇽 المكسيك'}
              </p>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <StatBox icon="👥" label="السعة" value={fmt(stadium.capacity)} />
                <StatBox icon="⚽" label="المباريات" value={stadium.matches} />
                <StatBox icon="🏗️" label="بُني" value={stadium.built} />
              </div>

              {/* Capacity bar */}
              <div className="mt-4">
                <div className="flex justify-between text-[10px] text-muted mb-1">
                  <span>نسبة السعة مقارنةً بالأكبر</span>
                  <span>{Math.round((stadium.capacity / 90000) * 100)}%</span>
                </div>
                <div className="h-2 bg-card rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(stadium.capacity / 90000) * 100}%`, background: stadium.color }}
                  />
                </div>
              </div>

              {/* Fact */}
              <div className="mt-4 bg-card rounded-2xl p-4">
                <p className="text-[10px] text-primary font-bold mb-2">💡 معلومة</p>
                <p className="text-sm text-text leading-relaxed">{stadium.fact}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

function StatBox({ icon, label, value }) {
  return (
    <div className="card p-3 text-center">
      <p className="text-xl mb-1">{icon}</p>
      <p className="font-black text-text text-sm">{value}</p>
      <p className="text-[9px] text-muted">{label}</p>
    </div>
  )
}
