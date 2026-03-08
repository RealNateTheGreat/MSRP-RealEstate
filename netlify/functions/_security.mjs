const DISCORD_API_BASE = 'https://discord.com/api/v10'

export function json(statusCode, payload) {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  }
}

export async function getGuildMemberRoles(userId) {
  const botToken = process.env.DISCORD_BOT_TOKEN
  const guildId = process.env.MSRP_ECONOMY_GUILD_ID || '1436980269151424564'
  if (!botToken) return { guildId, roles: [] }

  const response = await fetch(`${DISCORD_API_BASE}/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(userId)}`, {
    headers: {
      Authorization: `Bot ${botToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) return { guildId, roles: [] }
  const member = await response.json()
  return {
    guildId,
    roles: Array.isArray(member?.roles) ? member.roles.map((r) => String(r)) : [],
  }
}

export function roleFlags(roleIds) {
  const managementRoleId = process.env.MSRP_MANAGEMENT_ROLE_ID || 'WaitForManagementRoleID'
  const agentRoleId = process.env.MSRP_AGENT_ROLE_ID || 'WaitForAgentRoleID'
  const set = new Set((roleIds || []).map((r) => String(r)))
  return {
    managementRoleId,
    agentRoleId,
    hasManagementRole: set.has(String(managementRoleId)),
    hasAgentRole: set.has(String(agentRoleId)),
  }
}

export function roleLabel(flags) {
  if (flags.hasManagementRole) return 'Real Estate Management'
  if (flags.hasAgentRole) return 'Real Estate Agent'
  return 'Community Member'
}
