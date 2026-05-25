import { getSettings, saveSettings } from '@/app/api/settings/route'

const ADMIN_SECRET = process.env.ADMIN_SECRET

/**
 * POST /api/admin/lock
 *
 * body: { secret, action, value }
 *
 * action = 'lock_awards'    → value: true | false
 * action = 'lock_group'     → value: 'A' (lock group A)
 * action = 'unlock_group'   → value: 'A' (unlock group A)
 * action = 'lock_all_groups'   → value: ['A','B',...] (override full list)
 * action = 'unlock_all_groups' → clears all group locks
 */
export async function POST(req) {
  const body = await req.json()
  const { secret, action, value } = body

  if (!ADMIN_SECRET || secret !== ADMIN_SECRET) {
    return Response.json({ error: 'غير مصرح' }, { status: 401 })
  }

  try {
    const settings = await getSettings()

    if (action === 'lock_awards') {
      settings.awardsLocked = Boolean(value)
    } else if (action === 'lock_group') {
      if (!settings.lockedGroups.includes(value)) {
        settings.lockedGroups = [...settings.lockedGroups, value]
      }
    } else if (action === 'unlock_group') {
      settings.lockedGroups = settings.lockedGroups.filter(g => g !== value)
    } else if (action === 'lock_all_groups') {
      settings.lockedGroups = Array.isArray(value) ? value : settings.lockedGroups
    } else if (action === 'unlock_all_groups') {
      settings.lockedGroups = []
    } else {
      return Response.json({ error: 'action غير معروف' }, { status: 400 })
    }

    await saveSettings(settings)
    return Response.json({ ok: true, settings })
  } catch (err) {
    console.error('[admin/lock] error:', err.message)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
