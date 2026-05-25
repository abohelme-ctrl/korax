import axios from 'axios'

const STRAPI_URL   = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN

const strapi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${STRAPI_TOKEN}`,
  },
})

const SETTINGS_MATCH_ID = '_korax_settings_'

// الإعدادات الافتراضية
const DEFAULT_SETTINGS = {
  awardsLocked:  false,
  lockedGroups:  [],   // مصفوفة بأسماء المجموعات المقفلة مثل ['A', 'B']
}

export async function getSettings() {
  try {
    const res = await strapi.get('/predictions', {
      params: {
        filters: { matchId: { $eq: SETTINGS_MATCH_ID } },
        pagination: { pageSize: 1 },
      },
    })
    const record = res.data.data?.[0]
    if (!record) return DEFAULT_SETTINGS

    const raw = record.attributes?.homeTeam || record.homeTeam || ''
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
    } catch {
      return DEFAULT_SETTINGS
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function saveSettings(settings) {
  const json = JSON.stringify(settings)
  const res = await strapi.get('/predictions', {
    params: {
      filters: { matchId: { $eq: SETTINGS_MATCH_ID } },
      pagination: { pageSize: 1 },
    },
  })
  const record = res.data.data?.[0]

  if (record) {
    await strapi.put(`/predictions/${record.id}`, {
      data: { homeTeam: json },
    })
  } else {
    await strapi.post('/predictions', {
      data: {
        matchId:   SETTINGS_MATCH_ID,
        homeTeam:  json,
        awayTeam:  '',
        homeScore: 0,
        awayScore: 0,
        points:    0,
        status:    'pending',
      },
    })
  }
  return settings
}

// GET /api/settings
export async function GET() {
  const settings = await getSettings()
  return Response.json(settings)
}
