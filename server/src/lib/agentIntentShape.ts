import type { AgentIntentRow } from "@/lib/agentIntentsDb";

export function shapeIntent(row: AgentIntentRow) {
  return {
    id: row.id,
    status: row.status,
    created_at: row.created_at,
    expires_at: row.expires_at,
    agent: row.agent_id && row.agent_wallet_address
      ? {
          id: row.agent_id,
          wallet_address: row.agent_wallet_address,
          name: row.agent_name,
        }
      : null,
  };
}
