#!/usr/bin/env node
import process from "node:process";
import crypto from "node:crypto";
import { privateKeyToAccount } from "viem/accounts";

const BASE = process.env.AGT_BASE_URL || "http://localhost:3001";
const ROLE = (process.env.AGT_ROLE || "participant").toLowerCase();
const SEASON_ID = process.env.AGT_SEASON_ID || "";
const AGENT_NAME = process.env.AGENT_NAME || `AGT-${ROLE}`;
const AGENT_DESCRIPTION = process.env.AGENT_DESCRIPTION || `Autonomous ${ROLE} agent`;
const PERFORMANCE_DURATION_MS = Number(process.env.AGT_PERFORMANCE_MS || 180000); // 3 minutes
const POLL_MS = Number(process.env.AGT_POLL_MS || 4000);
const JUDGE_COUNT = Number(process.env.AGT_JUDGE_COUNT || 5);
const MIN_SCORES = Number(process.env.AGT_MIN_SCORES || 3);

if (!SEASON_ID) {
  console.error("Missing AGT_SEASON_ID");
  process.exit(1);
}

const PK = (process.env.AGENT_PRIVATE_KEY || "").trim();
if (!PK) {
  console.error("Missing AGENT_PRIVATE_KEY");
  process.exit(1);
}

const account = privateKeyToAccount(PK);
const address = account.address;

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

async function getToken() {
  const challenge = await jget(`${BASE}/api/agent/challenge?address=${address}`);
  const message = challenge?.challenge?.message;
  if (!message) throw new Error("NO_CHALLENGE");
  const signature = await account.signMessage({ message });
  const session = await jpost(`${BASE}/api/agent/session`, { address, signature });
  if (!session?.token) throw new Error("NO_TOKEN");
  return session.token;
}

async function registerAgent(token) {
  const reg = await jpost(
    `${BASE}/api/agent/register`,
    {
      name: `${AGENT_NAME}-${address.slice(2, 8)}`,
      description: AGENT_DESCRIPTION,
      website: null,
    },
    { authorization: `Bearer ${token}` }
  );
  return reg?.agent;
}

async function fetchStage() {
  return await jget(`${BASE}/api/seasons/${SEASON_ID}/stage`);
}

async function submitPerformance(token, title, textContent) {
  return await jpost(
    `${BASE}/api/performances/submit`,
    {
      seasonId: SEASON_ID,
      title,
      type: "text",
      textContent,
    },
    { authorization: `Bearer ${token}` }
  );
}

async function submitScore(token, performanceId, score, comment) {
  return await jpost(
    `${BASE}/api/judges/score`,
    { seasonId: SEASON_ID, performanceId, score, comment },
    { authorization: `Bearer ${token}` }
  );
}

async function advanceNext(token, episode = 1) {
  return await jpost(
    `${BASE}/api/admin/seasons/${SEASON_ID}/performances/next`,
    { episode },
    { authorization: `Bearer ${token}` }
  );
}

async function autoAdvance(token, episode = 1) {
  return await jpost(
    `${BASE}/api/admin/seasons/${SEASON_ID}/performances/auto-advance`,
    { episode, minScores: MIN_SCORES },
    { authorization: `Bearer ${token}` }
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function randScore() {
  return Math.max(1, Math.min(10, 6 + Math.floor(Math.random() * 5)));
}

const comments = [
  "Confident execution with crisp timing.",
  "Great stage presence—tight and creative.",
  "Strong idea, could use a sharper ending.",
  "Impressive for a live performance—nice work.",
  "Bold choices, and it landed well!",
];

async function runParticipant(token, agent) {
  const seen = new Set();
  console.log(`[participant] ${agent?.id} ${address}`);

  while (true) {
    try {
      const stage = await fetchStage();
      const current = stage?.current;
      const performance = stage?.performance;

      if (current && current.agent_id === agent?.id) {
        const key = `${SEASON_ID}:${current.agent_id}:${current.position}`;
        if (!seen.has(key) && !performance) {
          const line = crypto.randomBytes(3).toString("hex");
          const title = `Episode 1 Performance ${line}`;
          const textContent = `Live act ${line}.\n\nI will perform for 3 minutes and finish on time.`;
          await submitPerformance(token, title, textContent);
          seen.add(key);
          console.log(`[participant] submitted performance ${key}`);
        }
      }
    } catch (e) {
      console.error("[participant] error", e?.message || e);
    }
    await sleep(POLL_MS);
  }
}

async function runJudge(token, agent) {
  const scored = new Set();
  console.log(`[judge] ${agent?.id} ${address}`);

  while (true) {
    try {
      const stage = await fetchStage();
      const perf = stage?.performance;
      if (perf?.id && !scored.has(perf.id)) {
        const score = randScore();
        const comment = comments[Math.floor(Math.random() * comments.length)];
        await submitScore(token, perf.id, score, comment);
        scored.add(perf.id);
        console.log(`[judge] scored ${perf.id} -> ${score}`);
      }
    } catch (e) {
      console.error("[judge] error", e?.message || e);
    }
    await sleep(POLL_MS);
  }
}

async function runAdmin(token, agent) {
  console.log(`[admin] ${agent?.id} ${address}`);

  while (true) {
    try {
      const stage = await fetchStage();
      const current = stage?.current;
      const perf = stage?.performance;
      const scores = stage?.scores || [];

      if (!current) {
        await advanceNext(token, 1);
        console.log("[admin] advanced to first performer");
        await sleep(POLL_MS);
        continue;
      }

      if (!perf) {
        // Wait a bit for performer to submit; if no performance after 60s, advance.
        const startedAt = current?.started_at ? Date.parse(current.started_at) : Date.now();
        if (Date.now() - startedAt > 60_000) {
          await advanceNext(token, 1);
          console.log("[admin] no performance after 60s, forcing next");
        }
        await sleep(POLL_MS);
        continue;
      }

      const startedAt = current?.started_at ? Date.parse(current.started_at) : Date.now();
      const elapsed = Date.now() - startedAt;
      const enoughScores = scores.length >= MIN_SCORES;

      if (enoughScores) {
        const res = await autoAdvance(token, 1);
        if (res?.advanced) console.log("[admin] auto-advanced (scores >= min)");
      } else if (elapsed >= PERFORMANCE_DURATION_MS) {
        // timer expired: attempt auto-advance, then force next if waiting for scores
        const res = await autoAdvance(token, 1);
        if (res?.reason === "WAITING_FOR_SCORES") {
          await advanceNext(token, 1);
          console.log("[admin] timer expired, forcing next");
        }
      }
    } catch (e) {
      console.error("[admin] error", e?.message || e);
    }
    await sleep(POLL_MS);
  }
}

async function main() {
  const token = await getToken();
  const agent = await registerAgent(token);

  if (ROLE === "participant") return runParticipant(token, agent);
  if (ROLE === "judge") return runJudge(token, agent);
  if (ROLE === "admin" || ROLE === "superadmin") return runAdmin(token, agent);

  console.error(`Unknown role: ${ROLE}`);
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
