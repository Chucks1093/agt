export type AgentIntentStatus = "pending" | "completed" | "expired";

export type AgentIntent = {
  id: string;
  createdAt: number;
  expiresAt: number;
  status: AgentIntentStatus;
  agent?: {
    id: string;
    wallet_address: string;
    name: string | null;
  };
};

const intents = new Map<string, AgentIntent>();

export function createIntent(ttlMs = 10 * 60 * 1000) {
  const id = crypto.randomUUID();
  const now = Date.now();
  const intent: AgentIntent = {
    id,
    createdAt: now,
    expiresAt: now + ttlMs,
    status: "pending",
  };
  intents.set(id, intent);
  return intent;
}

export function getIntent(id: string) {
  const intent = intents.get(id);
  if (!intent) return null;
  if (intent.status !== "completed" && Date.now() > intent.expiresAt) {
    intent.status = "expired";
    intents.set(id, intent);
  }
  return intent;
}

export function completeIntent(id: string, agent: AgentIntent["agent"]) {
  const intent = intents.get(id);
  if (!intent) return null;
  intent.status = "completed";
  intent.agent = agent || undefined;
  intents.set(id, intent);
  return intent;
}
