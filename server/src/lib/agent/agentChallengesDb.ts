import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAddress, verifyMessage } from "viem";
import type { AgentChallenge } from "@shared/agent.types";

export type AgentChallengeRow = {
  address: string;
  nonce: string;
  message: string;
  created_at: string;
  expires_at: string;
};

export async function createChallenge(addressRaw: string): Promise<AgentChallenge> {
  const address = addressRaw?.trim() as string;
  if (!isAddress(address)) throw new Error("INVALID_ADDRESS");

  const nonce = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = new Date(now + 5 * 60 * 1000).toISOString();

  const message = [
    "AgentGotTalent Agent Session",
    `Address: ${address}`,
    `Nonce: ${nonce}`,
    `IssuedAt: ${new Date(now).toISOString()}`,
    `ExpiresAt: ${expiresAt}`,
  ].join("\n");

  // One active challenge per address
  const { error: delErr } = await supabaseAdmin
    .from("agent_challenges")
    .delete()
    .eq("address", address.toLowerCase());
  if (delErr) throw new Error(delErr.message);

  const { data, error } = await supabaseAdmin
    .from("agent_challenges")
    .insert({
      address: address.toLowerCase(),
      nonce,
      message,
      expires_at: expiresAt,
    })
    .select("address, nonce, message, created_at, expires_at")
    .single();

  if (error) throw new Error(error.message);
  return data as AgentChallengeRow;
}

export async function redeemChallenge(params: {
  addressRaw: string;
  signature: `0x${string}`;
}) {
  const address = params.addressRaw?.trim() as string;
  if (!isAddress(address)) throw new Error("INVALID_ADDRESS");

  const addr = address.toLowerCase();
  const { data, error } = await supabaseAdmin
    .from("agent_challenges")
    .select("address, message, expires_at")
    .eq("address", addr)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("NO_CHALLENGE");

  const expiresAt = new Date(data.expires_at).getTime();
  if (Date.now() > expiresAt) {
    await supabaseAdmin.from("agent_challenges").delete().eq("address", addr);
    throw new Error("CHALLENGE_EXPIRED");
  }

  const ok = await verifyMessage({
    address: address as `0x${string}`,
    message: data.message,
    signature: params.signature,
  });

  if (!ok) throw new Error("INVALID_SIGNATURE");

  // one-time use
  await supabaseAdmin.from("agent_challenges").delete().eq("address", addr);

  return { address: address as `0x${string}` };
}
