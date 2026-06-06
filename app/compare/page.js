'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'

// ─── بيانات المنتخبات للمقارنة ────────────────────────────────────────────────
const ALL_TEAMS = [
  // Group A
  { id: '16',   name: 'المكسيك',           flag: '🇲🇽', group: 'A', stars: 0, titles: 0, bestResult: 'ربع النهائي',          confederation: 'كونكاكاف',        coach: 'خافيير أغيري',       rating: 78, players: ['ساندياغو خيمينيز', 'إيدسون ألفاريز', 'أليكسيس فيغا'] },
  { id: '1531', name: 'جنوب أفريقيا',      flag: '🇿🇦', group: 'A', stars: 0, titles: 0, bestResult: 'الدور الأول',          confederation: 'كاف',             coach: 'هيوغو برووس',        rating: 65, players: ['بيرسي تاو', 'رونجين وليامز', 'ثيمبا زوان'] },
  { id: '149',  name: 'كوريا الجنوبية',    flag: '🇰🇷', group: 'A', stars: 0, titles: 0, bestResult: 'نصف النهائي 2002',     confederation: 'الاتحاد الآسيوي', coach: 'هونغ ميونغ-بو',     rating: 76, players: ['سون هيونغ-مين', 'لي كانغ-إن', 'هوانغ هي-تشان'] },
  { id: '798',  name: 'التشيك',            flag: '🇨🇿', group: 'A', stars: 0, titles: 0, bestResult: 'نهائي 1934/1962',     confederation: 'يويفا',            coach: 'إيفان هاشيك',       rating: 74, players: ['باتريك شيك', 'توماش سوسيك', 'آدم هلوجيك'] },
  // Group B
  { id: '101',  name: 'كندا',              flag: '🇨🇦', group: 'B', stars: 0, titles: 0, bestResult: 'الدور الأول',          confederation: 'كونكاكاف',        coach: 'جيسي مارش',          rating: 75, players: ['ألفونسو ديفيز', 'جوناثان ديفيد', 'سيل لاران'] },
  { id: '776',  name: 'البوسنة والهرسك',   flag: '🇧🇦', group: 'B', stars: 0, titles: 0, bestResult: 'الدور الأول 2014',    confederation: 'يويفا',            coach: 'سيرجي باربارز',      rating: 70, players: ['إدين دزيكو', 'أدنان ليايتش', 'ساد كولاشيناك'] },
  { id: '164',  name: 'قطر',               flag: '🇶🇦', group: 'B', stars: 0, titles: 0, bestResult: 'الدور الأول 2022',    confederation: 'الاتحاد الآسيوي', coach: 'لويس غارسيا',       rating: 64, players: ['أكرم عفيف', 'علموز علي', 'مشعل بارشم'] },
  { id: '15',   name: 'سويسرا',            flag: '🇨🇭', group: 'B', stars: 0, titles: 0, bestResult: 'ربع النهائي',          confederation: 'يويفا',            coach: 'مورات ياكين',        rating: 77, players: ['غرانيت جاكا', 'مانويل أكانجي', 'زيكي أمدوني'] },
  // Group C
  { id: '6',    name: 'البرازيل',          flag: '🇧🇷', group: 'C', stars: 5, titles: 5, bestResult: 'بطل (5 مرات)',         confederation: 'كونميبول',        coach: 'دوريفال جونيور',     rating: 87, players: ['فينيسيوس جونيور', 'رافينيا', 'إندريك'] },
  { id: '32',   name: 'المغرب',            flag: '🇲🇦', group: 'C', stars: 0, titles: 0, bestResult: 'نصف النهائي 2022',    confederation: 'كاف',             coach: 'وليد الركراكي',      rating: 78, players: ['أشرف حكيمي', 'ياسين بونو', 'عزيز الدين أوناحي'] },
  { id: '507',  name: 'هايتي',             flag: '🇭🇹', group: 'C', stars: 0, titles: 0, bestResult: 'الدور الأول',          confederation: 'كونكاكاف',        coach: 'مارك كوكيني',        rating: 60, players: ['نايكا إيسلاند', 'دكينز نازون', 'ستيفان بيلوت'] },
  { id: '1108', name: 'اسكتلندا',          flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C', stars: 0, titles: 0, bestResult: 'الدور الأول',          confederation: 'يويفا',            coach: 'ستيف كلارك',         rating: 72, players: ['سكوت ماكتومينا', 'أندي روبرتسون', 'جون ماكغين'] },
  // Group D
  { id: '779',  name: 'باراغواي',          flag: '🇵🇾', group: 'D', stars: 0, titles: 0, bestResult: 'ربع النهائي 2010',    confederation: 'كونميبول',        coach: 'غوستافو كوسيتاس',    rating: 69, players: ['ميغيل ألميرون', 'خوليو إنسيسو', 'غوستافو غوميز'] },
  { id: '25',   name: 'أستراليا',          flag: '🇦🇺', group: 'D', stars: 0, titles: 0, bestResult: 'ربع النهائي 2006',    confederation: 'الاتحاد الآسيوي', coach: 'توني بوبوفيتش',      rating: 72, players: ['ماثيو ليكي', 'ريلي ماكغري', 'ماثيو ريان'] },
  { id: '741',  name: 'تركيا',             flag: '🇹🇷', group: 'D', stars: 0, titles: 0, bestResult: 'المركز الثالث 2002',  confederation: 'يويفا',            coach: 'فينتشنزو مونتيلا',   rating: 77, players: ['هاكان شالهانوغلو', 'أردا غولر', 'كينان يلدز'] },
  // Group E
  { id: '3',    name: 'ألمانيا',           flag: '🇩🇪', group: 'E', stars: 4, titles: 4, bestResult: 'بطل (4 مرات)',         confederation: 'يويفا',            coach: 'يوليان ناغلسمان',    rating: 84, players: ['جامال موسيالا', 'فلوريان فيرتز', 'كاي هافرتز'] },
  { id: '1532', name: 'كوراساو',           flag: '🇨🇼', group: 'E', stars: 0, titles: 0, bestResult: 'أول مشاركة',           confederation: 'كونكاكاف',        coach: 'رياو',               rating: 58, players: ['ليانو باكونا', 'رانجيلو يانغا', 'إيلسون هوي'] },
  { id: '31',   name: 'ساحل العاج',        flag: '🇨🇮', group: 'E', stars: 0, titles: 0, bestResult: 'الدور الأول',          confederation: 'كاف',             coach: 'إيمريك لابورت',      rating: 73, players: ['سيمون عدينغرا', 'سيباستيان هالر', 'إيبراهيم سانغاري'] },
  { id: '57',   name: 'بوليفيا',           flag: '🇧🇴', group: 'E', stars: 0, titles: 0, bestResult: 'الدور الأول',          confederation: 'كونميبول',        coach: 'أنطونيو كارلوس سيما', rating: 61, players: ['مارسيلو مورينو', 'رودريغو راميرو', 'روبرتو فيرنانديز'] },
  // Group F
  { id: '1',    name: 'هولندا',            flag: '🇳🇱', group: 'F', stars: 0, titles: 0, bestResult: 'نهائي (3 مرات)',       confederation: 'يويفا',            coach: 'رونالد كومان',       rating: 83, players: ['فيرجيل فان دايك', 'خافي سيمونز', 'كودي خاكبو'] },
  { id: '2601', name: 'اليابان',           flag: '🇯🇵', group: 'F', stars: 0, titles: 0, bestResult: 'دور الـ16',            confederation: 'الاتحاد الآسيوي', coach: 'هاجيمي موريياسو',    rating: 76, players: ['كاورو ميتوما', 'واتارو إندو', 'تاكيفوسا كوبو'] },
  { id: '744',  name: 'السويد',            flag: '🇸🇪', group: 'F', stars: 0, titles: 0, bestResult: 'نصف النهائي',          confederation: 'يويفا',            coach: 'يون دال توماسون',    rating: 74, players: ['ألكساندر إيزاك', 'ديان كولوسيفسكي', 'فيكتور ليندلوف'] },
  { id: '4601', name: 'تونس',              flag: '🇹🇳', group: 'F', stars: 0, titles: 0, bestResult: 'الدور الأول',          confederation: 'كاف',             coach: 'جلال القادري',       rating: 68, players: ['يوسف مساكني', 'أنيس بن سليمان', 'أيمن الحفناوي'] },
  // Group G
  { id: '26',   name: 'الأرجنتين',         flag: '🇦🇷', group: 'G', stars: 3, titles: 3, bestResult: 'بطل (3 مرات)',         confederation: 'كونميبول',        coach: 'ليونيل سكالوني',     rating: 92, players: ['ليونيل ميسي', 'خوليان ألفاريز', 'إنتسو فيرنانديز'] },
  { id: '21',   name: 'بيرو',              flag: '🇵🇪', group: 'G', stars: 0, titles: 0, bestResult: 'ربع النهائي',          confederation: 'كونميبول',        coach: 'خورخي فوساتي',       rating: 67, players: ['جيانلوكا لاباداولا', 'كريستيان كوفا', 'لويس أدفينكولا'] },
  { id: '112',  name: 'إندونيسيا',         flag: '🇮🇩', group: 'G', stars: 0, titles: 0, bestResult: 'الدور الأول',          confederation: 'الاتحاد الآسيوي', coach: 'باتريك كلايفرت',     rating: 62, players: ['مارسيلينو فيرديناند', 'ستيفان بيلتمان', 'مارتن باييس'] },
  { id: '24',   name: 'نيجيريا',           flag: '🇳🇬', group: 'G', stars: 0, titles: 0, bestResult: 'دور الـ16',            confederation: 'كاف',             coach: 'إيريك تين هاغ',      rating: 72, players: ['فيكتور أوسيمن', 'أديمولا لوكمان', 'كالفين باسي'] },
  // Group H
  { id: '9',    name: 'إسبانيا',           flag: '🇪🇸', group: 'H', stars: 1, titles: 1, bestResult: 'بطل (2010)',            confederation: 'يويفا',            coach: 'لويس دي لا فوينتي',  rating: 87, players: ['لامين يامال', 'بيدري', 'داني أولمو'] },
  { id: '1529', name: 'الكاميرون',         flag: '🇨🇲', group: 'H', stars: 0, titles: 0, bestResult: 'ربع النهائي 1990',    confederation: 'كاف',             coach: 'مارك برويس',         rating: 69, players: ['أندريه أونانا', 'برايان مبوموا', 'كارل توكو إيكامبي'] },
  { id: '23',   name: 'الأوروغواي',        flag: '🇺🇾', group: 'H', stars: 2, titles: 2, bestResult: 'بطل (مرتان)',          confederation: 'كونميبول',        coach: 'مارسيلو بييلسا',     rating: 81, players: ['فيدريكو فالفيردي', 'داروين نونييز', 'رونالد أراوخو'] },
  { id: '66',   name: 'رومانيا',           flag: '🇷🇴', group: 'H', stars: 0, titles: 0, bestResult: 'ربع النهائي 1994',    confederation: 'يويفا',            coach: 'إيدي إيردييانو',     rating: 72, players: ['نيكولاس ستانشيو', 'دينيس دراغوش', 'رازفان مارين'] },
  // Group I
  { id: 'USA',  name: 'الولايات المتحدة',  flag: '🇺🇸', group: 'I', stars: 0, titles: 0, bestResult: 'نصف النهائي 1930',    confederation: 'كونكاكاف',        coach: 'ماوريسيو بوتشيتينو',  rating: 79, players: ['كريستيان بوليسيك', 'ويستون ماكيني', 'تايلر آدامز'] },
  { id: '2',    name: 'فرنسا',             flag: '🇫🇷', group: 'I', stars: 2, titles: 2, bestResult: 'بطل (مرتان)',          confederation: 'يويفا',            coach: 'ديديه ديشان',        rating: 89, players: ['كيليان مبابي', 'أنطوان غريزمان', 'أوريليان تشوامني'] },
  { id: '43',   name: 'البانيا',           flag: '🇦🇱', group: 'I', stars: 0, titles: 0, bestResult: 'أول مشاركة',           confederation: 'يويفا',            coach: 'سيلفينيو',           rating: 64, players: ['أرماندو برويا', 'كريستيان أسلاني', 'إيلسيد هيساي'] },
  { id: '50',   name: 'غينيا',             flag: '🇬🇳', group: 'I', stars: 0, titles: 0, bestResult: 'أول مشاركة',           confederation: 'كاف',             coach: 'ديدييه سيكس',        rating: 63, players: ['سيرو غيراسي', 'مدي بايو', 'نابي كيتا'] },
  // Group J
  { id: '27',   name: 'البرتغال',          flag: '🇵🇹', group: 'J', stars: 0, titles: 0, bestResult: 'المركز الثالث 1966',  confederation: 'يويفا',            coach: 'روبرتو مارتينيز',    rating: 86, players: ['كريستيانو رونالدو', 'برونو فيرنانديز', 'رافاييل لياو'] },
  { id: '141',  name: 'السعودية',          flag: '🇸🇦', group: 'J', stars: 0, titles: 0, bestResult: 'دور الـ16',            confederation: 'الاتحاد الآسيوي', coach: 'هيرفي رونار',        rating: 71, players: ['سالم الدوسري', 'محمد العواجي', 'صالح الشهري'] },
  { id: '60',   name: 'الإكوادور',         flag: '🇪🇨', group: 'J', stars: 0, titles: 0, bestResult: 'دور الـ16 2006',       confederation: 'كونميبول',        coach: 'ليون كاو',           rating: 71, players: ['موسيس كايسيدو', 'إنير فالنسيا', 'خيغسون مينديز'] },
  { id: '110',  name: 'زيمبابوي',          flag: '🇿🇼', group: 'J', stars: 0, titles: 0, bestResult: 'أول مشاركة',           confederation: 'كاف',             coach: 'بالاديكي',           rating: 59, players: ['تينو كاديويري', 'نولادج موسونا', 'كاما بيلياط'] },
  // Group K
  { id: '10',   name: 'إنجلترا',           flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'K', stars: 1, titles: 1, bestResult: 'بطل (1966)',            confederation: 'يويفا',            coach: 'توماس توكيل',        rating: 85, players: ['جود بيلينغهام', 'هاري كيين', 'بوكايو ساكا'] },
  { id: '3001', name: 'كرواتيا',           flag: '🇭🇷', group: 'K', stars: 0, titles: 0, bestResult: 'المركز الثالث (مرتان)', confederation: 'يويفا',           coach: 'زلاتكو داليتش',      rating: 79, players: ['لوكا مودريتش', 'يوشكو غفارديول', 'ماتيو كوفاتشيتش'] },
  { id: '85',   name: 'الدنمارك',          flag: '🇩🇰', group: 'K', stars: 0, titles: 0, bestResult: 'ربع النهائي 1998',    confederation: 'يويفا',            coach: 'كاسبر هيلموند',      rating: 79, players: ['كريستيان إيريكسن', 'راسموس هوليوند', 'أندرياس كريستنسن'] },
  { id: '1530', name: 'فلسطين',            flag: '🇵🇸', group: 'K', stars: 0, titles: 0, bestResult: 'أول مشاركة',           confederation: 'الاتحاد الآسيوي', coach: 'ماكرام دبوب',        rating: 61, players: ['أودي دباغ', 'زكي خالد', 'إبراهيم جبارين'] },
  // Group L
  { id: '36',   name: 'مصر',               flag: '🇪🇬', group: 'L', stars: 0, titles: 0, bestResult: 'الدور الأول',          confederation: 'كاف',             coach: 'هيرتسوغ',            rating: 73, players: ['محمد صلاح', 'مصطفى محمد', 'عمر مرموش'] },
  { id: '33',   name: 'السنغال',           flag: '🇸🇳', group: 'L', stars: 0, titles: 0, bestResult: 'نصف النهائي 2002',    confederation: 'كاف',             coach: 'عليو سيسيه',         rating: 75, players: ['صاديو ماني', 'إسماعيلا سار', 'إيدوار منيدي'] },
  { id: '96',   name: 'الجزائر',           flag: '🇩🇿', group: 'L', stars: 0, titles: 0, bestResult: 'دور الـ16 2014',       confederation: 'كاف',             coach: 'دجامل بلماضي',       rating: 74, players: ['ريان عيط نوري', 'يوسف عطال', 'إسلام سليماني'] },
  { id: '48',   name: 'بلجيكا',            flag: '🇧🇪', group: 'L', stars: 0, titles: 0, bestResult: 'المركز الثالث 2018',  confederation: 'يويفا',            coach: 'دومينيكو تيدسكو',    rating: 82, players: ['كيفن دي بروين', 'روميلو لوكاكو', 'تيبو كورتوا'] },
]

// ─── مكوّن بطاقة اختيار المنتخب ──────────────────────────────────────────────
const GROUPS = 'ABCDEFGHIJKL'.split('')

function TeamPicker({ label, selected, onSelect, exclude }) {
  const [open, setOpen]        = useState(false)
  const [query, setQuery]      = useState('')
  const [groupFilter, setGF]   = useState('all')

  const filtered = ALL_TEAMS.filter(t => {
    if (exclude && t.id === exclude.id) return false
    if (groupFilter !== 'all' && t.group !== groupFilter) return false
    if (!query.trim()) return true
    return t.name.includes(query.trim()) || t.group === query.trim().toUpperCase()
  })

  function close() { setOpen(false); setQuery(''); setGF('all') }

  return (
    <div className="flex-1">
      <p className="text-[10px] text-muted text-center mb-1">{label}</p>
      <button
        onClick={() => setOpen(true)}
        className={`w-full py-3 rounded-2xl text-center font-black transition-all active:scale-95 border-2 ${
          selected
            ? 'bg-primary/10 border-primary/40 text-text'
            : 'bg-card border-border text-muted'
        }`}
      >
        {selected ? (
          <span className="flex items-center justify-center gap-2">
            <span className="text-2xl">{selected.flag}</span>
            <span className="text-sm">{selected.name}</span>
          </span>
        ) : (
          <span className="text-sm">اختر منتخباً</span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={close}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-[480px] bg-card rounded-t-3xl pb-6" onClick={e => e.stopPropagation()}>
            <div className="w-10 h-1 bg-border rounded-full mx-auto mt-3 mb-3" />

            {/* بحث */}
            <div className="px-4 mb-2">
              <input
                autoFocus
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="ابحث باسم المنتخب..."
                className="w-full bg-bg border border-border rounded-2xl px-4 py-3 text-sm text-text placeholder-muted outline-none focus:border-primary"
                dir="rtl"
              />
            </div>

            {/* فلتر المجموعات */}
            <div className="flex gap-1.5 px-4 overflow-x-auto pb-2 mb-2 hide-scrollbar">
              <button
                onClick={() => setGF('all')}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  groupFilter === 'all' ? 'bg-primary text-white' : 'bg-bg border border-border text-muted'
                }`}
              >
                الكل
              </button>
              {GROUPS.map(g => (
                <button
                  key={g}
                  onClick={() => setGF(g)}
                  className={`flex-shrink-0 w-7 h-7 rounded-lg text-[10px] font-bold transition-all ${
                    groupFilter === g ? 'bg-primary text-white' : 'bg-bg border border-border text-muted'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            {/* قائمة المنتخبات */}
            <div className="overflow-y-auto max-h-64 px-4 space-y-1">
              {filtered.length === 0 && (
                <p className="text-center text-muted text-sm py-6">لا توجد نتائج</p>
              )}
              {filtered.map(team => (
                <button
                  key={team.id}
                  onClick={() => { onSelect(team); close() }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl active:bg-card-hover hover:bg-card-hover transition-colors"
                >
                  <span className="text-2xl">{team.flag}</span>
                  <div className="text-right flex-1">
                    <span className="text-sm font-bold text-text">{team.name}</span>
                    <span className="text-[10px] text-muted block">المجموعة {team.group} · {team.confederation}</span>
                  </div>
                  {team.titles > 0 && (
                    <span className="text-gold text-xs font-black">{team.titles}×🏆</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── مكوّن صف مقارنة ──────────────────────────────────────────────────────────
function CompareRow({ label, valA, valB, higherIsBetter = true, isText = false }) {
  const numA = parseFloat(valA)
  const numB = parseFloat(valB)
  const aWins = !isText && !isNaN(numA) && !isNaN(numB) && (higherIsBetter ? numA > numB : numA < numB)
  const bWins = !isText && !isNaN(numA) && !isNaN(numB) && (higherIsBetter ? numB > numA : numB < numA)

  return (
    <div className="flex items-center gap-2 py-3 border-b border-border last:border-b-0">
      <div className={`flex-1 text-center text-sm font-black ${aWins ? 'text-primary' : bWins ? 'text-muted' : 'text-text'}`}>
        {aWins && <span className="text-primary text-xs ml-1">✓</span>}
        {valA}
      </div>
      <div className="w-28 text-center text-[10px] text-muted flex-shrink-0">{label}</div>
      <div className={`flex-1 text-center text-sm font-black ${bWins ? 'text-primary' : aWins ? 'text-muted' : 'text-text'}`}>
        {bWins && <span className="text-primary text-xs mr-1">✓</span>}
        {valB}
      </div>
    </div>
  )
}

// ─── مكوّن شريط التقييم ───────────────────────────────────────────────────────
function RatingBar({ teamA, teamB }) {
  if (!teamA || !teamB) return null
  const total  = teamA.rating + teamB.rating
  const pctA   = Math.round((teamA.rating / total) * 100)
  const pctB   = 100 - pctA

  return (
    <div className="card p-4">
      <p className="text-xs text-muted text-center mb-3">تقييم القوة الإجمالية</p>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{teamA.flag}</span>
        <div className="flex-1 h-3 rounded-full overflow-hidden bg-card-hover flex">
          <div className="h-full bg-primary rounded-r-full transition-all" style={{ width: `${pctA}%` }} />
          <div className="h-full bg-live rounded-l-full transition-all" style={{ width: `${pctB}%` }} />
        </div>
        <span className="text-lg">{teamB.flag}</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-primary font-black">{teamA.rating}</span>
        <span className="text-muted text-[10px]">{pctA}% — {pctB}%</span>
        <span className="text-live font-black">{teamB.rating}</span>
      </div>
    </div>
  )
}

// ─── الصفحة الرئيسية ──────────────────────────────────────────────────────────
export default function ComparePage() {
  const [teamA, setTeamA] = useState(null)
  const [teamB, setTeamB] = useState(null)

  const bothSelected = teamA && teamB

  function swapTeams() {
    setTeamA(teamB)
    setTeamB(teamA)
  }

  return (
    <div>
      <Header back title="مقارنة المنتخبات" />

      <div className="page-content px-4 py-4 space-y-4 pb-24">

        {/* ─── اختيار المنتخبين ─── */}
        <div className="card p-4">
          <p className="text-xs text-muted text-center mb-3">اختر منتخبين لمقارنتهما</p>
          <div className="flex items-end gap-3">
            <TeamPicker label="المنتخب الأول"  selected={teamA} onSelect={setTeamA} exclude={teamB} />

            <button
              onClick={swapTeams}
              className="mb-1 w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-card-hover border border-border active:scale-95 transition-transform"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-muted">
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <TeamPicker label="المنتخب الثاني" selected={teamB} onSelect={setTeamB} exclude={teamA} />
          </div>
        </div>

        {/* ─── placeholder قبل الاختيار ─── */}
        {!bothSelected && (
          <div className="card p-10 text-center">
            <span className="text-4xl block mb-3">⚡</span>
            <p className="font-black text-text mb-1">قارن بين أي منتخبين</p>
            <p className="text-xs text-muted">اختر منتخبين من الأعلى لترى مقارنة شاملة بينهما</p>
          </div>
        )}

        {/* ─── نتائج المقارنة ─── */}
        {bothSelected && (
          <>
            {/* Header المنتخبين */}
            <div className="card p-4">
              <div className="flex items-center">
                <Link href={`/nation/${teamA.id}`} className="flex-1 flex flex-col items-center gap-1 active:scale-95 transition-transform">
                  <span className="text-5xl">{teamA.flag}</span>
                  <span className="font-black text-sm text-text text-center">{teamA.name}</span>
                  <span className="text-[10px] text-muted">المجموعة {teamA.group}</span>
                  {teamA.titles > 0 && (
                    <span className="text-gold text-xs font-black">{'⭐'.repeat(teamA.titles)}</span>
                  )}
                </Link>
                <div className="flex flex-col items-center gap-1 px-4">
                  <span className="text-xl font-black text-muted">vs</span>
                  {teamA.rating !== teamB.rating && (
                    <span className="text-[10px] text-muted">
                      {teamA.rating > teamB.rating ? teamA.name : teamB.name} أقوى
                    </span>
                  )}
                </div>
                <Link href={`/nation/${teamB.id}`} className="flex-1 flex flex-col items-center gap-1 active:scale-95 transition-transform">
                  <span className="text-5xl">{teamB.flag}</span>
                  <span className="font-black text-sm text-text text-center">{teamB.name}</span>
                  <span className="text-[10px] text-muted">المجموعة {teamB.group}</span>
                  {teamB.titles > 0 && (
                    <span className="text-gold text-xs font-black">{'⭐'.repeat(teamB.titles)}</span>
                  )}
                </Link>
              </div>
            </div>

            {/* شريط التقييم */}
            <RatingBar teamA={teamA} teamB={teamB} />

            {/* ─── جدول المقارنة ─── */}
            <div className="card overflow-hidden">
              <div className="px-4 py-3 bg-card-hover border-b border-border">
                <p className="font-black text-sm text-text text-center">مقارنة تفصيلية</p>
              </div>
              <div className="px-4">
                <CompareRow
                  label="ألقاب كأس العالم"
                  valA={teamA.titles > 0 ? `${teamA.titles} 🏆` : 'لا يوجد'}
                  valB={teamB.titles > 0 ? `${teamB.titles} 🏆` : 'لا يوجد'}
                  higherIsBetter
                  isText
                />
                <CompareRow
                  label="التقييم العالمي"
                  valA={teamA.rating}
                  valB={teamB.rating}
                  higherIsBetter
                />
                <CompareRow
                  label="أفضل نتيجة"
                  valA={teamA.bestResult}
                  valB={teamB.bestResult}
                  isText
                />
                <CompareRow
                  label="الكونفيدرالية"
                  valA={teamA.confederation}
                  valB={teamB.confederation}
                  isText
                />
                <CompareRow
                  label="المدرب"
                  valA={teamA.coach}
                  valB={teamB.coach}
                  isText
                />
                <CompareRow
                  label="المجموعة"
                  valA={`المجموعة ${teamA.group}`}
                  valB={`المجموعة ${teamB.group}`}
                  isText
                />
              </div>
            </div>

            {/* ─── اللاعبون البارزون ─── */}
            <div className="grid grid-cols-2 gap-3">
              {[teamA, teamB].map((team, idx) => (
                <div key={team.id} className="card p-3">
                  <p className="text-[10px] text-muted mb-2 text-center">
                    {team.flag} أبرز اللاعبين
                  </p>
                  <div className="space-y-1.5">
                    {team.players.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 ${
                          i === 0 ? 'bg-gold/20 text-gold' : 'bg-card-hover text-muted'
                        }`}>{i + 1}</span>
                        <span className="text-text font-medium truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/nation/${team.id}`}
                    className="mt-3 block text-center text-[10px] text-primary font-bold"
                  >
                    عرض التفاصيل ←
                  </Link>
                </div>
              ))}
            </div>

            {/* ─── الحكم النهائي ─── */}
            <div className={`card p-4 border-2 ${teamA.rating > teamB.rating ? 'border-primary/30 bg-primary/5' : teamB.rating > teamA.rating ? 'border-live/30 bg-live/5' : 'border-border'}`}>
              <p className="text-xs text-muted text-center mb-1">التقييم الكلي</p>
              {teamA.rating === teamB.rating ? (
                <p className="font-black text-text text-center">تكافؤ تام بين المنتخبين!</p>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl">
                    {teamA.rating > teamB.rating ? teamA.flag : teamB.flag}
                  </span>
                  <div className="text-center">
                    <p className="font-black text-text text-sm">
                      {teamA.rating > teamB.rating ? teamA.name : teamB.name}
                    </p>
                    <p className="text-[10px] text-muted">يتفوق بـ {Math.abs(teamA.rating - teamB.rating)} نقطة</p>
                  </div>
                </div>
              )}
            </div>

            {/* ─── توقع المباراة ─── */}
            <div className="card p-4 text-center">
              <p className="text-xs text-muted mb-2">توقع لو التقيا في كأس العالم</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-3xl">{teamA.flag}</span>
                <Link
                  href="/predict"
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-black active:scale-95 transition-transform"
                >
                  توقع النتيجة
                </Link>
                <span className="text-3xl">{teamB.flag}</span>
              </div>
            </div>
          </>
        )}

      </div>

      <BottomNav />
    </div>
  )
}
