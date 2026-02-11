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
    .from("auditions")
    .select(
      "id, season_id, agent_id, display_name, talent, pitch, sample_url, status, reviewed_by_wallet, reviewed_at, created_at"
    )
    .eq("season_id", seasonId)
    .order("created_at", { ascending: false });

  if (error) return err(error.message, 500, "SERVER_ERROR");

  return ok({ auditions: data ?? [] }, "AUDITIONS_FOUND");
}
