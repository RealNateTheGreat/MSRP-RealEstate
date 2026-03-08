import { getGuildMemberRoles, json, roleFlags } from './_security.mjs'
import { getUserEconomy, patchEconomy } from './_unb.mjs'

function ensureAuthorized(permissions) {
  return permissions.hasManagementRole
}

async function resolvePermissions(requesterUserId) {
  const { roles } = await getGuildMemberRoles(requesterUserId)
  return roleFlags(roles)
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'GET') {
      const requesterUserId = String(event.queryStringParameters?.requesterUserId || '')
      const targetUserId = String(event.queryStringParameters?.targetUserId || '')
      if (!requesterUserId || !targetUserId) return json(400, { ok: false, error: 'Missing requesterUserId or targetUserId.' })

      const permissions = await resolvePermissions(requesterUserId)
      if (!ensureAuthorized(permissions)) return json(403, { ok: false, error: `Forbidden: Economy Admin requires MSRP_MANAGEMENT_ROLE_ID (${permissions.managementRoleId}).` })

      const economy = await getUserEconomy(targetUserId)
      return json(200, { ok: true, targetUserId, economy })
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {}
      const requesterUserId = String(body.requesterUserId || '')
      const targetUserId = String(body.targetUserId || '')
      const mode = String(body.mode || 'adjust')
      const reason = String(body.reason || 'MSRP management economy update')

      if (!requesterUserId || !targetUserId) return json(400, { ok: false, error: 'Missing requesterUserId or targetUserId.' })

      const permissions = await resolvePermissions(requesterUserId)
      if (!ensureAuthorized(permissions)) return json(403, { ok: false, error: `Forbidden: Economy Admin requires MSRP_MANAGEMENT_ROLE_ID (${permissions.managementRoleId}).` })

      const current = await getUserEconomy(targetUserId)

      if (mode === 'set') {
        const targetCash = Number(body.targetCash ?? current.cash)
        const targetBank = Number(body.targetBank ?? current.bank)
        const deltaCash = Math.round(targetCash - current.cash)
        const deltaBank = Math.round(targetBank - current.bank)
        if (deltaCash !== 0 || deltaBank !== 0) {
          await patchEconomy(targetUserId, { cash: deltaCash, bank: deltaBank, reason })
        }
      } else {
        const adjustCash = Math.round(Number(body.adjustCash || 0))
        const adjustBank = Math.round(Number(body.adjustBank || 0))
        if (adjustCash === 0 && adjustBank === 0) return json(400, { ok: false, error: 'No economy changes provided.' })
        await patchEconomy(targetUserId, { cash: adjustCash, bank: adjustBank, reason })
      }

      const updated = await getUserEconomy(targetUserId)
      return json(200, { ok: true, targetUserId, economy: updated })
    }

    return json(405, { ok: false, error: 'Method not allowed.' })
  } catch (error) {
    const statusCode = typeof error === 'object' && error && 'statusCode' in error ? Number(error.statusCode) || 500 : 500
    return json(statusCode, { ok: false, error: error instanceof Error ? error.message : 'Management economy action failed.' })
  }
}
