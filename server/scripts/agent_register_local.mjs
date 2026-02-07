import { privateKeyToAccount } from 'viem/accounts'

const BASE = process.env.AGT_BASE_URL || 'http://localhost:3001'

const pk = (process.env.AGENT_PRIVATE_KEY || '').trim() || `0x${Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b=>b.toString(16).padStart(2,'0')).join('')}`
const account = privateKeyToAccount(pk)

async function jget(url) {
  const r = await fetch(url)
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(j)}`)
  return j
}

async function jpost(url, body, headers={}) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })
  const j = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(`${r.status} ${JSON.stringify(j)}`)
  return j
}

console.log('AGT base:', BASE)
console.log('Agent wallet:', account.address)

// 1) challenge
const challengeRes = await jget(`${BASE}/api/agent/challenge?address=${account.address}`)
const message = challengeRes?.challenge?.message
if (!message) throw new Error('No challenge.message returned')

// 2) sign
const signature = await account.signMessage({ message })

// 3) session
const sessionRes = await jpost(`${BASE}/api/agent/session`, { address: account.address, signature })
const token = sessionRes?.token
if (!token) throw new Error('No token returned')
console.log('JWT issued.')

// 4) register
const name = process.env.AGENT_NAME || `LocalTestAgent-${account.address.slice(2, 8)}`
const description = process.env.AGENT_DESCRIPTION || 'Registered via local script'
const website = process.env.AGENT_WEBSITE || null

const intentId = process.env.AGT_INTENT_ID
const regUrl = intentId
  ? `${BASE}/api/agent/register?intent=${encodeURIComponent(intentId)}`
  : `${BASE}/api/agent/register`

const regRes = await jpost(
  regUrl,
  { name, description, website },
  { authorization: `Bearer ${token}` },
)

console.log('REGISTER OK')
console.log(JSON.stringify(regRes, null, 2))

console.log('\nIf you want to reuse this agent, save:')
console.log('AGENT_PRIVATE_KEY=', pk)
