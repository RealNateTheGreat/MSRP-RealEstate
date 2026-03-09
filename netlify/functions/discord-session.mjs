import { getGuildMemberRoles, json, roleFlags, roleLabel } from './_security.mjs'

export async function handler(event) {
  try {
    if (event.httpMethod !== 'GET') return json(405, { ok: false, error: 'Method not allowed.' })
    const userId = String(event.queryStringParameters?.userId || '')
    if (!userId) return json(400, { ok: false, error: 'Missing userId.' })

    const { guildId, roles } = await getGuildMemberRoles(userId)
    const permissions = roleFlags(roles)

    return json(200, {
      ok: true,
      guildMembership: {
        guildId,
        isMember: roles.length > 0,
        roleIds: roles,
        permissions,
        roleLabel: roleLabel(permissions),
      },
    })
  } catch (error) {
    return json(500, { ok: false, error: error instanceof Error ? error.message : 'Failed to refresh session roles.' })
  }
}
