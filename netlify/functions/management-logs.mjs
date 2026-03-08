import { appendSalesLog, getSalesLogs } from './_store.mjs'
import { getGuildMemberRoles, json, roleFlags } from './_security.mjs'

function canManage(flags) {
  return flags.hasManagementRole || flags.hasAgentRole
}

export async function handler(event) {
  try {
    const userId = String(event.queryStringParameters?.userId || '')
    if (!userId) return json(400, { ok: false, error: 'Missing userId.' })

    const { roles } = await getGuildMemberRoles(userId)
    const permissions = roleFlags(roles)
    if (!canManage(permissions)) return json(403, { ok: false, error: 'Forbidden: management access required.' })

    const logs = await getSalesLogs()
    return json(200, { ok: true, logs })
  } catch (error) {
    return json(500, { ok: false, error: error instanceof Error ? error.message : 'Failed to load logs.' })
  }
}
