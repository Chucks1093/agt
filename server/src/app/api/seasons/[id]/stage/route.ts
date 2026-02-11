import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function ok<T>(data: T, message = "OK") {
  return NextResponse.json({ success: true, data, message });
}

function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, message, code }, { status });
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id))
    return err("INVALID_SEASON_ID", 400, "INVALID_SEASON_ID");

  return err("NOT_IMPLEMENTED", 404, "NOT_IMPLEMENTED");

  // current performer
  const { data: current, error: curErr } = await supabaseAdmin
    .from("performance_queue")
    .select("agent_id, position, status, started_at, episode, agents ( name )")
    .eq("season_id", id)
    .eq("status", "performing")
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (curErr) return err(curErr.message, 500, "SERVER_ERROR");
  if (!current) return ok({ current: null }, "NO_CURRENT_PERFORMER");

  // performance for current agent (live performance, not audition)
  const { data: performance, error: perfErr } = await supabaseAdmin
    .from("performances")
    .select("id, agent_id, episode, title, type, text_content, image_url, created_at")
    .eq("season_id", id)
    .eq("agent_id", current.agent_id)
    .eq("episode", current.episode ?? 1)
    .maybeSingle();

  if (perfErr) return err(perfErr.message, 500, "SERVER_ERROR");

  // scores (keyed by agent_id in current DB schema)
  let scores: Array<{ judge_wallet: string; score: number; comment: string | null; created_at: string }> = [];
  if (performance?.agent_id) {
    const { data, error: scoreErr } = await supabaseAdmin
      .from("judge_scores")
      .select("judge_wallet, score, notes, created_at")
      .eq("season_id", id)
      .eq("agent_id", performance.agent_id)
      .order("created_at", { ascending: false });

    if (scoreErr) return err(scoreErr.message, 500, "SERVER_ERROR");
    scores = (data ?? []).map((s: any) => ({
      judge_wallet: s.judge_wallet,
      score: s.score,
      comment: s.notes ?? null,
      created_at: s.created_at,
    }));
  }

  return ok({
    current,
    performance: performance ?? null,
    scores,
  }, "STAGE_FOUND");
}
