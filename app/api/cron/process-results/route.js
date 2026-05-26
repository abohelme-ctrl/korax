/**
 * GET /api/cron/process-results
 *
 * يُشغَّل تلقائياً كل 30 دقيقة عبر Vercel Cron.
 * يمكن أيضاً تشغيله يدوياً من لوحة الإدارة.
 *
 * الإصلاحات:
 *  - مقارنة الأرقام بـ Number() لتجنب خطأ "2 !== '2'"
 *  - يفحص آخر 3 أيام بدلاً من يومين
 *  - خريطة أسماء عربية أكثر اكتمالاً
 *  - معالجة أخطاء أقوى
 */

import axios from 'axios'
import { POINTS } from '@/lib/scoring'

// ─── ENV ──────────────────────────────────────────────────────────────────────
const STRAPI_URL   = process.env.NEXT_PUBLIC_STRAPI_URL  || 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN
const API_KEY      = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY
const API_BASE     = process.env.NEXT_PUBLIC_API_FOOTBALL_BASE || 'https://v3.football.api-sports.io'
const WC_LEAGUE    = Number(process.env.NEXT_PUBLIC_WC_LEAGUE_ID) || 1
const WC_SEASON    = Number(process.env.NEXT_PUBLIC_WC_SEASON)    || 2026
const CRON_SECRET  = process.env.CRON_SECRET

const FINISHED_STATUSES = new Set(['FT', 'AET', 'PEN'])

// ─── Clients ──────────────────────────────────────────────────────────────────
const strapi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${STRAPI_TOKEN}` },
  timeout: 30000,
})

const apif = axios.create({
  baseURL: API_BASE,
  headers: { 'x-apisports-key': API_KEY },
  timeout: 20000,
})

// ─── خريطة الأسماء العربية (كاملة لكأس العالم 2026) ──────────────────────────
const AR = {
  // أمريكا الشمالية والمضيفون
  'USA': 'الولايات المتحدة',
  'United States': 'الولايات المتحدة',
  'Canada': 'كندا',
  'Mexico': 'المكسيك',

  // أوروبا
  'Germany': 'ألمانيا',
  'France': 'فرنسا',
  'Spain': 'إسبانيا',
  'England': 'إنجلترا',
  'Portugal': 'البرتغال',
  'Netherlands': 'هولندا',
  'Belgium': 'بلجيكا',
  'Italy': 'إيطاليا',
  'Croatia': 'كرواتيا',
  'Switzerland': 'سويسرا',
  'Austria': 'النمسا',
  'Denmark': 'الدنمارك',
  'Sweden': 'السويد',
  'Norway': 'النرويج',
  'Scotland': 'اسكتلندا',
  'Serbia': 'صربيا',
  'Ukraine': 'أوكرانيا',
  'Poland': 'بولندا',
  'Czech Republic': 'التشيك',
  'Czechia': 'التشيك',
  'Hungary': 'المجر',
  'Slovakia': 'سلوفاكيا',
  'Slovenia': 'سلوفينيا',
  'Turkey': 'تركيا',
  'Türkiye': 'تركيا',
  'Romania': 'رومانيا',
  'Greece': 'اليونان',
  'Bosnia & Herzegovina': 'البوسنة والهرسك',
  'Bosnia': 'البوسنة والهرسك',
  'Albania': 'ألبانيا',
  'Georgia': 'جورجيا',
  'Iceland': 'آيسلندا',
  'Wales': 'ويلز',
  'Finland': 'فنلندا',

  // أمريكا الجنوبية
  'Brazil': 'البرازيل',
  'Argentina': 'الأرجنتين',
  'Uruguay': 'أوروغواي',
  'Colombia': 'كولومبيا',
  'Chile': 'تشيلي',
  'Ecuador': 'الإكوادور',
  'Peru': 'بيرو',
  'Paraguay': 'باراغواي',
  'Venezuela': 'فنزويلا',
  'Bolivia': 'بوليفيا',

  // أفريقيا
  'Morocco': 'المغرب',
  'Senegal': 'السنغال',
  'Egypt': 'مصر',
  'Nigeria': 'نيجيريا',
  'Cameroon': 'الكاميرون',
  'Ghana': 'غانا',
  'Ivory Coast': "ساحل العاج",
  "Côte d'Ivoire": "ساحل العاج",
  'Algeria': 'الجزائر',
  'Tunisia': 'تونس',
  'South Africa': 'جنوب أفريقيا',
  'Congo DR': 'الكونغو الديمقراطية',
  'DR Congo': 'الكونغو الديمقراطية',
  'Cape Verde Islands': 'الرأس الأخضر',
  'Cape Verde': 'الرأس الأخضر',
  'Mali': 'مالي',
  'Angola': 'أنغولا',
  'Tanzania': 'تنزانيا',
  'Uganda': 'أوغندا',
  'Benin': 'بنين',
  'Zambia': 'زامبيا',
  'Comoros': 'جزر القمر',
  'Gabon': 'الغابون',
  'Guinea': 'غينيا',
  'Zimbabwe': 'زيمبابوي',

  // آسيا
  'Japan': 'اليابان',
  'South Korea': 'كوريا الجنوبية',
  'Iran': 'إيران',
  'Saudi Arabia': 'السعودية',
  'Australia': 'أستراليا',
  'Qatar': 'قطر',
  'Iraq': 'العراق',
  'Jordan': 'الأردن',
  'UAE': 'الإمارات',
  'United Arab Emirates': 'الإمارات',
  'Uzbekistan': 'أوزبكستان',
  'China': 'الصين',
  'India': 'الهند',
  'Indonesia': 'إندونيسيا',
  'Thailand': 'تايلاند',
  'Oman': 'عُمان',
  'Bahrain': 'البحرين',
  'Kuwait': 'الكويت',
  'Palestine': 'فلسطين',
  'Tajikistan': 'طاجيكستان',
  'Kyrgyzstan': 'قيرغيزستان',

  // أمريكا الوسطى والكاريبي
  'Panama': 'بنما',
  'Costa Rica': 'كوستاريكا',
  'Honduras': 'هندوراس',
  'El Salvador': 'السلفادور',
  'Jamaica': 'جامايكا',
  'Cuba': 'كوبا',
  'Trinidad & Tobago': 'ترينيداد وتوباغو',
  'Haiti': 'هايتي',
  'Curaçao': 'كوراساو',
  'Guatemala': 'غواتيمالا',

  // أوقيانوسيا
  'New Zealand': 'نيوزيلندا',
  'Fiji': 'فيجي',
}

const toAr = name => AR[name] || name

// ─── مساعدات ──────────────────────────────────────────────────────────────────
function dateStr(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

/** استخراج قيمة آمن من سجل Strapi (v4 يدعم attributes، أو flat) */
function getAttr(pred, key) {
  return pred?.attributes?.[key] ?? pred?.[key] ?? null
}

/** تحويل إلى رقم آمن — يحل مشكلة "2" !== 2 */
function toNum(v) {
  const n = Number(v)
  return isNaN(n) ? null : n
}

/** جلب توقعات pending لـ matchId معين (كل الصفحات) */
async function fetchPending(matchId) {
  let all = [], page = 1
  while (true) {
    const res = await strapi.get('/predictions', {
      params: {
        'filters[matchId][$eq]': String(matchId),
        'filters[status][$eq]': 'pending',
        'pagination[page]': page,
        'pagination[pageSize]': 100,
      },
    })
    const batch = res.data?.data || []
    all = all.concat(batch)
    const total = res.data?.meta?.pagination?.total ?? 0
    if (batch.length === 0 || all.length >= total) break
    page++
  }
  return all
}

/** تحديث توقع واحد */
async function updatePred(predId, pts, status, extra = {}) {
  await strapi.put(`/predictions/${predId}`, {
    data: { points: pts, status, ...extra },
  })
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. معالجة نتائج المباريات
// ══════════════════════════════════════════════════════════════════════════════
async function processMatches() {
  const results = []
  // نفحص آخر 3 أيام لضمان عدم فوات أي مباراة
  const dates = [dateStr(-2), dateStr(-1), dateStr(0)]

  for (const date of dates) {
    let fixtures = []
    try {
      const res = await apif.get('/fixtures', {
        params: { league: WC_LEAGUE, season: WC_SEASON, date },
      })
      fixtures = (res.data?.response || []).filter(f =>
        FINISHED_STATUSES.has(f.fixture?.status?.short)
      )
    } catch (e) {
      console.warn(`[cron] fixtures fetch failed for ${date}:`, e.message)
      continue
    }

    for (const f of fixtures) {
      const matchId = String(f.fixture.id)
      const aHome   = toNum(f.goals?.home) ?? 0
      const aAway   = toNum(f.goals?.away) ?? 0

      let preds
      try {
        preds = await fetchPending(matchId)
      } catch (e) {
        console.warn(`[cron] fetchPending failed for match ${matchId}:`, e.message)
        continue
      }

      if (preds.length === 0) continue

      let exact = 0, winner = 0, wrong = 0

      for (const pred of preds) {
        const pHome = toNum(getAttr(pred, 'homeScore'))
        const pAway = toNum(getAttr(pred, 'awayScore'))
        if (pHome === null || pAway === null) continue

        let pts = 0, status = 'wrong'

        if (pHome === aHome && pAway === aAway) {
          // نتيجة دقيقة = 3 نقاط
          pts = POINTS.MATCH_EXACT; status = 'exact'; exact++
        } else {
          // هل توقّع الفائز صح؟
          const pWinner = pHome > pAway ? 'home' : pAway > pHome ? 'away' : 'draw'
          const rWinner = aHome > aAway ? 'home' : aAway > aHome ? 'away' : 'draw'
          if (pWinner === rWinner) {
            pts = POINTS.MATCH_WINNER; status = 'won'; winner++
          } else {
            wrong++
          }
        }

        try {
          await updatePred(pred.id, pts, status, {
            actualHomeScore: aHome,
            actualAwayScore: aAway,
          })
        } catch (e) {
          console.warn(`[cron] updatePred failed for pred ${pred.id}:`, e.message)
        }
      }

      results.push({
        type: 'match', matchId,
        home: f.teams?.home?.name, away: f.teams?.away?.name,
        score: `${aHome}-${aAway}`,
        total: preds.length, exact, winner, wrong,
      })
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
  } catch (e) {
    console.warn('[cron] standings fetch failed:', e.message)
    return results
  }

  for (const group of standings) {
    if (!Array.isArray(group) || group.length < 2) continue

    // هل كل فرق المجموعة أنهت مبارياتها الثلاث؟
    const allDone = group.every(entry => (entry?.all?.played ?? 0) >= 3)
    if (!allDone) continue

    const first  = toAr(group[0]?.team?.name || '')
    const second = toAr(group[1]?.team?.name || '')
    const grpRaw = group[0]?.group || ''
    const grpId  = grpRaw.replace('Group ', '').trim() // 'A'..'L'
    if (!grpId || !first) continue

    // المركز الأول
    try {
      const preds1st = await fetchPending(`group_${grpId}_1st`)
      if (preds1st.length > 0) {
        let correct = 0
        for (const pred of preds1st) {
          const picked = (getAttr(pred, 'homeTeam') || '').trim()
          const ok     = picked.toLowerCase() === first.toLowerCase()
          await updatePred(pred.id, ok ? POINTS.GROUP_FIRST : 0, ok ? 'won' : 'wrong')
          if (ok) correct++
        }
        results.push({ type: 'group', group: grpId, slot: '1st', actualTeam: first,
          total: preds1st.length, correct, wrong: preds1st.length - correct })
      }
    } catch (e) {
      console.warn(`[cron] group ${grpId} 1st failed:`, e.message)
    }

    // المركز الثاني
    try {
      const preds2nd = await fetchPending(`group_${grpId}_2nd`)
      if (preds2nd.length > 0) {
        let correct = 0
        for (const pred of preds2nd) {
          const picked = (getAttr(pred, 'homeTeam') || '').trim()
          const ok     = picked.toLowerCase() === second.toLowerCase()
          await updatePred(pred.id, ok ? POINTS.GROUP_SECOND : 0, ok ? 'won' : 'wrong')
          if (ok) correct++
        }
        results.push({ type: 'group', group: grpId, slot: '2nd', actualTeam: second,
          total: preds2nd.length, correct, wrong: preds2nd.length - correct })
      }
    } catch (e) {
      console.warn(`[cron] group ${grpId} 2nd failed:`, e.message)
    }
  }
  return results
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. معالجة جوائز البطولة
// ══════════════════════════════════════════════════════════════════════════════
async function processTournamentAwards() {
  const results = []

  // ─── البطل والوصيف — من نتيجة النهائي ──────────────────────────────────────
  try {
    const res = await apif.get('/fixtures', {
      params: { league: WC_LEAGUE, season: WC_SEASON, round: 'Final' },
    })
    const finals = res.data?.response || []
    const final  = finals.find(f => FINISHED_STATUSES.has(f.fixture?.status?.short))

    if (final) {
      const aHome = toNum(final.goals?.home) ?? 0
      const aAway = toNum(final.goals?.away) ?? 0

      let championEn, finalistEn
      if (aHome > aAway) {
        championEn = final.teams.home.name; finalistEn = final.teams.away.name
      } else if (aAway > aHome) {
        championEn = final.teams.away.name; finalistEn = final.teams.home.name
      } else {
        // ركلات الترجيح — نعتمد على winner flag
        const homeWon = final.teams.home.winner === true
        championEn = homeWon ? final.teams.home.name : final.teams.away.name
        finalistEn = homeWon ? final.teams.away.name : final.teams.home.name
      }

      const champion = toAr(championEn)
      const finalist = toAr(finalistEn)

      for (const [awardId, actualTeam, pts] of [
        ['champion', champion, POINTS.AWARD_CHAMPION],
        ['finalist', finalist, POINTS.AWARD_FINALIST],
      ]) {
        try {
          const preds = await fetchPending(`award_${awardId}`)
          if (preds.length === 0) continue
          let correct = 0
          for (const pred of preds) {
            const picked = (getAttr(pred, 'homeTeam') || '').trim()
            const ok     = picked.toLowerCase() === actualTeam.toLowerCase()
            await updatePred(pred.id, ok ? pts : 0, ok ? 'won' : 'wrong')
            if (ok) correct++
          }
          results.push({ type: 'award', awardId, actualValue: actualTeam,
            total: preds.length, correct, wrong: preds.length - correct })
        } catch (e) {
          console.warn(`[cron] award ${awardId} failed:`, e.message)
        }
      }
    }
  } catch (e) {
    console.warn('[cron] champion/finalist error:', e.message)
  }

  // ─── هداف البطولة — من API topscorers ────────────────────────────────────
  try {
    const predsTS = await fetchPending('award_topScorer')
    if (predsTS.length > 0) {
      const res = await apif.get('/players/topscorers', {
        params: { league: WC_LEAGUE, season: WC_SEASON },
      })
      const top = res.data?.response?.[0]
      if (top) {
        const topName = top.player?.name || ''
        let correct = 0
        for (const pred of predsTS) {
          const picked = (getAttr(pred, 'homeTeam') || '').trim()
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
  return results
}

// ══════════════════════════════════════════════════════════════════════════════
// Handler الرئيسي
// ══════════════════════════════════════════════════════════════════════════════
async function runAll() {
  const [matchRes, groupRes, awardRes] = await Promise.allSettled([
    processMatches(),
    processGroupStandings(),
    processTournamentAwards(),
  ])

  return {
    matches: matchRes.status === 'fulfilled' ? matchRes.value : [],
    groups:  groupRes.status === 'fulfilled' ? groupRes.value : [],
    awards:  awardRes.status === 'fulfilled' ? awardRes.value : [],
    errors: [
      matchRes.status === 'rejected' ? `matches: ${matchRes.reason?.message}` : null,
      groupRes.status === 'rejected' ? `groups: ${groupRes.reason?.message}`  : null,
      awardRes.status === 'rejected' ? `awards: ${awardRes.reason?.message}`  : null,
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

  if (!API_KEY) {
    return Response.json({ message: 'NEXT_PUBLIC_API_FOOTBALL_KEY غير مضبوط', ok: false })
  }

  try {
    const data = await runAll()
    const totalUpdated =
      data.matches.reduce((s, r) => s + (r.total || 0), 0) +
      data.groups.reduce((s, r)  => s + (r.total || 0), 0) +
      data.awards.reduce((s, r)  => s + (r.total || 0), 0)

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
