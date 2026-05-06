'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

// ─── بنك أسئلة كأس العالم (30 سؤال) ─────────────────────────────────────────
const QUESTIONS = [
  {
    q:    'كم مرة فازت البرازيل بكأس العالم؟',
    opts: ['3 مرات', '4 مرات', '5 مرات', '6 مرات'],
    ans:  2,
    fact: 'البرازيل هي الأكثر تتويجاً في التاريخ بـ5 ألقاب: 1958، 1962، 1970، 1994، 2002.',
  },
  {
    q:    'من فاز بكأس العالم الأول عام 1930؟',
    opts: ['البرازيل', 'الأرجنتين', 'أوروغواي', 'إيطاليا'],
    ans:  2,
    fact: 'أوروغواي استضافت وتوّجت ببطولة 1930 على أرضها، وهي أول كأس عالم في التاريخ.',
  },
  {
    q:    'في أي دولة أُقيم كأس العالم 2022؟',
    opts: ['الإمارات', 'قطر', 'السعودية', 'البحرين'],
    ans:  1,
    fact: 'قطر 2022 كانت أول بطولة عالمية في الشرق الأوسط وأول دولة عربية تستضيفها.',
  },
  {
    q:    'من هو الهداف التاريخي لكأس العالم؟',
    opts: ['رونالدو البرازيلي', 'ميرسلاف كلوزه', 'بيليه', 'روني'],
    ans:  1,
    fact: 'ميرسلاف كلوزه الألماني سجل 16 هدفاً في 4 بطولات (2002-2014)، رقم قياسي تاريخي.',
  },
  {
    q:    'كم دولة ستشارك في كأس العالم 2026؟',
    opts: ['32 دولة', '36 دولة', '48 دولة', '64 دولة'],
    ans:  2,
    fact: 'كأس العالم 2026 سيشهد توسعاً تاريخياً من 32 إلى 48 منتخباً للمرة الأولى.',
  },
  {
    q:    'أي منتخب يُعرف بـ "الديكة"؟',
    opts: ['البرتغال', 'إيطاليا', 'فرنسا', 'بلجيكا'],
    ans:  2,
    fact: 'فرنسا تُعرف بـ"الديكة" (Les Bleus) وفازت بكأس العالم مرتين: 1998 و2018.',
  },
  {
    q:    'من كان أفضل لاعب في كأس العالم 2022؟',
    opts: ['كيليان مبابي', 'إيميلياتو مارتينيز', 'ليونيل ميسي', 'لوكا مودريتش'],
    ans:  2,
    fact: 'ليونيل ميسي حمل الكرة الذهبية في قطر 2022 مُتوِّجاً مسيرة بطولية رائعة.',
  },
  {
    q:    'في أي عام فازت إسبانيا بكأس العالم للمرة الأولى؟',
    opts: ['2006', '2010', '2014', '2018'],
    ans:  1,
    fact: 'إسبانيا تتوّجت بكأس العالم عام 2010 في جنوب أفريقيا بهدف وحيد لفيلا ضد هولندا.',
  },
  {
    q:    'كم هدفاً سجّل مبابي في نهائي كأس العالم 2022؟',
    opts: ['هدف واحد', 'هدفان', '3 أهداف', '4 أهداف'],
    ans:  2,
    fact: 'مبابي سجّل هاتريك رائعاً في نهائي قطر لكن فرنسا خسرت بركلات الترجيح للأرجنتين.',
  },
  {
    q:    'أي منتخب أفريقي وصل لنصف النهائي في قطر 2022؟',
    opts: ['مصر', 'السنغال', 'المغرب', 'نيجيريا'],
    ans:  2,
    fact: 'المغرب كتب التاريخ بوصوله لنصف النهائي 2022، أول منتخب أفريقي وعربي يبلغ هذا الدور.',
  },
  {
    q:    'من فاز بالحذاء الذهبي في كأس العالم 2018؟',
    opts: ['ليونيل ميسي', 'كريستيانو رونالدو', 'هاري كين', 'أنطوان غريزمان'],
    ans:  2,
    fact: 'هاري كين سجل 6 أهداف في روسيا 2018 وحمل الحذاء الذهبي رغم خروج إنجلترا من نصف النهائي.',
  },
  {
    q:    'كم دولة تستضيف كأس العالم 2026؟',
    opts: ['دولة واحدة', 'دولتان', '3 دول', '4 دول'],
    ans:  2,
    fact: 'كأس العالم 2026 يُستضاف مشتركاً بين الولايات المتحدة وكندا والمكسيك للمرة الأولى في التاريخ.',
  },
  {
    q:    'ما شعار كأس العالم 2026؟',
    opts: ['We Are 26', 'United We Play', 'Win as One', 'The Beautiful Game'],
    ans:  0,
    fact: 'شعار كأس العالم 2026 هو "We Are 26" احتفاءً بالعام واتحاد 3 دول مضيفة.',
  },
  {
    q:    'من قاد فرنسا للفوز بكأس العالم مرتين — لاعباً ومدرباً؟',
    opts: ['ريمون دومنيك', 'لوران بلان', 'ديديه ديشان', 'جاك سانتيني'],
    ans:  2,
    fact: 'ديديه ديشان الإنجاز النادر: فاز بكأس العالم لاعباً عام 1998 ومدرباً عام 2018.',
  },
  {
    q:    'أي منتخب يُعرف بـ "أسود الصحراء"؟',
    opts: ['المغرب', 'تونس', 'الجزائر', 'نيجيريا'],
    ans:  2,
    fact: 'الجزائر تُعرف بـ"محاربو الصحراء" أو "الفنيق الأخضر"، وتوّجت ببطولة أمم أفريقيا 2019.',
  },
  {
    q:    'أي ملعب سيحتضن نهائي كأس العالم 2026؟',
    opts: ['ملعب MetLife', 'ملعب AT&T', 'ملعب Rose Bowl', 'ملعب SoFi'],
    ans:  2,
    fact: 'Rose Bowl في لوس أنجلوس سيحتضن نهائي كأس العالم 2026 أمام 90,000 متفرج.',
  },
  {
    q:    'كم منتخباً شارك في كأس العالم 1930؟',
    opts: ['8 منتخبات', '13 منتخباً', '16 منتخباً', '24 منتخباً'],
    ans:  1,
    fact: 'شاركت 13 منتخباً فقط في أول كأس عالم بالتاريخ عام 1930 في أوروغواي.',
  },
  {
    q:    'من هو الحارس الحائز على القفاز الذهبي في قطر 2022؟',
    opts: ['دومينيك ليفاكوفيتش', 'إيميلياتو مارتينيز', 'ياسين بونو', 'هوغو لوريس'],
    ans:  1,
    fact: 'إيميلياتو مارتينيز حارس الأرجنتين أبدع في ركلات الترجيح وحصد القفاز الذهبي.',
  },
  {
    q:    'ماذا يُسمّى الكأس الأصلي المُهدى لـ FIFA من بريطانيا؟',
    opts: ['كأس ويمبلي', 'كأس جول ريمي', 'كأس النيكي', 'كأس التتويج'],
    ans:  1,
    fact: 'كأس جول ريمي (Jules Rimet) هو الاسم الأصلي للكأس قبل إعادة تصميمه عام 1974.',
  },
  {
    q:    'أي دولة استضافت كأس العالم مرتين؟',
    opts: ['البرازيل', 'المكسيك', 'ألمانيا', 'كل ما سبق'],
    ans:  3,
    fact: 'البرازيل (1950, 2014)، المكسيك (1970, 1986)، وألمانيا (1974 غرب, 2006) استضافت كل منهم مرتين.',
  },
  {
    q:    'ما عدد أهداف مباراة النهائي الأعلى تسجيلاً في تاريخ كأس العالم؟',
    opts: ['5 أهداف', '6 أهداف', '7 أهداف', '8 أهداف'],
    ans:  1,
    fact: 'نهائي 2022 بين الأرجنتين وفرنسا (3-3 + ركلات) هو الأكثر أهدافاً في نهائيات كأس العالم.',
  },
  {
    q:    'من فاز بكأس العالم 1966 في إنجلترا؟',
    opts: ['ألمانيا', 'البرازيل', 'إنجلترا', 'إيطاليا'],
    ans:  2,
    fact: 'إنجلترا فازت بكأس العالم 1966 على أرضها بهدفين في الوقت الإضافي ضد ألمانيا الغربية.',
  },
  {
    q:    'كم مجموعة يتضمن كأس العالم 2026؟',
    opts: ['8 مجموعات', '10 مجموعات', '12 مجموعة', '16 مجموعة'],
    ans:  2,
    fact: 'كأس العالم 2026 يتضمن 12 مجموعة من 4 منتخبات، ويتأهل أفضل 32 منتخباً للدور التالي.',
  },
  {
    q:    'من هو الأصغر سناً في تسجيل هدف بكأس العالم؟',
    opts: ['بيليه', 'فانسان كومباني', 'ليونيل ميسي', 'كيليان مبابي'],
    ans:  0,
    fact: 'بيليه سجّل هدفاً وهو في الـ17 من عمره في كأس العالم 1958، ليصبح أصغر هداف في تاريخ البطولة.',
  },
  {
    q:    'ما اسم الجائزة الممنوحة لأفضل لاعب في كأس العالم؟',
    opts: ['الحذاء الذهبي', 'القفاز الذهبي', 'الكرة الذهبية', 'النجمة الذهبية'],
    ans:  2,
    fact: 'الكرة الذهبية (Golden Ball) هي جائزة أفضل لاعب، والحذاء الذهبي للهداف، والقفاز للحارس.',
  },
  {
    q:    'كم ضربة جزاء ركلت الأرجنتين في نهائي 2022 لتفوز؟',
    opts: ['3', '4', '5', '6'],
    ans:  1,
    fact: 'الأرجنتين فازت 4-2 في ركلات الترجيح بعد التعادل 3-3 مع فرنسا.',
  },
  {
    q:    'من هو المدرب الذي أوصل المغرب لنصف النهائي 2022؟',
    opts: ['هيرفي رينار', 'وليد الركراكي', 'عبد الحق بنيس', 'بادو الزاكي'],
    ans:  1,
    fact: 'وليد الركراكي قاد المغرب في إنجاز تاريخي وصولاً لنصف نهائي كأس العالم 2022.',
  },
  {
    q:    'أي منتخب تغلّب على ألمانيا 7-1 في كأس العالم 2014؟',
    opts: ['الأرجنتين', 'البرازيل', 'كولومبيا', 'هولندا'],
    ans:  1,
    fact: 'البرازيل خسرت بشكل مذهل 1-7 أمام ألمانيا في نصف نهائي 2014 على أرضها، مباراة دخلت التاريخ.',
  },
  {
    q:    'من أحرز هدف الفوز في نهائي كأس العالم 2010؟',
    opts: ['إنيستا', 'بييا', 'سيلفا', 'توريس'],
    ans:  0,
    fact: 'أندريس إنيستا سجّل هدف الفوز في الدقيقة 116 لإسبانيا ضد هولندا في نهائي 2010.',
  },
  {
    q:    'ما أكثر منتخب فاز بلقب كأس الأمم الأفريقية؟',
    opts: ['المغرب', 'مصر', 'كاميرون', 'نيجيريا'],
    ans:  1,
    fact: 'مصر فازت ببطولة كأس الأمم الأفريقية 8 مرات، أكثر من أي منتخب آخر.',
  },
]

const LS_KEY_ANS   = 'korax_quiz_ans'
const LS_KEY_STREAK = 'korax_quiz_streak'

function getTodayStr() {
  return new Date().toISOString().slice(0, 10)
}

function getDayQuestion() {
  const day = Math.floor(Date.now() / 86400000) // أيام منذ epoch
  return QUESTIONS[day % QUESTIONS.length]
}

// ─── الصفحة ───────────────────────────────────────────────────────────────────
export default function QuizPage() {
  const [question]    = useState(getDayQuestion)
  const [selected,  setSelected]  = useState(null)   // index المختار
  const [answered,  setAnswered]  = useState(false)
  const [correct,   setCorrect]   = useState(false)
  const [streak,    setStreak]    = useState(0)
  const [showFact,  setShowFact]  = useState(false)
  const [timeLeft,  setTimeLeft]  = useState('')

  // تحميل الحالة المحفوظة
  useEffect(() => {
    const today   = getTodayStr()
    const saved   = localStorage.getItem(LS_KEY_ANS)
    const streakData = JSON.parse(localStorage.getItem(LS_KEY_STREAK) || '{"streak":0,"last":""}')
    setStreak(streakData.streak)

    if (saved) {
      const { date, idx, wasCorrect } = JSON.parse(saved)
      if (date === today) {
        setSelected(idx)
        setAnswered(true)
        setCorrect(wasCorrect)
        setShowFact(true)
      }
    }
  }, [])

  // عداد للسؤال القادم
  useEffect(() => {
    function calcNext() {
      const now      = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)
      const diff = tomorrow - now
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`)
    }
    calcNext()
    const t = setInterval(calcNext, 1000)
    return () => clearInterval(t)
  }, [])

  function handleAnswer(idx) {
    if (answered) return
    const today   = getTodayStr()
    const isRight = idx === question.ans

    setSelected(idx)
    setAnswered(true)
    setCorrect(isRight)
    setShowFact(true)

    // حفظ الإجابة
    localStorage.setItem(LS_KEY_ANS, JSON.stringify({ date: today, idx, wasCorrect: isRight }))

    // تحديث السلسلة
    const streakData = JSON.parse(localStorage.getItem(LS_KEY_STREAK) || '{"streak":0,"last":""}')
    const yesterday  = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yStr = yesterday.toISOString().slice(0, 10)
    const newStreak = (streakData.last === yStr || streakData.last === today)
      ? (isRight ? streakData.streak + 1 : 0)
      : (isRight ? 1 : 0)
    const newData = { streak: newStreak, last: today }
    localStorage.setItem(LS_KEY_STREAK, JSON.stringify(newData))
    setStreak(newStreak)
  }

  const optColors = (idx) => {
    if (!answered) return 'bg-card border-border text-text hover:border-primary/50'
    if (idx === question.ans) return 'bg-green-500/20 border-green-500 text-green-400'
    if (idx === selected && idx !== question.ans) return 'bg-red-500/20 border-red-500 text-red-400'
    return 'bg-card border-border text-muted opacity-50'
  }

  return (
    <div>
      <Header title="التحدي اليومي" back />

      <div className="page-content pb-24 px-4">

        {/* ─── Hero ─── */}
        <div className="mt-4 rounded-3xl overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #0F172A, #1E1B4B)' }}>
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #818CF8, transparent)', transform: 'translate(30%,-30%)' }} />
          <div className="p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-indigo-300 text-[11px] font-bold tracking-wider">سؤال اليوم</p>
                <p className="text-white font-black text-lg mt-0.5">التحدي اليومي ⚡</p>
              </div>
              {streak > 0 && (
                <div className="flex flex-col items-center bg-white/10 rounded-2xl px-3 py-2">
                  <span className="text-2xl">🔥</span>
                  <span className="text-white font-black text-sm">{streak}</span>
                  <span className="text-indigo-300 text-[9px]">سلسلة</span>
                </div>
              )}
            </div>
            {answered && (
              <div className="flex items-center gap-2 text-[11px] text-indigo-300">
                <span>⏳</span>
                <span>السؤال القادم بعد: <span className="font-black text-white">{timeLeft}</span></span>
              </div>
            )}
          </div>
        </div>

        {/* ─── السؤال ─── */}
        <div className="mt-4 card p-5">
          <p className="text-base font-black text-text leading-relaxed text-center mb-5">
            {question.q}
          </p>

          <div className="space-y-2.5">
            {question.opts.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={answered}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-right transition-all active:scale-95 font-bold text-sm ${optColors(idx)}`}
              >
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black flex-shrink-0 ${
                  !answered ? 'bg-card-hover text-muted' :
                  idx === question.ans ? 'bg-green-500 text-white' :
                  idx === selected ? 'bg-red-500 text-white' :
                  'bg-card-hover text-muted'
                }`}>
                  {answered
                    ? idx === question.ans ? '✓' : idx === selected ? '✗' : String.fromCharCode(65 + idx)
                    : String.fromCharCode(65 + idx)
                  }
                </span>
                <span className="flex-1">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ─── نتيجة + معلومة ─── */}
        {answered && (
          <div className={`mt-4 card p-4 border-2 ${correct ? 'border-green-500/40 bg-green-500/5' : 'border-red-500/40 bg-red-500/5'}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{correct ? '🎉' : '😅'}</span>
              <div>
                <p className={`font-black text-base ${correct ? 'text-green-400' : 'text-red-400'}`}>
                  {correct ? 'إجابة صحيحة! ممتاز' : 'للأسف ليست الإجابة الصحيحة'}
                </p>
                {correct && streak > 1 && (
                  <p className="text-[11px] text-green-400/70">🔥 سلسلة {streak} أيام متتالية!</p>
                )}
              </div>
            </div>
            <div className="bg-bg/60 rounded-2xl p-3">
              <p className="text-[11px] text-muted font-bold mb-1">💡 هل تعلم؟</p>
              <p className="text-sm text-text leading-relaxed">{question.fact}</p>
            </div>
          </div>
        )}

        {/* ─── إحصائيات ─── */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="card p-4 text-center">
            <p className="text-3xl mb-1">🔥</p>
            <p className="font-black text-xl text-text">{streak}</p>
            <p className="text-[10px] text-muted">يوم متتالي</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-3xl mb-1">📅</p>
            <p className="font-black text-xl text-text">{QUESTIONS.length}</p>
            <p className="text-[10px] text-muted">سؤال في المجموعة</p>
          </div>
        </div>

        {/* ─── رابط المحاكي ─── */}
        <Link href="/predict"
          className="mt-4 flex items-center gap-3 card p-4 active:scale-95 transition-transform">
          <span className="text-2xl">🏆</span>
          <div className="flex-1">
            <p className="font-black text-sm text-text">جرّب توقعاتك الكبرى</p>
            <p className="text-[11px] text-muted">من ستتوج بكأس العالم 2026؟</p>
          </div>
          <span className="text-primary">←</span>
        </Link>

      </div>
      <BottomNav />
    </div>
  )
}
