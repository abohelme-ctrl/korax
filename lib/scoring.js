/**
 * scoring.js — حساب النقاط الكلية لمستخدم KoraX
 *
 * المصادر:
 * 1. توقعات المباريات     — 3 نقاط (نتيجة دقيقة) | 1 نقطة (فائز صح)
 * 2. ترتيب المجموعات     — 10 نقاط (1st صح) | 5 نقاط (2nd صح)
 * 3. التوقعات الكبرى     — بطل:50 | وصيف:25 | هداف:30 | أفضل:20 | مفاجأة:15
 * 4. التحدي اليومي       — 10 نقاط لكل يوم في السلسلة
 * 5. محاكي البطولة       — 20 نقطة عند الإكمال
 */

// ─── جدول النقاط ──────────────────────────────────────────────────────────────
export const POINTS = {
  // المباريات
  MATCH_EXACT:      3,
  MATCH_WINNER:     1,

  // ترتيب المجموعات
  GROUP_FIRST:     10,
  GROUP_SECOND:     5,

  // الجوائز الكبرى
  AWARD_CHAMPION:  50,
  AWARD_FINALIST:  25,
  AWARD_TOPSCORER: 30,
  AWARD_BESTPLAYER:20,
  AWARD_SURPRISE:  15,

  // أخرى
  QUIZ_PER_DAY:    10,
  SIMULATOR_DONE:  20,
}

// خريطة معرف الجائزة → النقاط
export const AWARD_POINTS_MAP = {
  champion:   POINTS.AWARD_CHAMPION,
  finalist:   POINTS.AWARD_FINALIST,
  topScorer:  POINTS.AWARD_TOPSCORER,
  bestPlayer: POINTS.AWARD_BESTPLAYER,
  surprise:   POINTS.AWARD_SURPRISE,
}

/**
 * getMatchPoints(predictions) — نقاط التوقعات من Strapi
 */
export function getMatchPoints(predictions = []) {
  return predictions
    .filter(p => !String(p.matchId || p.attributes?.matchId || '').startsWith('award_')
              && !String(p.matchId || p.attributes?.matchId || '').startsWith('group_'))
    .reduce((total, p) => total + (p.points ?? p.attributes?.points ?? 0), 0)
}

/**
 * getGroupPredictionPoints(predictions) — نقاط توقعات ترتيب المجموعات
 * النقاط تُحسب فقط بعد انتهاء دور المجموعات وتحديد status='won'
 */
export function getGroupPredictionPoints(predictions = []) {
  return predictions
    .filter(p => String(p.matchId || p.attributes?.matchId || '').startsWith('group_'))
    .reduce((total, p) => total + (p.points ?? p.attributes?.points ?? 0), 0)
}

/**
 * getAwardPredictionPoints(predictions) — نقاط التوقعات الكبرى من Strapi
 * النقاط تُحسب فقط بعد انتهاء البطولة وتحديد status='won'
 */
export function getAwardPredictionPoints(predictions = []) {
  return predictions
    .filter(p => String(p.matchId || p.attributes?.matchId || '').startsWith('award_'))
    .reduce((total, p) => total + (p.points ?? p.attributes?.points ?? 0), 0)
}

/**
 * getAwardPoints() — نقاط التوقعات الكبرى من localStorage (للعرض المحلي)
 */
export function getAwardPoints() {
  try {
    const raw = localStorage.getItem('korax_award_picks')
    if (!raw) return 0
    const picks = JSON.parse(raw)
    const filled = Object.values(picks).filter(v => v && (typeof v === 'object' ? v.id : v.length > 0))
    return filled.length * 5
  } catch { return 0 }
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
  } catch { return 0 }
}

/**
 * getSimulatorPoints() — نقاط محاكي البطولة من localStorage
 */
export function getSimulatorPoints() {
  try {
    const raw = localStorage.getItem('korax_simulator')
    if (!raw) return 0
    const state = JSON.parse(raw)
    return state.phase === 'done' ? POINTS.SIMULATOR_DONE : 0
  } catch { return 0 }
}

/**
 * getTotalPoints(predictions) — المجموع الكلي
 */
export function getTotalPoints(predictions = []) {
  return (
    getMatchPoints(predictions) +
    getGroupPredictionPoints(predictions) +
    getAwardPredictionPoints(predictions) +
    getQuizPoints() +
    getSimulatorPoints()
  )
}

/**
 * getScoreBreakdown(predictions) — تفصيل النقاط
 */
export function getScoreBreakdown(predictions = []) {
  const matchPts     = getMatchPoints(predictions)
  const groupPts     = getGroupPredictionPoints(predictions)
  const awardPts     = getAwardPredictionPoints(predictions)
  const quizPts      = getQuizPoints()
  const simulatorPts = getSimulatorPoints()

  return {
    match:     { label: 'توقعات المباريات',    points: matchPts,     icon: '⚽', max: '—'  },
    groups:    { label: 'ترتيب المجموعات',     points: groupPts,     icon: '📊', max: 180  },
    awards:    { label: 'التوقعات الكبرى',     points: awardPts,     icon: '🏆', max: 140  },
    quiz:      { label: 'التحدي اليومي',       points: quizPts,      icon: '❓', max: '—'  },
    simulator: { label: 'محاكي البطولة',       points: simulatorPts, icon: '🏟️', max: 20   },
    total: matchPts + groupPts + awardPts + quizPts + simulatorPts,
  }
}

/**
 * getRankTitle(totalPoints) — لقب المستخدم بناءً على نقاطه
 */
export function getRankTitle(points) {
  if (points >= 500) return { title: 'بطل المونديال',   icon: '🏆', color: 'text-gold'    }
  if (points >= 300) return { title: 'خبير التوقعات',   icon: '⭐', color: 'text-primary' }
  if (points >= 150) return { title: 'محلل متقدم',      icon: '🔥', color: 'text-live'    }
  if (points >= 50)  return { title: 'متابع نشيط',      icon: '📊', color: 'text-green'   }
  if (points >= 10)  return { title: 'مبتدئ موهوب',     icon: '🌱', color: 'text-muted'   }
  return              { title: 'مشجع جديد',             icon: '👋', color: 'text-muted'   }
}
