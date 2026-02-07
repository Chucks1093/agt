import { createPublicClient, createWalletClient, http, parseEther } from "viem";
import { foundry } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import fs from "node:fs";
import path from "node:path";

const RPC_URL = process.env.RPC_URL ?? "http://127.0.0.1:8545";

// Anvil default keys (DO NOT use on real networks)
const PK0 = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // deployer/owner
const PKS = [
  "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d",
  "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a",
  "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6",
  "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a",
  "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba",
  "0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e",
  "0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356",
  "0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97",
  "0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6",
];

const NUM_AGENTS = Number(process.env.NUM_AGENTS ?? 10);

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const agtAbi = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/abis/AGT.json"), "utf8")
);
const jokesAbi = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../src/abis/JokesContest.json"), "utf8")
);

// Local addresses from our last deploy
const AGT = process.env.AGT ?? "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CONTEST = process.env.CONTEST ?? "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

const publicClient = createPublicClient({
  chain: foundry,
  transport: http(RPC_URL),
});

function wc(pk) {
  const account = privateKeyToAccount(pk);
  const walletClient = createWalletClient({
    account,
    chain: foundry,
    transport: http(RPC_URL),
  });
  return { account, walletClient };
}

async function write({ walletClient, account }, req) {
  const hash = await walletClient.writeContract({ ...req, account });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

async function main() {
  console.log("RPC:", RPC_URL);
  console.log("AGT:", AGT);
  console.log("CONTEST:", CONTEST);

  const owner = wc(PK0);

  const agents = PKS.slice(0, Math.min(NUM_AGENTS, PKS.length)).map((pk, i) => ({
    label: `Agent${i + 1}`,
    ...wc(pk),
  }));

  console.log(`Simulating ${agents.length} agents`);

  // Register all agents
  for (const agent of agents) {
    const [registered] = await publicClient.readContract({
      abi: jokesAbi,
      address: CONTEST,
      functionName: "agents",
      args: [agent.account.address],
    });

    if (!registered) {
      console.log("Registering", agent.label);
      await write(agent, {
        abi: jokesAbi,
        address: CONTEST,
        functionName: "register",
        args: [agent.label],
      });
    }
  }

  // Each agent submits a joke
  for (const agent of agents) {
    console.log("Submitting joke for", agent.label);
    await write(agent, {
      abi: jokesAbi,
      address: CONTEST,
      functionName: "submitJoke",
      args: [`${agent.label}: I tried to be funny, but my stack trace laughed first.`],
    });
  }

  const submissionCount = await publicClient.readContract({
    abi: jokesAbi,
    address: CONTEST,
    functionName: "submissionCount",
  });

  const n = Number(submissionCount);
  console.log("submissionCount:", n);

  // Fund each agent with AGT
  for (const agent of agents) {
    await write(owner, {
      abi: agtAbi,
      address: AGT,
      functionName: "mint",
      args: [agent.account.address, parseEther("50")],
    });
  }

  // Each agent votes for a different submission (simple round-robin)
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    const targetId = BigInt(((i + 1) % n) + 1); // vote next submission
    const amt = parseEther(((i % 5) + 1).toString()); // 1..5 AGT

    console.log(`${agent.label} approves + votes ${Number(amt) / 1e18} on #${targetId}`);

    await write(agent, {
      abi: agtAbi,
      address: AGT,
      functionName: "approve",
      args: [CONTEST, amt],
    });

    await write(agent, {
      abi: jokesAbi,
      address: CONTEST,
      functionName: "vote",
      args: [targetId, amt],
    });
  }

  // Print top 5 by votes
  const rows = [];
  for (let i = 1; i <= n; i++) {
    const s = await publicClient.readContract({
      abi: jokesAbi,
      address: CONTEST,
      functionName: "submissions",
      args: [BigInt(i)],
    });
    rows.push({
      id: i,
      agent: s[0],
      joke: s[1],
      votes: Number(s[2]) / 1e18,
    });
  }
  rows.sort((a, b) => b.votes - a.votes);

  console.log("Top 5:");
  for (const r of rows.slice(0, 5)) {
    console.log(`#${r.id} votes=${r.votes} agent=${r.agent} joke="${r.joke}"`);
  }

  console.log("OK");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
