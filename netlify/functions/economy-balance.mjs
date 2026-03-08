import { json } from './_security.mjs'
import { getUserEconomy } from './_unb.mjs'

export async function handler(event) {
  try {
    const discordUserId = String(event.queryStringParameters?.discordUserId || '')
    if (!discordUserId) return json(400, { ok: false, error: 'Missing discordUserId.' })
    const economy = await getUserEconomy(discordUserId)
    return json(200, { ok: true, economy })
  } catch (error) {
    const statusCode = typeof error === 'object' && error && 'statusCode' in error ? Number(error.statusCode) || 500 : 500
    return json(statusCode, { ok: false, error: error instanceof Error ? error.message : 'Failed to load economy.' })
  }
}
