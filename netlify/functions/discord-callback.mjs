import { getGuildMemberRoles, json, roleFlags, roleLabel } from './_security.mjs'

const DISCORD_API_BASE = 'https://discord.com/api/v10'

async function exchangeCode(code) {
  const body = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID || '',
    client_secret: process.env.DISCORD_CLIENT_SECRET || '',
    grant_type: 'authorization_code',
    code,
    redirect_uri: process.env.DISCORD_REDIRECT_URI || '',
  })

  const response = await fetch(`${DISCORD_API_BASE}/oauth2/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  const data = await response.json()
  if (!response.ok) throw new Error(data?.error_description || data?.error || 'Failed to exchange Discord code.')
  return data
}

async function fetchDiscordUser(accessToken) {
  const response = await fetch(`${DISCORD_API_BASE}/users/@me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.message || 'Failed to fetch Discord user.')
  return data
}

export async function handler(event) {
  try {
    const code = event.queryStringParameters?.code
    const state = event.queryStringParameters?.state
    if (!code) return json(400, { ok: false, error: 'Missing OAuth code.' })

    const clientExchangeHeader =
      event.headers?.['x-msrp-client-exchange'] || event.headers?.['X-MSRP-CLIENT-EXCHANGE']
    const isClientExchange = clientExchangeHeader === '1'
    if (!isClientExchange) {
      const location = new URL('/', `https://${event.headers?.host || 'localhost'}`)
      location.searchParams.set('code', code)
      if (state) location.searchParams.set('state', state)
      return {
        statusCode: 302,
        headers: { location: location.toString() },
        body: '',
      }
    }

    const tokenData = await exchangeCode(code)
    const user = await fetchDiscordUser(tokenData.access_token)
    const { guildId, roles } = await getGuildMemberRoles(user.id)
    const permissions = roleFlags(roles)

    const avatarUrl = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
      : 'https://cdn.discordapp.com/embed/avatars/0.png'

    const payload = {
      ok: true,
      user: {
        id: String(user.id),
        username: String(user.username || ''),
        global_name: user.global_name || null,
        avatar: user.avatar || null,
        avatarUrl,
      },
      guildMembership: {
        guildId,
        isMember: roles.length > 0,
        roleIds: roles,
        permissions,
        roleLabel: roleLabel(permissions),
      },
    }

    return json(200, payload)
  } catch (error) {
    return json(500, { ok: false, error: error instanceof Error ? error.message : 'Discord callback failed.' })
  }
}
