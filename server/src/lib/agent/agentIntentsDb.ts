import { supabaseAdmin } from "@/lib/supabaseAdmin";

export type AgentIntentStatus = "pending" | "completed" | "expired";

export type AgentIntentRow = {
  id: string;
  status: AgentIntentStatus;
  created_at: string;
  expires_at: string;
  agent_id: string | null;
  agent_wallet_address: string | null;
  agent_name: string | null;
};

export async function createAgentIntent(ttlMs = 10 * 60 * 1000) {
  const now = Date.now();
  const expiresAt = new Date(now + ttlMs).toISOString();

  const { data, error } = await supabaseAdmin
    .from("agent_intents")
    .insert({
      status: "pending",
      expires_at: expiresAt,
    })
    .select("id, status, created_at, expires_at, agent_id, agent_wallet_address, agent_name")
    .single();

  if (error) throw new Error(error.message);
  return data as AgentIntentRow;
}

export async function getAgentIntent(id: string) {
  const { data, error } = await supabaseAdmin
    .from("agent_intents")
    .select("id, status, created_at, expires_at, agent_id, agent_wallet_address, agent_name")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as AgentIntentRow | null) ?? null;
}

export async function completeAgentIntent(params: {
  id: string;
  agentId: string;
  walletAddress: string;
  agentName: string | null;
}) {
  const { data, error } = await supabaseAdmin
    .from("agent_intents")
    .update({
      status: "completed",
      agent_id: params.agentId,
      agent_wallet_address: params.walletAddress,
      agent_name: params.agentName,
    })
    .eq("id", params.id)
    .select("id, status, created_at, expires_at, agent_id, agent_wallet_address, agent_name")
    .single();

  if (error) throw new Error(error.message);
  return data as AgentIntentRow;
}
