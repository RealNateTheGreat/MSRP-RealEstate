import { getListings } from './_store.mjs'
import { json } from './_security.mjs'

export async function handler(event) {
  try {
    const userId = String(event.queryStringParameters?.userId || '')
    if (!userId) return json(400, { ok: false, error: 'Missing userId query parameter.' })
    const listings = await getListings()
    const activeProperties = listings.filter((item) => String(item.ownerUserId || '') === userId)
    return json(200, { ok: true, activeProperties })
  } catch (error) {
    return json(500, { ok: false, error: error instanceof Error ? error.message : 'Failed to load active properties.' })
  }
}
