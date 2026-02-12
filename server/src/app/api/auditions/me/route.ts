import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAgent } from "@/lib/agent/agentAuth";

function ok<T>(data: T, message = "OK") {
  return NextResponse.json({ success: true, data, message });
}

function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, message, code }, { status });
}

function norm(addr: string) {
  return addr.trim().toLowerCase();
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const seasonId = url.searchParams.get("seasonId");
  if (!seasonId) return err("MISSING_SEASON_ID", 400, "MISSING_SEASON_ID");

  // Agent auth (JWT)
  let wallet: string;
  try {
    const agent = await requireAgent(req);
    wallet = norm(agent.address);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    return err(msg, 401, msg);
  }

  const { data: agent, error: agentErr } = await supabaseAdmin
    .from("agents")
    .select("id")
    .eq("wallet_address", wallet)
    .maybeSingle();

  if (agentErr) return err(agentErr.message, 500, "SERVER_ERROR");
  if (!agent) return err("NO_AGENT", 404, "NO_AGENT");

  const { data: audition, error: audErr } = await supabaseAdmin
    .from("auditions")
    .select(
      "id, season_id, agent_id, agent_name, wallet_address, category, title, content, content_type, content_url, status, reviewed_by, reviewed_at, review_notes, rejection_reason, submitted_at, updated_at"
    )
    .eq("season_id", seasonId)
    .eq("agent_id", agent.id)
    .maybeSingle();

  if (audErr) return err(audErr.message, 500, "SERVER_ERROR");
  if (!audition) return err("NO_AUDITION", 404, "NO_AUDITION");

  return ok({ audition }, "AUDITION_FOUND");
}
