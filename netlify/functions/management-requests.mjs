import { appendSalesLog, getListings, getPurchaseRequests, setListings, setPurchaseRequests } from './_store.mjs'
import { getGuildMemberRoles, json, roleFlags } from './_security.mjs'
import { transferForApprovedRequest } from './_unb.mjs'

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
      if (!canManage(permissions)) return json(403, { ok: false, error: 'Forbidden: Management tab access required.' })
      const requests = await getPurchaseRequests()
      return json(200, { ok: true, requests })
    }

    if (event.httpMethod === 'POST') {
      const body = event.body ? JSON.parse(event.body) : {}
      const requesterUserId = String(body.requesterUserId || '')
      const requestId = String(body.requestId || '')
      const action = String(body.action || '')
      const decisionReason = String(body.decisionReason || '')
      if (!requesterUserId || !requestId || !action) return json(400, { ok: false, error: 'Missing fields.' })
      if (!['approve', 'deny'].includes(action)) return json(400, { ok: false, error: 'Invalid action.' })

      const permissions = await resolvePermissions(requesterUserId)
      if (!canManage(permissions)) return json(403, { ok: false, error: 'Forbidden: Management tab access required.' })

      const requests = await getPurchaseRequests()
      const idx = requests.findIndex((r) => String(r.id) === requestId)
      if (idx === -1) return json(404, { ok: false, error: 'Request not found.' })
      const target = requests[idx]
      if (target.status !== 'pending') return json(409, { ok: false, error: 'Request already processed.' })

      if (action === 'deny') {
        requests[idx] = { ...target, status: 'denied', decisionReason, reviewedByUserId: requesterUserId, updatedAt: new Date().toISOString() }
        await setPurchaseRequests(requests)
        return json(200, { ok: true, request: requests[idx] })
      }

      const listings = await getListings()
      const listingIdx = listings.findIndex((l) => String(l.id) === String(target.listingId))
      if (listingIdx === -1) return json(404, { ok: false, error: 'Listing missing for this request.' })
      const listing = listings[listingIdx]
      if (listing.status !== 'listed') return json(409, { ok: false, error: 'Listing is no longer listed.' })

      const receiverUserId = String(listing.sellerUserId || '') || process.env.MSRP_RECEIVER_USER_ID || '210768103594917888'

      await transferForApprovedRequest({ buyerUserId: String(target.requesterUserId), receiverUserId, amount: Number(listing.price || 0), listingId: String(listing.id) })

      listings[listingIdx] = { ...listing, status: 'sold', ownerUserId: String(target.requesterUserId), ownerName: String(target.requesterName || ''), soldAt: new Date().toISOString() }
      requests[idx] = { ...target, status: 'approved', decisionReason, reviewedByUserId: requesterUserId, updatedAt: new Date().toISOString() }

      for (let i = 0; i < requests.length; i += 1) {
        if (i === idx) continue
        const current = requests[i]
        if (String(current.listingId) === String(target.listingId) && String(current.status) === 'pending') {
          requests[i] = { ...current, status: 'denied', decisionReason: 'Another buyer was approved for this listing.', reviewedByUserId: requesterUserId, updatedAt: new Date().toISOString() }
        }
      }

      await Promise.all([setListings(listings), setPurchaseRequests(requests)])
      await appendSalesLog({ listingId: listing.id, listingTitle: listing.title, price: Number(listing.price || 0), buyerUserId: String(target.requesterUserId), receiverUserId, status: 'approved_request_sale' })

      return json(200, { ok: true, request: requests[idx], listing: listings[listingIdx] })
    }

    return json(405, { ok: false, error: 'Method not allowed.' })
  } catch (error) {
    const statusCode = typeof error === 'object' && error && 'statusCode' in error ? Number(error.statusCode) || 500 : 500
    return json(statusCode, { ok: false, error: error instanceof Error ? error.message : 'Failed to process management request action.' })
  }
}
