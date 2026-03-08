const UNB_BASE_URL = 'https://unbelievaboat.com/api/v1'
const ECONOMY_PERMISSION_BIT = 1
const permissionCache = new Map()

function getToken() {
  const token = process.env.UNBELIEVABOAT_API_TOKEN
  if (!token) throw new Error('Missing UNBELIEVABOAT_API_TOKEN env var.')
  return token
}

function getGuildId() {
  return process.env.MSRP_ECONOMY_GUILD_ID || '1436980269151424564'
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options)
  const text = await response.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = { raw: text }
  }
  if (!response.ok) {
    const message = data?.error || data?.message || `UnbelievaBoat request failed (${response.status})`
    const err = new Error(`[UNB ${response.status}] ${message}`)
    err.statusCode = response.status
    throw err
  }
  return data
}

function userEndpoint(userId) {
  const guildId = getGuildId()
  return `${UNB_BASE_URL}/guilds/${encodeURIComponent(guildId)}/users/${encodeURIComponent(userId)}`
}

async function ensureEconomyPermission() {
  const guildId = getGuildId()
  if (permissionCache.get(guildId) === true) return

  const perms = await fetchJson(`${UNB_BASE_URL}/applications/@me/guilds/${encodeURIComponent(guildId)}`, {
    headers: {
      Authorization: getToken(),
      Accept: 'application/json',
    },
  })

  const rawPermissions = Number(perms?.permissions || 0)
  const hasEconomy = (rawPermissions & ECONOMY_PERMISSION_BIT) === ECONOMY_PERMISSION_BIT
  if (!hasEconomy) {
    const err = new Error(`[UNB 403] Missing ECONOMY application permission for guild ${guildId}. Authorize the token with economy scope in UnbelievaBoat dashboard.`)
    err.statusCode = 403
    throw err
  }
  permissionCache.set(guildId, true)
}

export async function getUserEconomy(userId) {
  await ensureEconomyPermission()
  const raw = await fetchJson(userEndpoint(userId), {
    headers: {
      Authorization: getToken(),
      Accept: 'application/json',
    },
  })

  const cash = Number(raw?.cash ?? raw?.wallet ?? raw?.balance ?? 0)
  const bank = Number(raw?.bank ?? raw?.bank_balance ?? 0)
  return { cash, bank, total: cash + bank, raw }
}

export async function patchEconomy(userId, payload) {
  await ensureEconomyPermission()
  return fetchJson(userEndpoint(userId), {
    method: 'PATCH',
    headers: {
      Authorization: getToken(),
      'content-type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

export async function transferForApprovedRequest({ buyerUserId, receiverUserId, amount, listingId }) {
  if (amount <= 0) throw new Error('Amount must be greater than 0.')
  const buyer = await getUserEconomy(buyerUserId)
  const available = Number(buyer.cash || 0) + Number(buyer.bank || 0)
  if (available < amount) throw new Error('Insufficient total funds (cash + bank) for this purchase request.')

  let cashDelta = 0
  let bankDelta = 0
  if (buyer.cash >= amount) {
    cashDelta = -Math.abs(amount)
  } else {
    cashDelta = -Math.abs(buyer.cash)
    bankDelta = -Math.abs(amount - buyer.cash)
  }

  await patchEconomy(buyerUserId, {
    cash: cashDelta,
    bank: bankDelta,
    reason: `Approved property request: ${listingId}`,
  })

  await patchEconomy(receiverUserId, {
    bank: Math.abs(amount),
    reason: `Approved property sale: ${listingId}`,
  })

  return { buyerBefore: buyer, amount }
}
