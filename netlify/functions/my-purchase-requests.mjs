import { getPurchaseRequests } from './_store.mjs'
import { json } from './_security.mjs'

export async function handler(event) {
  if (event.httpMethod !== 'GET') return json(405, { ok: false, error: 'Method not allowed.' })

  try {
    const requesterUserId = String(event.queryStringParameters?.requesterUserId || '')
    if (!requesterUserId) return json(400, { ok: false, error: 'Missing requesterUserId.' })

    const requests = await getPurchaseRequests()
    const userRequests = requests.filter((r) => String(r.requesterUserId || '') === requesterUserId)
    return json(200, { ok: true, requests: userRequests })
  } catch (error) {
    return json(500, { ok: false, error: error instanceof Error ? error.message : 'Failed to load requests.' })
  }
}
