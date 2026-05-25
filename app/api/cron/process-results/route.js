/**
 * GET /api/cron/process-results
 *
 * يُشغَّل تلقائياً كل 30 دقيقة عبر Vercel Cron.
 * يمكن أيضاً تشغيله يدوياً من لوحة الإدارة.
 *
 * يعالج ثلاثة أنواع:
 *  1. نتائج المباريات (FT/AET/PEN) → نقاط الفائز/النتيجة الدقيقة
 *  2. ترتيب المجموعات (بعد اكتمال كل مجموعة) → نقاط الأول/الثاني
 *  3. جوائز البطولة (بطل + وصيف + هداف) → من API-Football تلقائياً
 */

import axios from 'axios'
import { POINTS } from '@/lib/scoring'

// ─── ENV ──────────────────────────────────────────────────────────────────────
const STRAPI_URL        = process.env.NEXT_PUBLIC_STRAPI_URL  || 'http://localhost:1337'
const STRAPI_TOKEN      = process.env.STRAPI_API_TOKEN
const API_KEY           = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY
const API_BASE          = process.env.NEXT_PUBLIC_API_FOOTBALL_BASE || 'https://v3.football.api-sports.io'
const WC_LEAGUE         = Number(process.env.NEXT_PUBLIC_WC_LEAGUE_ID) || 1
const WC_SEASON         = Number(process.env.NEXT_PUBLIC_WC_SEASON)    || 2026
const CRON_SECRET       = process.env.CRON_SECRET

const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN'])

// ─── Clients ──────────────────────────────────────────────────────────────────
const strapi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${STRAPI_TOKEN}` },
})

const apif = axios.create({
  baseURL: API_BASE,
  headers: { 'x-apisports-key': API_KEY },
})

// ─── خريطة الأسماء العربية ────────────────────────────────────────────────────
const AR = {
  'Mexico':'المكسيك','South Africa':'جنوب أفريقيا','South Korea':'كوريا الجنوبية',
  'Czech Republic':'التشيك','Canada':'كندا','Bosnia & Herzegovina':'البوسنة والهرسك',
  'Qatar':'قطر','Switzerland':'سويسرا','Brazil':'البرازيل','Morocco':'المغرب',
  'Haiti':'هايتي','Scotland':'اسكتلندا','USA':'الولايات المتحدة','Paraguay':'باراغواي',
  'Australia':'أستراليا','Türkiye':'تركيا','Germany':'ألمانيا','Curaçao':'كوراساو',
  'Ivory Coast':'ساحل العاج','Ecuador':'الإكوادور','Netherlands':'هولندا',
  'Japan':'اليابان','Sweden':'السويد','Tunisia':'تونس','Belgium':'بلجيكا',
  'Egypt':'مصر','Iran':'إيران','New Zealand':'نيوزيلندا','Spain':'إسبانيا',
  'Cape Verde Islands':'الرأس الأخضر','Saudi Arabia':'السعودية','Uruguay':'أوروغواي',
  'France':'فرنسا','Senegal':'السنغال','Iraq':'العراق','Norway':'النرويج',
  'Argentina':'الأرجنتين','Algeria':'الجزائر','Austria':'النمسا','Jordan':'الأردن',
  'Portugal':'البرتغال','Colombia':'كولومبيا','Uzbekistan':'أوزبكستان',
  'Congo DR':'الكونغو','England':'إنجلترا','Croatia':'كرواتيا',
  'Ghana':'غانا','Panama':'بنما',
}
const toAr = name => AR[name] || name

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dateStr(offsetDays = 0) {
  const d = new Date(); d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

/** جلب توقعات pending لـ matchId معين (كل الصفحات) */
async function fetchPending(matchId) {
  let all = [], page = 1
  while (true) {
    const res = await strapi.get('/predictions', {
      params: {
        filters: { matchId: { $eq: String(matchId) }, status: { $eq: 'pending' } },
        pagination: { page, pageSize: 100 },
      },
    })
    const batch = res.data.data || []
    all = all.concat(batch)
    if (batch.length === 0 || all.length >= (res.data.meta?.pagination?.total || 0)) break
    page++
  }
  return all
}

/** تحديث نقاط توقع واحد */
async function updatePred(predId, pts, status, extra = {}) {
  await strapi.put(`/predictions/${predId}`, { data: { points: pts, status, ...extra } })
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. معالجة نتائج المباريات
// ══════════════════════════════════════════════════════════════════════════════
async function processMatches() {
  const results = []
  const dates   = [dateStr(-1), dateStr(0)]

  for (const date of dates) {
    let fixtures = []
    try {
      const res = await apif.get('/fixtures', {
        params: { league: WC_LEAGUE, season: WC_SEASON, date },
      })
      fixtures = (res.data?.response || []).filter(f => FINISHED_STATUSES.has(f.fixture.status.short))
    } catch { continue }

    for (const f of fixtures) {
      const matchId = String(f.fixture.id)
      const aHome   = f.goals.home ?? 0
      const aAway   = f.goals.away ?? 0

      const preds = await fetchPending(matchId)
      if (preds.length === 0) continue

      let exact = 0, winner = 0, wrong = 0

      for (const pred of preds) {
        const pHome = pred.attributes?.homeScore ?? pred.homeScore ?? null
        const pAway = pred.attributes?.awayScore ?? pred.awayScore ?? null
        if (pHome === null || pAway === null) continue

        let pts = 0, status = 'wrong'
        if (pHome === aHome && pAway === aAway) {
          pts = POINTS.MATCH_EXACT; status = 'exact'; exact++
        } else {
          const pw = pHome > pAway ? 'home' : pAway > pHome ? 'away' : 'draw'
          const rw = aHome > aAway ? 'home' : aAway > aHome ? 'away' : 'draw'
          if (pw === rw) { pts = POINTS.MATCH_WINNER; status = 'won'; winner++ }
          else wrong++
        }
        await updatePred(pred.id, pts, status, { actualHomeScore: aHome, actualAwayScore: aAway })
      }

      results.push({ type: 'match', matchId, homeScore: aHome, awayScore: aAway,
        total: preds.length, exact, winner, wrong })
    }
  }
  return results
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. معالجة ترتيب المجموعات
// ══════════════════════════════════════════════════════════════════════════════
async function processGroupStandings() {
  const results = []

  let standings = []
  try {
    const res = await apif.get('/standings', {
      params: { league: WC_LEAGUE, season: WC_SEASON },
    })
    standings = res.data?.response?.[0]?.league?.standings || []
  } catch { return results }

  for (const group of standings) {
    if (!group || group.length < 2) continue

    // هل كل فرق المجموعة لعبت مبارياتها الثلاث؟
    const allDone = group.every(entry => entry.all.played >= 3)
    if (!allDone) continue

    // الترتيب مرتّب بالفعل من API (الأول أولاً)
    const first  = toAr(group[0].team.name)
    const second = toAr(group[1].team.name)
    const grpId  = (group[0].group || '').replace('Group ', '') // 'A'..'L'
    if (!grpId) continue

    // معالجة المركز الأول
    const preds1st = await fetchPending(`group_${grpId}_1st`)
    if (preds1st.length > 0) {
      let correct = 0
      for (const pred of preds1st) {
        const picked = (pred.attributes?.homeTeam || pred.homeTeam || '').trim()
        const ok     = picked.toLowerCase() === first.toLowerCase()
        await updatePred(pred.id, ok ? POINTS.GROUP_FIRST : 0, ok ? 'won' : 'wrong')
        if (ok) correct++
      }
      results.push({ type: 'group', group: grpId, slot: '1st', actualTeam: first,
        total: preds1st.length, correct, wrong: preds1st.length - correct })
    }

    // معالجة المركز الثاني
    const preds2nd = await fetchPending(`group_${grpId}_2nd`)
    if (preds2nd.length > 0) {
      let correct = 0
      for (const pred of preds2nd) {
        const picked = (pred.attributes?.homeTeam || pred.homeTeam || '').trim()
        const ok     = picked.toLowerCase() === second.toLowerCase()
        await updatePred(pred.id, ok ? POINTS.GROUP_SECOND : 0, ok ? 'won' : 'wrong')
        if (ok) correct++
      }
      results.push({ type: 'group', group: grpId, slot: '2nd', actualTeam: second,
        total: preds2nd.length, correct, wrong: preds2nd.length - correct })
    }
  }
  return results
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. معالجة جوائز البطولة
// ══════════════════════════════════════════════════════════════════════════════
async function processTournamentAwards() {
  const results = []

  // ─── 3a. البطل والوصيف — من نتيجة النهائي ──────────────────────────────────
  try {
    const res = await apif.get('/fixtures', {
      params: { league: WC_LEAGUE, season: WC_SEASON, round: 'Final' },
    })
    const finals = res.data?.response || []
    const final  = finals.find(f => FINISHED_STATUSES.has(f.fixture.status.short))

    if (final) {
      // الفائز في النهائي = البطل، الخاسر = الوصيف
      const aHome = final.goals.home ?? 0
      const aAway = final.goals.away ?? 0

      let championEn, finalistEn
      if (aHome > aAway) {
        championEn = final.teams.home.name; finalistEn = final.teams.away.name
      } else if (aAway > aHome) {
        championEn = final.teams.away.name; finalistEn = final.teams.home.name
      } else {
        // تحديد الفائز في ركلات الترجيح من الأحداث (مؤقتاً نأخذ الفريق الذي تأهل)
        championEn = final.teams.home.winner ? final.teams.home.name : final.teams.away.name
        finalistEn = final.teams.home.winner ? final.teams.away.name : final.teams.home.name
      }

      const champion = toAr(championEn)
      const finalist = toAr(finalistEn)

      for (const [awardId, actualTeam, pts] of [
        ['champion', champion, POINTS.AWARD_CHAMPION],
        ['finalist', finalist, POINTS.AWARD_FINALIST],
      ]) {
        const preds = await fetchPending(`award_${awardId}`)
        if (preds.length === 0) continue
        let correct = 0
        for (const pred of preds) {
          const picked = (pred.attributes?.homeTeam || pred.homeTeam || '').trim()
          const ok     = picked.toLowerCase() === actualTeam.toLowerCase()
          await updatePred(pred.id, ok ? pts : 0, ok ? 'won' : 'wrong')
          if (ok) correct++
        }
        results.push({ type: 'award', awardId, actualValue: actualTeam,
          total: preds.length, correct, wrong: preds.length - correct })
      }
    }
  } catch (e) {
    console.warn('[cron] champion/finalist error:', e.message)
  }

  // ─── 3b. هداف البطولة — من API topscorers ────────────────────────────────────
  try {
    const predsTS = await fetchPending('award_topScorer')
    if (predsTS.length > 0) {
      const res = await apif.get('/players/topscorers', {
        params: { league: WC_LEAGUE, season: WC_SEASON },
      })
      const top = res.data?.response?.[0]
      if (top) {
        const topName = top.player?.name || ''
        let correct   = 0
        for (const pred of predsTS) {
          const picked = (pred.attributes?.homeTeam || pred.homeTeam || '').trim()
          const ok     = picked.toLowerCase() === topName.toLowerCase()
          await updatePred(pred.id, ok ? POINTS.AWARD_TOPSCORER : 0, ok ? 'won' : 'wrong')
          if (ok) correct++
        }
        results.push({ type: 'award', awardId: 'topScorer', actualValue: topName,
          total: predsTS.length, correct, wrong: predsTS.length - correct })
      }
    }
  } catch (e) {
    console.warn('[cron] topScorer error:', e.message)
  }

  // ملاحظة: bestPlayer وsurprise يحتاجان إدخالاً يدوياً من الأدمن
  // لأنهما قرار لجنة FIFA وليسا رقمياً قابلاً للاستخراج

  return results
}

// ══════════════════════════════════════════════════════════════════════════════
// Handler الرئيسي
// ══════════════════════════════════════════════════════════════════════════════
async function runAll() {
  const [matchResults, groupResults, awardResults] = await Promise.allSettled([
    processMatches(),
    processGroupStandings(),
    processTournamentAwards(),
  ])

  return {
    matches: matchResults.status  === 'fulfilled' ? matchResults.value  : [],
    groups:  groupResults.status  === 'fulfilled' ? groupResults.value  : [],
    awards:  awardResults.status  === 'fulfilled' ? awardResults.value  : [],
    errors: [
      matchResults.status === 'rejected' ? matchResults.reason?.message : null,
      groupResults.status === 'rejected' ? groupResults.reason?.message : null,
      awardResults.status === 'rejected' ? awardResults.reason?.message : null,
    ].filter(Boolean),
  }
}

export async function GET(req) {
  // التحقق من السر
  if (CRON_SECRET) {
    const auth = req.headers.get('authorization') || ''
    const q    = new URL(req.url).searchParams.get('secret') || ''
    if (auth !== `Bearer ${CRON_SECRET}` && q !== CRON_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  if (!API_KEY || API_KEY === 'your_api_football_key_here') {
    return Response.json({ message: 'API_FOOTBALL_KEY غير مضبوط', ok: false })
  }

  try {
    const data = await runAll()
    const totalUpdated =
      data.matches.reduce((s, r) => s + r.total, 0) +
      data.groups.reduce((s, r)  => s + r.total, 0) +
      data.awards.reduce((s, r)  => s + r.total, 0)

    return Response.json({
      ok: true,
      timestamp: new Date().toISOString(),
      totalPredictionsUpdated: totalUpdated,
      processedMatches: data.matches.length,
      processedGroups:  data.groups.length,
      processedAwards:  data.awards.length,
      matches: data.matches,
      groups:  data.groups,
      awards:  data.awards,
      errors:  data.errors,
    })
  } catch (err) {
    console.error('[cron/process-results]', err.message)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export { GET as POST }
