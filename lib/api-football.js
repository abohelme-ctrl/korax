/**
 * API-Football v3 integration
 * Docs: https://www.api-football.com/documentation-v3
 *
 * Live refresh strategy:
 *   - During live matches: every 10 seconds
 *   - No live matches:     every 5 minutes
 */

import axios from 'axios'
import { MOCK_MATCHES, GROUPS } from './mock-data'

const BASE_URL  = process.env.NEXT_PUBLIC_API_FOOTBALL_BASE || 'https://v3.football.api-sports.io'
const API_KEY   = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY
const WC_LEAGUE = Number(process.env.NEXT_PUBLIC_WC_LEAGUE_ID) || 1
const WC_SEASON = Number(process.env.NEXT_PUBLIC_WC_SEASON)    || 2026

const USE_MOCK = !API_KEY || API_KEY === 'your_api_football_key_here'

// ─── Refresh intervals ─────────────────────────────────────────────────────────
export const INTERVAL_LIVE = 10_000       // 10 ثواني — وقت المباريات المباشرة
export const INTERVAL_IDLE = 5 * 60_000  // 5 دقائق — لا مباريات

// ─── Axios Instance ────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'x-apisports-key': API_KEY,
    'Content-Type': 'application/json',
  },
})

// ─── Arabic team name map ──────────────────────────────────────────────────────

const TEAM_NAMES_AR = {
  'Mexico':               'المكسيك',
  'South Africa':         'جنوب أفريقيا',
  'South Korea':          'كوريا الجنوبية',
  'Czech Republic':       'التشيك',
  'Canada':               'كندا',
  'Bosnia & Herzegovina': 'البوسنة والهرسك',
  'Qatar':                'قطر',
  'Switzerland':          'سويسرا',
  'Brazil':               'البرازيل',
  'Morocco':              'المغرب',
  'Haiti':                'هايتي',
  'Scotland':             'اسكتلندا',
  'USA':                  'الولايات المتحدة',
  'Paraguay':             'باراغواي',
  'Australia':            'أستراليا',
  'Türkiye':              'تركيا',
  'Germany':              'ألمانيا',
  'Curaçao':              'كوراساو',
  'Ivory Coast':          'ساحل العاج',
  'Ecuador':              'الإكوادور',
  'Netherlands':          'هولندا',
  'Japan':                'اليابان',
  'Sweden':               'السويد',
  'Tunisia':              'تونس',
  'Belgium':              'بلجيكا',
  'Egypt':                'مصر',
  'Iran':                 'إيران',
  'New Zealand':          'نيوزيلندا',
  'Spain':                'إسبانيا',
  'Cape Verde Islands':   'الرأس الأخضر',
  'Saudi Arabia':         'السعودية',
  'Uruguay':              'أوروغواي',
  'France':               'فرنسا',
  'Senegal':              'السنغال',
  'Iraq':                 'العراق',
  'Norway':               'النرويج',
  'Argentina':            'الأرجنتين',
  'Algeria':              'الجزائر',
  'Austria':              'النمسا',
  'Jordan':               'الأردن',
  'Portugal':             'البرتغال',
  'Colombia':             'كولومبيا',
  'Uzbekistan':           'أوزبكستان',
  'Congo DR':             'الكونغو',
  'England':              'إنجلترا',
  'Croatia':              'كرواتيا',
  'Ghana':                'غانا',
  'Panama':               'بنما',
}

const TEAM_FLAGS = {
  'Mexico': '🇲🇽', 'South Africa': '🇿🇦', 'South Korea': '🇰🇷', 'Czech Republic': '🇨🇿',
  'Canada': '🇨🇦', 'Bosnia & Herzegovina': '🇧🇦', 'Qatar': '🇶🇦', 'Switzerland': '🇨🇭',
  'Brazil': '🇧🇷', 'Morocco': '🇲🇦', 'Haiti': '🇭🇹', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'USA': '🇺🇸', 'Paraguay': '🇵🇾', 'Australia': '🇦🇺', 'Türkiye': '🇹🇷',
  'Germany': '🇩🇪', 'Curaçao': '🇨🇼', 'Ivory Coast': '🇨🇮', 'Ecuador': '🇪🇨',
  'Netherlands': '🇳🇱', 'Japan': '🇯🇵', 'Sweden': '🇸🇪', 'Tunisia': '🇹🇳',
  'Belgium': '🇧🇪', 'Egypt': '🇪🇬', 'Iran': '🇮🇷', 'New Zealand': '🇳🇿',
  'Spain': '🇪🇸', 'Cape Verde Islands': '🇨🇻', 'Saudi Arabia': '🇸🇦', 'Uruguay': '🇺🇾',
  'France': '🇫🇷', 'Senegal': '🇸🇳', 'Iraq': '🇮🇶', 'Norway': '🇳🇴',
  'Argentina': '🇦🇷', 'Algeria': '🇩🇿', 'Austria': '🇦🇹', 'Jordan': '🇯🇴',
  'Portugal': '🇵🇹', 'Colombia': '🇨🇴', 'Uzbekistan': '🇺🇿', 'Congo DR': '🇨🇩',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Croatia': '🇭🇷', 'Ghana': '🇬🇭', 'Panama': '🇵🇦',
}

const GROUP_NAMES_AR = {
  'Group A': 'المجموعة A', 'Group B': 'المجموعة B', 'Group C': 'المجموعة C',
  'Group D': 'المجموعة D', 'Group E': 'المجموعة E', 'Group F': 'المجموعة F',
  'Group G': 'المجموعة G', 'Group H': 'المجموعة H', 'Group I': 'المجموعة I',
  'Group J': 'المجموعة J', 'Group K': 'المجموعة K', 'Group L': 'المجموعة L',
}

const ROUND_NAMES_AR = {
  'Group Stage - 1': 'دور المجموعات - الجولة 1',
  'Group Stage - 2': 'دور المجموعات - الجولة 2',
  'Group Stage - 3': 'دور المجموعات - الجولة 3',
  'Round of 32':     'دور الـ 32',
  'Round of 16':     'دور الـ 16',
  'Quarter-finals':  'ربع النهائي',
  'Semi-finals':     'نصف النهائي',
  '3rd Place Final': 'المركز الثالث',
  'Final':           'النهائي',
}

// ─── Normalizers ───────────────────────────────────────────────────────────────

function normalizeTeam(t) {
  return {
    id:   String(t.id),
    name: TEAM_NAMES_AR[t.name] || t.name,
    nameEn: t.name,
    logo: t.logo,
    flag: TEAM_FLAGS[t.name] || '🏳️',
  }
}

function normalizeMatch(f) {
  const statusMap = {
    '1H': 'LIVE', '2H': 'LIVE', 'HT': 'LIVE', 'ET': 'LIVE',
    'BT': 'LIVE', 'P': 'LIVE', 'INT': 'LIVE', 'LIVE': 'LIVE',
    'NS': 'UPCOMING', 'TBD': 'UPCOMING',
    'FT': 'FINISHED', 'AET': 'FINISHED', 'PEN': 'FINISHED',
    'CANC': 'CANCELLED', 'PST': 'POSTPONED', 'ABD': 'CANCELLED',
  }

  const round = f.league.round || ''

  return {
    id:        String(f.fixture.id),
    status:    statusMap[f.fixture.status.short] || 'UPCOMING',
    minute:    f.fixture.status.elapsed ? String(f.fixture.status.elapsed) : null,
    startTime: f.fixture.date,
    homeTeam:  normalizeTeam(f.teams.home),
    awayTeam:  normalizeTeam(f.teams.away),
    homeScore: f.goals.home,
    awayScore: f.goals.away,
    group:     ROUND_NAMES_AR[round] || round,
    groupEn:   round,
    venue:     f.fixture.venue?.name  || '',
    city:      f.fixture.venue?.city  || '',
    referee:   f.fixture.referee      || '',
    stadium: {
      name:     f.fixture.venue?.name || '',
      city:     f.fixture.venue?.city || '',
      capacity: null,
      info:     '',
    },
    events:  [],
    stats:   null,
    lineups: { home: [], away: [] },
  }
}

function normalizeEvent(e) {
  const typeMap = {
    'Goal':         'goal',
    'Yellow Card':  'yellow_card',
    'Red Card':     'red_card',
    'Substitution': 'subst',
    'Penalty':      'penalty',
    'Var':          'var',
  }
  const extra = e.time.extra ? `+${e.time.extra}` : ''
  return {
    minute: `${e.time.elapsed}${extra}`,
    type:   typeMap[e.type] || e.type.toLowerCase(),
    team:   String(e.team.id),
    player: e.player?.name  || '',
    assist: e.assist?.name  || null,
    detail: e.detail        || '',
  }
}

// ─── Cache (simple in-memory) ──────────────────────────────────────────────────

const cache = new Map()

function cached(key, ttlMs, fetcher) {
  const now = Date.now()
  const hit  = cache.get(key)
  if (hit && now - hit.ts < ttlMs) return Promise.resolve(hit.data)
  return fetcher().then(data => {
    cache.set(key, { data, ts: now })
    return data
  })
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch ALL WC 2026 fixtures (schedule) — cached 1 hour
 */
export async function fetchAllFixtures() {
  if (USE_MOCK) return []

  return cached('all-fixtures', 60 * 60_000, async () => {
    const res = await api.get('/fixtures', {
      params: { league: WC_LEAGUE, season: WC_SEASON },
    })
    return res.data.response.map(normalizeMatch)
  })
}

/**
 * Fetch today's WC matches (or by date YYYY-MM-DD)
 */
export async function fetchTodayMatches(date) {
  if (USE_MOCK) return MOCK_MATCHES

  const today = date || new Date().toISOString().slice(0, 10)
  return cached(`fixtures-${today}`, 60_000, async () => {
    const res = await api.get('/fixtures', {
      params: { league: WC_LEAGUE, season: WC_SEASON, date: today },
    })
    return res.data.response.map(normalizeMatch)
  })
}

/**
 * Fetch live WC matches only
 */
export async function fetchLiveMatches() {
  if (USE_MOCK) return MOCK_MATCHES.filter(m => m.status === 'LIVE')

  const res = await api.get('/fixtures', {
    params: { live: 'all', league: WC_LEAGUE },
  })
  return res.data.response.map(normalizeMatch)
}

/**
 * Fetch full match details (events + stats + lineups)
 */
export async function fetchMatchDetails(matchId) {
  if (USE_MOCK) return MOCK_MATCHES.find(m => m.id === matchId) || MOCK_MATCHES[0]

  return cached(`match-${matchId}`, 10_000, async () => {
    const [fixtureRes, eventsRes, statsRes, lineupsRes] = await Promise.all([
      api.get('/fixtures',            { params: { id: matchId } }),
      api.get('/fixtures/events',     { params: { fixture: matchId } }),
      api.get('/fixtures/statistics', { params: { fixture: matchId } }),
      api.get('/fixtures/lineups',    { params: { fixture: matchId } }),
    ])

    const match  = normalizeMatch(fixtureRes.data.response[0])
    match.events = eventsRes.data.response.map(normalizeEvent)

    // ── Lineups (rich format) ────────────────────────────────────────────────
    const mapLP = p => ({
      id:     String(p.player.id),
      name:   p.player.name,
      number: p.player.number || 0,
      pos:    p.player.pos    || '',
      grid:   p.player.grid   || '',
    })
    match.lineups = {
      home: {
        formation: lineupsRes.data.response[0]?.formation || '',
        coach:     lineupsRes.data.response[0]?.coach?.name || '',
        players:   lineupsRes.data.response[0]?.startXI?.map(mapLP) || [],
      },
      away: {
        formation: lineupsRes.data.response[1]?.formation || '',
        coach:     lineupsRes.data.response[1]?.coach?.name || '',
        players:   lineupsRes.data.response[1]?.startXI?.map(mapLP) || [],
      },
    }

    // ── Stats (extended) ─────────────────────────────────────────────────────
    if (statsRes.data.response.length >= 2) {
      const h   = statsRes.data.response[0].statistics
      const a   = statsRes.data.response[1].statistics
      const get = (arr, name) => arr.find(s => s.type === name)?.value ?? 0
      match.stats = {
        possession:     [parseInt(get(h, 'Ball Possession')) || 50, parseInt(get(a, 'Ball Possession')) || 50],
        shots:          [get(h, 'Total Shots'),        get(a, 'Total Shots')],
        shotsOnTarget:  [get(h, 'Shots on Goal'),      get(a, 'Shots on Goal')],
        blockedShots:   [get(h, 'Blocked Shots'),      get(a, 'Blocked Shots')],
        corners:        [get(h, 'Corner Kicks'),        get(a, 'Corner Kicks')],
        offsides:       [get(h, 'Offsides'),            get(a, 'Offsides')],
        fouls:          [get(h, 'Fouls'),               get(a, 'Fouls')],
        yellowCards:    [get(h, 'Yellow Cards'),         get(a, 'Yellow Cards')],
        redCards:       [get(h, 'Red Cards'),            get(a, 'Red Cards')],
        saves:          [get(h, 'Goalkeeper Saves'),     get(a, 'Goalkeeper Saves')],
        passesTotal:    [get(h, 'Total Passes'),         get(a, 'Total Passes')],
        passesAccuracy: [get(h, 'Passes accurate'),      get(a, 'Passes accurate')],
        dribbles:       [get(h, 'Dribbles'),             get(a, 'Dribbles')],
      }
    }

    return match
  })
}

/**
 * Fetch per-player match statistics
 */
export async function fetchMatchPlayers(matchId) {
  if (USE_MOCK) return null

  return cached(`match-players-${matchId}`, 30_000, async () => {
    const res = await api.get('/fixtures/players', { params: { fixture: matchId } })
    const byTeam = {}
    for (const teamData of (res.data.response || [])) {
      const teamId = String(teamData.team.id)
      byTeam[teamId] = (teamData.players || []).map(p => {
        const s = p.statistics?.[0] || {}
        return {
          id:       String(p.player.id),
          name:     p.player.name,
          rating:   parseFloat(s.games?.rating) || null,
          minutes:  s.games?.minutes  || 0,
          goals:    s.goals?.total    || 0,
          assists:  s.goals?.assists  || 0,
          shots:    s.shots?.total    || 0,
          shotsOn:  s.shots?.on       || 0,
          passes:   s.passes?.total   || 0,
          passAcc:  s.passes?.accuracy || 0,
          tackles:  s.tackles?.total  || 0,
          yellow:   s.cards?.yellow   || 0,
          red:      s.cards?.red      || 0,
          saves:    s.goals?.saves    || 0,
          dribbles: s.dribbles?.success || 0,
        }
      })
    }
    return byTeam
  })
}

/**
 * Fetch AI prediction for a match
 */
export async function fetchPrediction(fixtureId) {
  if (USE_MOCK) return null

  return cached(`prediction-${fixtureId}`, 30 * 60_000, async () => {
    const res = await api.get('/predictions', { params: { fixture: fixtureId } })
    const p   = res.data.response[0]
    if (!p) return null
    return {
      homeWinPct: p.predictions?.percent?.home  || '0%',
      drawPct:    p.predictions?.percent?.draw  || '0%',
      awayWinPct: p.predictions?.percent?.away  || '0%',
      winner:     p.predictions?.winner?.name   || null,
      winnerId:   p.predictions?.winner?.id     || null,
      advice:     p.predictions?.advice         || '',
      homeForm:   p.teams?.home?.league?.form   || '',
      awayForm:   p.teams?.away?.league?.form   || '',
    }
  })
}

/**
 * Fetch head-to-head history
 */
export async function fetchH2H(homeId, awayId) {
  if (USE_MOCK) return []

  return cached(`h2h-${homeId}-${awayId}`, 60 * 60_000, async () => {
    const res = await api.get('/fixtures/headtohead', {
      params: { h2h: `${homeId}-${awayId}`, last: 5 },
    })
    return res.data.response.map(normalizeMatch)
  })
}

/**
 * Fetch group standings (all 12 groups)
 */
export async function fetchStandings() {
  if (USE_MOCK) return GROUPS

  return cached('standings', 5 * 60_000, async () => {
    const res      = await api.get('/standings', { params: { league: WC_LEAGUE, season: WC_SEASON } })
    const standings = res.data.response[0]?.league?.standings || []

    return standings.map(group => {
      const groupNameEn = group[0]?.group || ''
      return {
        id:   groupNameEn.replace('Group ', ''),
        name: GROUP_NAMES_AR[groupNameEn] || groupNameEn,
        teams: group.map(entry => ({
          team:   normalizeTeam(entry.team),
          played: entry.all.played,
          won:    entry.all.win,
          draw:   entry.all.draw,
          lost:   entry.all.lose,
          gf:     entry.all.goals.for,
          ga:     entry.all.goals.against,
          pts:    entry.points,
        })),
      }
    })
  })
}

/**
 * Fetch player details
 */
export async function fetchPlayer(playerId) {
  if (USE_MOCK) {
    const { MOCK_PLAYERS } = await import('./mock-data')
    return MOCK_PLAYERS.find(p => p.id === playerId) || MOCK_PLAYERS[0]
  }

  return cached(`player-${playerId}`, 60 * 60_000, async () => {
    const res = await api.get('/players', { params: { id: playerId, season: WC_SEASON } })
    const p   = res.data.response[0]
    if (!p) return null

    return {
      id:       String(p.player.id),
      name:     p.player.name,
      age:      p.player.age,
      position: p.statistics[0]?.games?.position || '',
      club:     p.statistics[0]?.team?.name      || '',
      photo:    p.player.photo,
      injured:  p.player.injured,
      number:   null,
      team:     { id: String(p.statistics[0]?.team?.id), name: p.statistics[0]?.team?.name, flag: '🏳️' },
      stats: {
        goals:   p.statistics[0]?.goals?.total      || 0,
        assists: p.statistics[0]?.goals?.assists     || 0,
        matches: p.statistics[0]?.games?.appearences || 0,
      },
    }
  })
}

/**
 * Fetch injuries for WC 2026
 */
export async function fetchInjuries() {
  if (USE_MOCK) return []

  return cached('injuries', 60 * 60_000, async () => {
    const res = await api.get('/injuries', { params: { league: WC_LEAGUE, season: WC_SEASON } })
    return res.data.response.map(i => ({
      playerId:   String(i.player.id),
      playerName: i.player.name,
      teamId:     String(i.team.id),
      teamName:   TEAM_NAMES_AR[i.team.name] || i.team.name,
      type:       i.player.type,
      reason:     i.player.reason,
    }))
  })
}

/**
 * Fetch coach for a team
 */
export async function fetchCoach(teamId) {
  if (USE_MOCK) return null

  return cached(`coach-${teamId}`, 24 * 60 * 60_000, async () => {
    const res = await api.get('/coachs', { params: { team: teamId } })
    const c   = res.data.response[0]
    if (!c) return null
    return {
      id:          c.id,
      name:        c.name,
      nationality: c.nationality,
      age:         c.age,
      photo:       c.photo,
    }
  })
}
