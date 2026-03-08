import { buildListing, getListings, setListings } from './_store.mjs'
import { getGuildMemberRoles, json, roleFlags } from './_security.mjs'

const MAX_SHEETS_CELL_CHARS = 49000

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed.' })

  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const userId = String(body.userId || '')
    if (!userId) return json(400, { ok: false, error: 'Missing userId.' })

    const { roles } = await getGuildMemberRoles(userId)
    const permissions = roleFlags(roles)
    if (!permissions.hasManagementRole && !permissions.hasAgentRole) return json(403, { ok: false, error: 'Not authorized.' })

    const listing = buildListing({
      ...body,
      createdByUserId: userId,
      sellerUserId: body.sellerUserId || process.env.MSRP_RECEIVER_USER_ID || '210768103594917888',
    })

    if (!listing.title || !Number.isFinite(listing.price) || listing.price <= 0) return json(400, { ok: false, error: 'Listing title and price required.' })
    if (String(listing.imageUrl || '').length > MAX_SHEETS_CELL_CHARS) return json(400, { ok: false, error: 'Image data too large for Sheets cell limit.' })

    const listings = await getListings()
    listings.unshift(listing)
    await setListings(listings)

    return json(200, { ok: true, listing })
  } catch (error) {
    return json(500, { ok: false, error: error instanceof Error ? error.message : 'Failed to create listing.' })
  }
}
