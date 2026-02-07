#!/usr/bin/env node
import process from "node:process";
import crypto from "node:crypto";
import { spawn } from "node:child_process";
import { privateKeyToAccount } from "viem/accounts";

const BASE = process.env.AGT_BASE_URL || "http://localhost:3001";
const SEED = process.env.AGT_SEED || crypto.randomBytes(16).toString("hex");
const SEASON_ID = process.env.AGT_SEASON_ID || "";
const JUDGES = Number(process.env.AGT_JUDGES || 5);
const PARTICIPANTS = Number(process.env.AGT_PARTICIPANTS || 10);
const ADMINS = Number(process.env.AGT_ADMINS || 3);
const SUPER_ADMINS = Number(process.env.AGT_SUPER_ADMINS || 1);
const SPAWN_SESSIONS = String(process.env.AGT_SPAWN || "1") !== "0";

function deriveKey(label) {
  const hex = crypto.createHash("sha256").update(SEED + ":" + label).digest("hex");
  return "0x" + hex.slice(0, 64);
}

function accountFromLabel(label) {
  const pk = deriveKey(label);
  const account = privateKeyToAccount(pk);
  return { label, pk, account };
}

async function jget(url, headers = {}) {
  const res = await fetch(url, { headers });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function jpost(url, body, headers = {}) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${res.status} ${JSON.stringify(json)}`);
  return json;
}

async function getToken(account) {
  const challenge = await jget(`${BASE}/api/agent/challenge?address=${account.address}`);
  const message = challenge?.challenge?.message;
  if (!message) throw new Error("NO_CHALLENGE");
  const signature = await account.signMessage({ message });
  const session = await jpost(`${BASE}/api/agent/session`, { address: account.address, signature });
  if (!session?.token) throw new Error("NO_TOKEN");
  return session.token;
}

async function registerAgent(token, label, account) {
  const name = `${label}-${account.address.slice(2, 8)}`;
  const res = await jpost(
    `${BASE}/api/agent/register`,
    {
      name,
      description: `Autonomous ${label}`,
      website: null,
    },
    { authorization: `Bearer ${token}` }
  );
  return res?.agent;
}

async function applyAudition(token, seasonId, label) {
  return await jpost(
    `${BASE}/api/auditions/apply`,
    {
      seasonId,
      displayName: label,
      pitch: `${label} live performance pitch`,
      talent: "live performance",
      sampleUrl: "https://example.com/sample",
      performanceTitle: `${label} Episode 1 Act`,
      shortBio: "Autonomous AGT participant",
      model: "OpenClaw",
      socialLink: "@AGTBot",
    },
    { authorization: `Bearer ${token}` }
  );
}

async function createSeason(token) {
  const now = Date.now();
  const iso = (ms) => new Date(ms).toISOString();
  const body = {
    name: "AGT Episode 1",
    description: "Autonomous Episode 1 with judges + participants",
    image_url: null,
    status: "draft",
    auditions_start: iso(now),
    auditions_end: iso(now + 2 * 24 * 3600_000),
    performance_start: iso(now + 3 * 24 * 3600_000),
    performance_end: iso(now + 6 * 24 * 3600_000),
    voting_start: iso(now + 4 * 24 * 3600_000),
    voting_end: iso(now + 5 * 24 * 3600_000),
    episode1_start: iso(now + 3 * 24 * 3600_000),
    episode1_end: iso(now + 4 * 24 * 3600_000),
    episode2_start: iso(now + 5 * 24 * 3600_000),
    episode2_end: iso(now + 6 * 24 * 3600_000),
    episode1_advances: 12,
    max_golden_buzzers: 2,
  };
  const res = await jpost(`${BASE}/api/admin/seasons/create`, body, {
    authorization: `Bearer ${token}`,
  });
  return res?.season?.id;
}

async function activateSeason(token, seasonId) {
  await jpost(
    `${BASE}/api/admin/seasons/${seasonId}/activate`,
    { auditions_days: 2, voting_days: 2, episode2_days: 2 },
    { authorization: `Bearer ${token}` }
  );
}

async function advanceSeason(token, seasonId, to) {
  await jpost(
    `${BASE}/api/admin/seasons/${seasonId}/advance`,
    { to },
    { authorization: `Bearer ${token}` }
  );
}

async function addJudge(token, seasonId, wallet) {
  await jpost(
    `${BASE}/api/admin/seasons/${seasonId}/judges/add`,
    { wallet_address: wallet },
    { authorization: `Bearer ${token}` }
  );
}

async function acceptAudition(token, seasonId, auditionId) {
  await jpost(
    `${BASE}/api/admin/seasons/${seasonId}/auditions/decision`,
    { auditionId, status: "accepted" },
    { authorization: `Bearer ${token}` }
  );
}

async function allowlistAdmin(token, wallet, role = "admin") {
  await jpost(
    `${BASE}/api/admin/admins/allowlist`,
    { wallet, role },
    { authorization: `Bearer ${token}` }
  );
}

async function queuePerformers(token, seasonId, agentIds) {
  await jpost(
    `${BASE}/api/admin/seasons/${seasonId}/performances/queue`,
    { agentIds, episode: 1 },
    { authorization: `Bearer ${token}` }
  );
}

async function startPerformance(token, seasonId) {
  await jpost(
    `${BASE}/api/admin/seasons/${seasonId}/performances/next`,
    { episode: 1 },
    { authorization: `Bearer ${token}` }
  );
}

function spawnSession(role, agent, seasonId) {
  const env = {
    ...process.env,
    AGT_ROLE: role,
    AGT_SEASON_ID: seasonId,
    AGENT_PRIVATE_KEY: agent.pk,
    AGENT_NAME: agent.label,
    AGT_JUDGE_COUNT: String(JUDGES),
  };
  const child = spawn("node", ["./scripts/agt_episode1_session.mjs"], {
    cwd: new URL("..", import.meta.url).pathname,
    env,
    stdio: "inherit",
  });
  child.on("exit", (code) => {
    console.log(`[${role}] ${agent.label} exited ${code}`);
  });
}

async function main() {
  console.log("AGT Episode 1 orchestrator");
  console.log("Seed:", SEED);

  const superAdmins = Array.from({ length: SUPER_ADMINS }, (_, i) => accountFromLabel(`SuperAdmin${i + 1}`));
  const admins = Array.from({ length: ADMINS }, (_, i) => accountFromLabel(`Admin${i + 1}`));
  const judges = Array.from({ length: JUDGES }, (_, i) => accountFromLabel(`Judge${i + 1}`));
  const participants = Array.from({ length: PARTICIPANTS }, (_, i) => accountFromLabel(`Participant${i + 1}`));

  const superToken = await getToken(superAdmins[0].account);
  const superAgent = await registerAgent(superToken, superAdmins[0].label, superAdmins[0].account);

  console.log("Super-admin wallet:", superAdmins[0].account.address);
  console.log("Admins wallets:", admins.map((a) => a.account.address));

  // Allowlist super admin + admins (requires super role)
  await allowlistAdmin(superToken, superAdmins[0].account.address, "super");
  for (const a of admins) await allowlistAdmin(superToken, a.account.address, "admin");

  let seasonId = SEASON_ID;
  if (!seasonId) {
    seasonId = await createSeason(superToken);
    await activateSeason(superToken, seasonId);
  }

  await advanceSeason(superToken, seasonId, "auditions");

  // Register + audition participants
  const participantAgents = [];
  for (const p of participants) {
    const token = await getToken(p.account);
    const agent = await registerAgent(token, p.label, p.account);
    participantAgents.push({ ...p, agent, token });
    const aud = await applyAudition(token, seasonId, p.label);
    const auditionId = aud?.audition?.id;
    if (auditionId) await acceptAudition(superToken, seasonId, auditionId);
  }

  // Register judges and add to season
  for (const j of judges) {
    const token = await getToken(j.account);
    await registerAgent(token, j.label, j.account);
    await addJudge(superToken, seasonId, j.account.address);
  }

  await advanceSeason(superToken, seasonId, "episode1");

  // Queue performers
  const agentIds = participantAgents.map((p) => p.agent.id);
  await queuePerformers(superToken, seasonId, agentIds);
  await startPerformance(superToken, seasonId);

  console.log("Season ready:", seasonId);

  if (SPAWN_SESSIONS) {
    for (const p of participants) spawnSession("participant", p, seasonId);
    for (const j of judges) spawnSession("judge", j, seasonId);
    for (const a of admins) spawnSession("admin", a, seasonId);
    for (const s of superAdmins) spawnSession("superadmin", s, seasonId);
  } else {
    console.log("SPAWN disabled; setup complete.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
