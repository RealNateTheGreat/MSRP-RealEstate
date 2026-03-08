import { appendSalesLog, getListings, getPurchaseRequests, setListings, setPurchaseRequests } from './_store.mjs'
import { getGuildMemberRoles, json, roleFlags } from './_security.mjs'

function canManage(permissions) {
  return permissions.hasManagementRole || permissions.hasAgentRole
}

async function resolvePermissions(userId) {
  const { roles } = await getGuildMemberRoles(userId)
  return roleFlags(roles)
}

export async function handler(event) {
  try {
    if (event.httpMethod === 'GET') {
      const requesterUserId = String(event.queryStringParameters?.requesterUserId || '')
      if (!requesterUserId) return json(400, { ok: false, error: 'Missing requesterUserId.' })
      const permissions = await resolvePermissions(requesterUserId)
      if (!canManage(permissions)) return json(403, { ok: false, error: 'Forbidden.' })
      const listings = await getListings()
      const ownedListings = listings.filter((item) => String(item.ownerUserId || '').trim() !== '')
      return json(200, { ok: true, ownedListings })
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {}
      const requesterUserId = String(body.requesterUserId || '')
      const listingId = String(body.listingId || '')
      const reason = String(body.reason || '').trim()

      if (!requesterUserId || !listingId) return json(400, { ok: false, error: 'Missing requesterUserId or listingId.' })
      const permissions = await resolvePermissions(requesterUserId)
      if (!canManage(permissions)) return json(403, { ok: false, error: 'Forbidden.' })

      const listings = await getListings()
      const idx = listings.findIndex((item) => String(item.id) === listingId)
      if (idx === -1) return json(404, { ok: false, error: 'Listing not found.' })
      const listing = listings[idx]
      if (!listing.ownerUserId) return json(409, { ok: false, error: 'Listing is not currently owned.' })

      const updatedListings = listings.filter((item) => String(item.id) !== listingId)
      const requests = await getPurchaseRequests()
      const updatedRequests = requests.filter((item) => String(item.listingId) !== listingId)
      await Promise.all([setListings(updatedListings), setPurchaseRequests(updatedRequests)])

      await appendSalesLog({ listingId: listing.id, listingTitle: listing.title, price: Number(listing.price || 0), buyerUserId: '', receiverUserId: String(listing.ownerUserId || ''), status: 'listing_deleted_by_management' })

      return json(200, { ok: true, deletedListingId: listingId, note: reason })
    }

    return json(405, { ok: false, error: 'Method not allowed.' })
  } catch (error) {
    return json(500, { ok: false, error: error instanceof Error ? error.message : 'Failed owned-listing action.' })
  }
}
