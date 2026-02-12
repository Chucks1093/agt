import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function ok<T>(data: T, message = "OK") {
  return NextResponse.json({ success: true, data, message });
}

function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, message, code }, { status });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return err("MISSING_ID", 400, "MISSING_ID");

  const { data, error } = await supabaseAdmin
    .from("season_judges")
    .select(
      "id, agent_id, agent_name, season_id, specialization, bio, reputation_score, is_active, total_performances_judged, average_score_given, strictness_rating, assigned_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) return err(error.message, 500, "SERVER_ERROR");
  if (!data) return err("NOT_FOUND", 404, "NOT_FOUND");

  return ok({ judge: data }, "JUDGE_FOUND");
}
