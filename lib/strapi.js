/**
 * Strapi API client
 * All user data (predictions, cards, groups, points) is stored in Strapi.
 */

import axios from 'axios'

const STRAPI_URL   = process.env.NEXT_PUBLIC_STRAPI_URL  || 'http://localhost:1337'
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN

const strapi = axios.create({
  baseURL: `${STRAPI_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
    ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
  },
})

// ─── Auth Token Helper ─────────────────────────────────────────────────────────

export function setUserToken(token) {
  strapi.defaults.headers.Authorization = `Bearer ${token}`
}

// ─── Predictions ───────────────────────────────────────────────────────────────

export async function getPredictions(userId) {
  const res = await strapi.get('/predictions', {
    params: { filters: { user: { id: { $eq: userId } } }, populate: '*' },
  })
  return res.data.data
}

export async function getPrediction(userId, matchId) {
  const res = await strapi.get('/predictions', {
    params: {
      filters: {
        user:    { id:      { $eq: userId  } },
        matchId: { $eq: matchId },
      },
    },
  })
  return res.data.data[0] || null
}

export async function savePrediction({ userId, matchId, homeScore, awayScore, homeTeam = '', awayTeam = '', matchDate = null }) {
  const existing = await getPrediction(userId, matchId)

  if (existing) {
    const res = await strapi.put(`/predictions/${existing.id}`, {
      data: { homeScore, awayScore },
    })
    return res.data.data
  }

  const res = await strapi.post('/predictions', {
    data: {
      user: userId,
      matchId,
      homeScore,
      awayScore,
      homeTeam,
      awayTeam,
      matchDate: matchDate || null,
      points: 0,
      status: 'pending',
    },
  })
  return res.data.data
}

export async function getUserPoints(userId) {
  const predictions = await getPredictions(userId)
  return predictions.reduce((sum, p) => sum + (p.attributes?.points || 0), 0)
}

// ─── Player Cards ──────────────────────────────────────────────────────────────

export async function getUserCards(userId) {
  const res = await strapi.get('/user-cards', {
    params: { filters: { user: { id: { $eq: userId } } }, populate: '*' },
  })
  return res.data.data
}

export async function addCardToUser(userId, playerId, rarity, source) {
  const res = await strapi.post('/user-cards', {
    data: { user: userId, playerId, rarity, source, obtainedAt: new Date().toISOString() },
  })
  return res.data.data
}

export async function sendCardToFriend(cardId, toUserId) {
  const res = await strapi.put(`/user-cards/${cardId}`, {
    data: { user: toUserId, transferredAt: new Date().toISOString() },
  })
  return res.data.data
}

// ─── User Team ─────────────────────────────────────────────────────────────────

export async function getUserTeam(userId) {
  const res = await strapi.get('/user-teams', {
    params: { filters: { user: { id: { $eq: userId } } }, populate: '*' },
  })
  return res.data.data[0] || null
}

export async function saveUserTeam({ userId, formation, players, bench, power, chemistry }) {
  const existing = await getUserTeam(userId)

  if (existing) {
    const res = await strapi.put(`/user-teams/${existing.id}`, {
      data: { formation, players, bench, power, chemistry },
    })
    return res.data.data
  }

  const res = await strapi.post('/user-teams', {
    data: { user: userId, formation, players, bench, power, chemistry },
  })
  return res.data.data
}

// ─── Friend Groups ─────────────────────────────────────────────────────────────

export async function getUserGroups(userId) {
  const res = await strapi.get('/friend-groups', {
    params: {
      filters: { members: { user: { id: { $eq: userId } } } },
      populate: { members: { populate: 'user' } },
    },
  })
  return res.data.data
}

export async function createFriendGroup({ name, adminId, code }) {
  const res = await strapi.post('/friend-groups', {
    data: { name, admin: adminId, code, members: [{ user: adminId }] },
  })
  return res.data.data
}

export async function joinGroupByCode(code, userId) {
  const res = await strapi.get('/friend-groups', {
    params: { filters: { code: { $eq: code } }, populate: 'members' },
  })
  const group = res.data.data[0]
  if (!group) throw new Error('كود المجموعة غير صحيح')

  const updatedMembers = [...(group.attributes.members?.data || []).map(m => m.id), userId]
  const update = await strapi.put(`/friend-groups/${group.id}`, {
    data: { members: updatedMembers.map(id => ({ user: id })) },
  })
  return update.data.data
}

// ─── Daily Gift ────────────────────────────────────────────────────────────────

export async function checkDailyGift(userId) {
  const today = new Date().toISOString().slice(0, 10)
  const res = await strapi.get('/daily-gifts', {
    params: { filters: { user: { id: { $eq: userId } }, date: { $eq: today } } },
  })
  return res.data.data[0] || null
}

export async function claimDailyGift(userId, selectedCardIndex) {
  const today = new Date().toISOString().slice(0, 10)
  const res = await strapi.post('/daily-gifts', {
    data: { user: userId, date: today, claimed: true, selectedCard: selectedCardIndex },
  })
  return res.data.data
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export async function getUserNotifications(userId) {
  const res = await strapi.get('/notifications', {
    params: {
      filters: { user: { id: { $eq: userId } } },
      sort:    'createdAt:desc',
      pagination: { limit: 20 },
    },
  })
  return res.data.data
}

export async function markNotificationRead(notifId) {
  await strapi.put(`/notifications/${notifId}`, { data: { read: true } })
}

// ─── Leaderboard ───────────────────────────────────────────────────────────────

export async function getLeaderboard() {
  const res = await strapi.get('/predictions/leaderboard')
  return res.data // [{ userId, username, points, count }]
}

export async function getFriendGroupLeaderboard(groupId) {
  const res = await strapi.get(`/predictions/leaderboard/group/${groupId}`)
  return res.data // { group: {...}, leaderboard: [...] }
}

export async function getMyGroups() {
  const res = await strapi.get('/friend-groups/my')
  return res.data
}

export async function createGroup(name) {
  const res = await strapi.post('/friend-groups/create', { name })
  return res.data
}

export async function joinGroup(code) {
  const res = await strapi.post('/friend-groups/join', { code })
  return res.data
}
