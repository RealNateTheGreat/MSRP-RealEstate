import { json } from './_security.mjs'

export async function handler() {
  const clientId = process.env.DISCORD_CLIENT_ID
  const redirectUri = process.env.DISCORD_REDIRECT_URI
  if (!clientId || !redirectUri) return json(500, { ok: false, error: 'Missing DISCORD_CLIENT_ID or DISCORD_REDIRECT_URI env vars.' })

  const url = new URL('https://discord.com/api/oauth2/authorize')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', 'identify guilds')
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('prompt', 'consent')

  return {
    statusCode: 302,
    headers: { location: url.toString() },
    body: '',
  }
}
