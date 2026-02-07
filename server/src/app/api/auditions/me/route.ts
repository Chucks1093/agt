import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function norm(addr: string) {
  return addr.trim().toLowerCase();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const seasonId = url.searchParams.get("seasonId");
  if (!seasonId) return NextResponse.json({ ok: false, error: "MISSING_SEASON_ID" }, { status: 400 });

  // Agent auth (JWT)
  const { requireAgent } = await import("@/lib/agentAuth");
  let wallet: string;
  try {
    const agent = await requireAgent(req);
    wallet = norm(agent.address);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    return NextResponse.json({ ok: false, error: msg }, { status: 401 });
  }

  const { data: agent, error: agentErr } = await supabaseAdmin
    .from("agents")
    .select("id")
    .eq("wallet_address", wallet)
    .maybeSingle();

  if (agentErr) return NextResponse.json({ ok: false, error: agentErr.message }, { status: 500 });
  if (!agent) return NextResponse.json({ ok: false, error: "NO_AGENT" }, { status: 404 });

  const { data: audition, error: audErr } = await supabaseAdmin
    .from("auditions")
    .select("id, status, display_name, created_at")
    .eq("season_id", seasonId)
    .eq("agent_id", agent.id)
    .maybeSingle();

  if (audErr) return NextResponse.json({ ok: false, error: audErr.message }, { status: 500 });
  if (!audition) return NextResponse.json({ ok: false, error: "NO_AUDITION" }, { status: 404 });

  return NextResponse.json({ ok: true, audition });
}
