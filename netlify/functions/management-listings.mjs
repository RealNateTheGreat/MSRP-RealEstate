import { getListings, getPurchaseRequests, setListings, setPurchaseRequests } from './_store.mjs'
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
      return json(200, { ok: true, listings })
    }

    if (event.httpMethod === 'PUT') {
      const body = event.body ? JSON.parse(event.body) : {}
      const requesterUserId = String(body.requesterUserId || '')
      const listingId = String(body.listingId || '')
      if (!requesterUserId || !listingId) return json(400, { ok: false, error: 'Missing requesterUserId or listingId.' })

      const permissions = await resolvePermissions(requesterUserId)
      if (!canManage(permissions)) return json(403, { ok: false, error: 'Forbidden.' })

      const listings = await getListings()
      const idx = listings.findIndex((item) => String(item.id) === listingId)
      if (idx === -1) return json(404, { ok: false, error: 'Listing not found.' })

      const current = listings[idx]
      const updated = {
        ...current,
        title: String(body.title ?? current.title).trim(),
        district: String(body.district ?? current.district).trim(),
        description: String(body.description ?? current.description).trim(),
        imageUrl: String(body.imageUrl ?? current.imageUrl).trim(),
        price: Number(body.price ?? current.price),
        status: String(body.status ?? current.status),
        sellerUserId: String(body.sellerUserId ?? current.sellerUserId),
      }

      if (!updated.title || !Number.isFinite(updated.price) || updated.price <= 0) {
        return json(400, { ok: false, error: 'Invalid listing fields.' })
      }

      listings[idx] = updated
      await setListings(listings)
      return json(200, { ok: true, listing: updated })
    }

    if (event.httpMethod === 'DELETE') {
      const body = event.body ? JSON.parse(event.body) : {}
      const requesterUserId = String(body.requesterUserId || '')
      const listingId = String(body.listingId || '')
      if (!requesterUserId || !listingId) return json(400, { ok: false, error: 'Missing requesterUserId or listingId.' })

      const permissions = await resolvePermissions(requesterUserId)
      if (!canManage(permissions)) return json(403, { ok: false, error: 'Forbidden.' })

      const listings = await getListings()
      const exists = listings.some((item) => String(item.id) === listingId)
      if (!exists) return json(404, { ok: false, error: 'Listing not found.' })

      const updatedListings = listings.filter((item) => String(item.id) !== listingId)
      const requests = await getPurchaseRequests()
      const updatedRequests = requests.filter((item) => String(item.listingId) !== listingId)
      await Promise.all([setListings(updatedListings), setPurchaseRequests(updatedRequests)])
      return json(200, { ok: true, deletedListingId: listingId })
    }

    return json(405, { ok: false, error: 'Method not allowed.' })
  } catch (error) {
    return json(500, { ok: false, error: error instanceof Error ? error.message : 'Management listings action failed.' })
  }
}
