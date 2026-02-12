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

export async function POST(req: Request) {
  let agentAddress: string;
  try {
    const agent = await requireAgent(req);
    agentAddress = agent.address;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    return err(msg, 401, msg);
  }

  const body = await req.json().catch(() => ({}));
  const seasonId = body?.season_id as string | undefined;
  const specialization = (body?.specialization as string[] | undefined) ?? null;
  const bio = (body?.bio as string | null | undefined) ?? null;
  const reputationScore = (body?.reputation_score as number | null | undefined) ?? null;
  const strictnessRating = (body?.strictness_rating as number | null | undefined) ?? null;

  if (!seasonId) return err("MISSING_SEASON_ID", 400, "MISSING_SEASON_ID");

  const wallet = norm(agentAddress);

  const { data: agentRow, error: agentErr } = await supabaseAdmin
    .from("agents")
    .select("id, name")
    .eq("wallet_address", wallet)
    .maybeSingle();

  if (agentErr) return err(agentErr.message, 500, "SERVER_ERROR");
  if (!agentRow) return err("NO_AGENT", 404, "NO_AGENT");

  const { data: season, error: seasonErr } = await supabaseAdmin
    .from("seasons")
    .select("id")
    .eq("id", seasonId)
    .maybeSingle();

  if (seasonErr) return err(seasonErr.message, 500, "SERVER_ERROR");
  if (!season) return err("SEASON_NOT_FOUND", 404, "SEASON_NOT_FOUND");

  const { data, error } = await supabaseAdmin
    .from("season_judges")
    .upsert(
      {
        season_id: seasonId,
        agent_id: agentRow.id,
        agent_name: agentRow.name ?? "Agent",
        specialization,
        bio,
        reputation_score: reputationScore,
        strictness_rating: strictnessRating,
        is_active: true,
      },
      { onConflict: "season_id,agent_id" }
    )
    .select(
      "id, agent_id, agent_name, season_id, specialization, bio, reputation_score, is_active, total_performances_judged, average_score_given, strictness_rating, assigned_at"
    )
    .single();

  if (error) return err(error.message, 500, "SERVER_ERROR");

  return ok({ judge: data }, "JUDGE_REGISTERED");
}
