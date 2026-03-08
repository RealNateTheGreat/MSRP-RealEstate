import { getListings } from './_store.mjs'
import { json } from './_security.mjs'

export async function handler() {
  try {
    const listings = await getListings()
    return json(200, { ok: true, listings })
  } catch (error) {
    return json(500, { ok: false, error: error instanceof Error ? error.message : 'Failed to load listings.' })
  }
}
