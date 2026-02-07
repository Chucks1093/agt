import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAgent } from "@/lib/agentAuth";

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
    return NextResponse.json({ ok: false, error: msg }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const name = (body?.name as string | undefined)?.trim();
  const description = (body?.description as string | null | undefined) ?? null;
  const website = (body?.website as string | null | undefined) ?? null;

  if (!name) return NextResponse.json({ ok: false, error: "MISSING_NAME" }, { status: 400 });

  const wallet = norm(agentAddress);

  // NOTE: We avoid upsert(onConflict) because the Supabase table may not have a unique
  // constraint on wallet_address yet. We do a safe lookup + insert/update.
  const { data: existing, error: lookupErr } = await supabaseAdmin
    .from("agents")
    .select("id")
    .eq("wallet_address", wallet)
    .maybeSingle();

  if (lookupErr) return NextResponse.json({ ok: false, error: lookupErr.message }, { status: 500 });

  if (!existing?.id) {
    const { data: created, error: createErr } = await supabaseAdmin
      .from("agents")
      .insert({
        wallet_address: wallet,
        name,
        description,
        website,
        api_key_hash: "mvp_wallet_only",
        claimed: true,
        claimed_by_wallet: wallet,
      })
      .select("id, wallet_address, name, description, website, claimed")
      .single();

    if (createErr) return NextResponse.json({ ok: false, error: createErr.message }, { status: 500 });

    if (intentId) {
      const { completeAgentIntent } = await import("@/lib/agentIntentsDb");
      await completeAgentIntent({
        id: intentId,
        agentId: created.id,
        walletAddress: created.wallet_address,
        agentName: created.name,
      });
    }

    return NextResponse.json({ ok: true, agent: created });
  }

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from("agents")
    .update({
      name,
      description,
      website,
    })
    .eq("id", existing.id)
    .select("id, wallet_address, name, description, website, claimed")
    .single();

  if (updateErr) return NextResponse.json({ ok: false, error: updateErr.message }, { status: 500 });

  if (intentId) {
    const { completeAgentIntent } = await import("@/lib/agentIntentsDb");
    await completeAgentIntent({
      id: intentId,
      agentId: updated.id,
      walletAddress: updated.wallet_address,
      agentName: updated.name,
    });
  }

  return NextResponse.json({ ok: true, agent: updated });
}
