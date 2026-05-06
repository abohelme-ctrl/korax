/**
 * scoring.js — حساب النقاط الكلية لمستخدم KoraX
 *
 * المصادر:
 * 1. توقعات المباريات (Strapi) — من API /api/predictions
 * 2. التحدي اليومي — korax_quiz_streak في localStorage
 * 3. التوقعات الكبرى — korax_award_picks في localStorage
 * 4. محاكي البطولة — korax_simulator في localStorage
 */

// ─── نقاط ثابتة ───────────────────────────────────────────────────────────────
const POINTS = {
  MATCH_EXACT:     3,   // توقع النتيجة الدقيقة
  MATCH_WINNER:    1,   // توقع الفائز فقط
  QUIZ_PER_DAY:   10,   // نقاط لكل يوم في السلسلة
  AWARD_PER_PICK:  5,   // لكل توقع كبرى مختار
  SIMULATOR_DONE: 20,   // إتمام محاكي البطولة كاملاً
}

/**
 * getMatchPoints(predictions) — نقاط التوقعات من Strapi
 * @param {Array} predictions — من fetch('/api/predictions')
 */
export function getMatchPoints(predictions = []) {
  return predictions.reduce((total, p) => {
    const pts = p.points ?? p.attributes?.points ?? 0
    return total + pts
  }, 0)
}

/**
 * getQuizPoints() — نقاط التحدي اليومي من localStorage
 */
export function getQuizPoints() {
  try {
    const raw = localStorage.getItem('korax_quiz_streak')
    if (!raw) return 0
    const { streak } = JSON.parse(raw)
    return (streak || 0) * POINTS.QUIZ_PER_DAY
  } catch {
    return 0
  }
}

/**
 * getAwardPoints() — نقاط التوقعات الكبرى من localStorage
 */
export function getAwardPoints() {
  try {
    const raw = localStorage.getItem('korax_award_picks')
    if (!raw) return 0
    const picks = JSON.parse(raw)
    // كل توقع مختار (غير فارغ) = AWARD_PER_PICK نقطة
    const filled = Object.values(picks).filter(v => v && (typeof v === 'object' ? v.id : v.length > 0))
    return filled.length * POINTS.AWARD_PER_PICK
  } catch {
    return 0
  }
}

/**
 * getSimulatorPoints() — نقاط محاكي البطولة من localStorage
 */
export function getSimulatorPoints() {
  try {
    const raw = localStorage.getItem('korax_simulator')
    if (!raw) return 0
    const state = JSON.parse(raw)
    // يُعدّ مكتملاً إذا وصل لمرحلة 'done'
    return state.phase === 'done' ? POINTS.SIMULATOR_DONE : 0
  } catch {
    return 0
  }
}

/**
 * getTotalPoints(predictions) — المجموع الكلي
 * @param {Array} predictions — من API (اختياري)
 */
export function getTotalPoints(predictions = []) {
  return (
    getMatchPoints(predictions) +
    getQuizPoints() +
    getAwardPoints() +
    getSimulatorPoints()
  )
}

/**
 * getScoreBreakdown(predictions) — تفصيل النقاط
 * مفيد لعرض لوحة النقاط للمستخدم
 */
export function getScoreBreakdown(predictions = []) {
  const matchPts     = getMatchPoints(predictions)
  const quizPts      = getQuizPoints()
  const awardPts     = getAwardPoints()
  const simulatorPts = getSimulatorPoints()

  return {
    match:     { label: 'توقعات المباريات',  points: matchPts,     icon: '⚽' },
    quiz:      { label: 'التحدي اليومي',     points: quizPts,      icon: '❓' },
    awards:    { label: 'التوقعات الكبرى',   points: awardPts,     icon: '🏆' },
    simulator: { label: 'محاكي البطولة',     points: simulatorPts, icon: '🏟️' },
    total:     matchPts + quizPts + awardPts + simulatorPts,
  }
}

/**
 * getRankTitle(totalPoints) — لقب المستخدم بناءً على نقاطه
 */
export function getRankTitle(points) {
  if (points >= 500) return { title: 'بطل المونديال',   icon: '🏆', color: 'text-gold'    }
  if (points >= 200) return { title: 'خبير التوقعات',   icon: '⭐', color: 'text-primary' }
  if (points >= 100) return { title: 'محلل متقدم',     icon: '🔥', color: 'text-live'    }
  if (points >= 50)  return { title: 'متابع نشيط',     icon: '📊', color: 'text-green'   }
  if (points >= 10)  return { title: 'مبتدئ موهوب',    icon: '🌱', color: 'text-muted'   }
  return              { title: 'مشجع جديد',            icon: '👋', color: 'text-muted'   }
}

export { POINTS }
