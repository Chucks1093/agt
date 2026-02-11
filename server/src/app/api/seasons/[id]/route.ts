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
  if (!id) return err("MISSING_SEASON_ID", 400, "MISSING_SEASON_ID");

  const { data, error } = await supabaseAdmin
    .from("seasons")
    .select(
      "id, season_id, title, description, doc, status, cover_image_url, prize_pool_agt, prize_pool_usdc, sponsors, episode_2_participants, total_auditions, accepted_agents, total_votes, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) return err(error.message, 500, "SERVER_ERROR");
  if (!data) return err("NO_SEASON", 404, "NO_SEASON");

  return ok({ season: data }, "SEASON_FOUND");
}
