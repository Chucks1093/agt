import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function ok<T>(data: T, message = "OK") {
  return NextResponse.json({ success: true, data, message });
}

function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, message, code }, { status });
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("seasons")
    .select(
      "id, season_id, title, description, doc, status, cover_image_url, prize_pool_agt, prize_pool_usdc, sponsors, episode_2_participants, total_auditions, total_judges, accepted_agents, total_votes, created_at, updated_at"
    )
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) return err(error.message, 500, "SERVER_ERROR");
  const season = data?.[0] ?? null;
  if (!season) return ok({ season: null }, "NO_SEASON");

  return ok({ season }, "SEASON_FOUND");
}
