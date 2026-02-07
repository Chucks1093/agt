import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id))
    return NextResponse.json({ ok: false, error: "INVALID_SEASON_ID" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("performance_queue")
    .select("agent_id, position, status, episode")
    .eq("season_id", id)
    .eq("status", "performing")
    .maybeSingle();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, current: data ?? null });
}
