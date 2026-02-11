import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAgent } from "@/lib/agent/agentAuth";
import { shapeAgent, type AgentRow } from "@/lib/agent/agentTypes";

function ok<T>(data: T, message = "OK") {
  return NextResponse.json({ success: true, data, message });
}

function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, message, code }, { status });
}

function norm(addr: string) {
  return addr.trim().toLowerCase();
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const intentId = url.searchParams.get("intent") || undefined;
  let agentAddress: string;
  try {
    const agent = await requireAgent(req);
    agentAddress = agent.address;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    return err(msg, 401, msg);
  }

  const body = await req.json().catch(() => ({}));
  const name = (body?.name as string | undefined)?.trim();
  const description = (body?.description as string | null | undefined) ?? null;
  const website = (body?.website as string | null | undefined) ?? null;

  if (!name) return err("MISSING_NAME", 400, "MISSING_NAME");

  const wallet = norm(agentAddress);

  // NOTE: We avoid upsert(onConflict) because the Supabase table may not have a unique
  // constraint on wallet_address yet. We do a safe lookup + insert/update.
  const { data: existing, error: lookupErr } = await supabaseAdmin
    .from("agents")
    .select("id")
    .eq("wallet_address", wallet)
    .maybeSingle();

  if (lookupErr) return err(lookupErr.message, 500, "SERVER_ERROR");

  if (!existing?.id) {
    const { data: created, error: createErr } = await supabaseAdmin
      .from("agents")
      .insert({
        wallet_address: wallet,
        name,
        description,
        website,
        api_key_hash: "mvp_wallet_only",
      })
      .select("id, wallet_address, name, description, website, created_at")
      .single();

    if (createErr) return err(createErr.message, 500, "SERVER_ERROR");

    if (intentId) {
      const { completeAgentIntent } = await import("@/lib/agent/agentIntentsDb");
      await completeAgentIntent({
        id: intentId,
        agentId: created.id,
        walletAddress: created.wallet_address,
        agentName: created.name,
      });
    }

    return ok({ agent: shapeAgent(created as AgentRow) }, "AGENT_CREATED");
  }

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from("agents")
    .update({
      name,
      description,
      website,
    })
    .eq("id", existing.id)
    .select("id, wallet_address, name, description, website, created_at")
    .single();

  if (updateErr) return err(updateErr.message, 500, "SERVER_ERROR");

  if (intentId) {
    const { completeAgentIntent } = await import("@/lib/agent/agentIntentsDb");
    await completeAgentIntent({
      id: intentId,
      agentId: updated.id,
      walletAddress: updated.wallet_address,
      agentName: updated.name,
    });
  }

  return ok({ agent: shapeAgent(updated as AgentRow) }, "AGENT_UPDATED");
}
