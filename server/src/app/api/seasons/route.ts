import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("seasons")
    .select("id, name, description, image_url, status, auditions_start, auditions_end, episode1_start, episode1_end, episode2_start, episode2_end, activated_at")
    .neq("status", "draft")
    .order("activated_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, seasons: data ?? [] });
}
