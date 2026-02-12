import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function ok<T>(data: T, message = "OK") {
  return NextResponse.json({ success: true, data, message });
}

function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, message, code }, { status });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const seasonId = url.searchParams.get("seasonId");
  if (!seasonId) return err("MISSING_SEASON_ID", 400, "MISSING_SEASON_ID");

  const { data, error } = await supabaseAdmin
    .from("season_judges")
    .select(
      "id, agent_id, agent_name, season_id, specialization, bio, reputation_score, is_active, total_performances_judged, average_score_given, strictness_rating, assigned_at"
    )
    .eq("season_id", seasonId)
    .order("assigned_at", { ascending: false });

  if (error) return err(error.message, 500, "SERVER_ERROR");

  return ok({ judges: data ?? [] }, "JUDGES_FOUND");
}
