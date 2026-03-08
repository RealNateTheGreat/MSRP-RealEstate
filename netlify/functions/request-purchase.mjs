import { buildPurchaseRequest, getListings, getPurchaseRequests, setPurchaseRequests } from './_store.mjs'
import { json } from './_security.mjs'

export async function handler(event) {
  if (event.httpMethod !== 'POST') return json(405, { ok: false, error: 'Method not allowed.' })

  try {
    const body = event.body ? JSON.parse(event.body) : {}
    const listingId = String(body.listingId || '')
    const requesterUserId = String(body.requesterUserId || '')
    const requesterName = String(body.requesterName || '')
    const requestReason = String(body.requestReason || '')

    if (!listingId || !requesterUserId) return json(400, { ok: false, error: 'Missing listingId or requesterUserId.' })

    const listings = await getListings()
    const listing = listings.find((item) => String(item.id) === listingId)
    if (!listing) return json(404, { ok: false, error: 'Listing not found.' })
    if (listing.status !== 'listed') return json(409, { ok: false, error: 'Listing is not available.' })

    const requests = await getPurchaseRequests()
    const duplicate = requests.find((item) => String(item.listingId) === listingId && String(item.requesterUserId) === requesterUserId && String(item.status) === 'pending')
    if (duplicate) return json(409, { ok: false, error: 'You already have an active request for this listing.' })

    const req = buildPurchaseRequest({
      listingId,
      listingTitle: listing.title,
      listingPrice: listing.price,
      listingSellerUserId: listing.sellerUserId,
      requesterUserId,
      requesterName,
      requestReason,
    })
    requests.unshift(req)
    await setPurchaseRequests(requests)
    return json(200, { ok: true, request: req })
  } catch (error) {
    return json(500, { ok: false, error: error instanceof Error ? error.message : 'Failed to create request.' })
  }
}
