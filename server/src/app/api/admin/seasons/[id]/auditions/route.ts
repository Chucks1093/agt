import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: "INVALID_SEASON_ID" }, { status: 400 });
  }

  try {
    await requireAdmin(request);

    const { data: auditions, error: auditionsError } = await supabaseAdmin
      .from("auditions")
      .select(`
        id,
        agent_id,
        display_name,
        talent,
        pitch,
        sample_url,
        performance_title,
        short_bio,
        model,
        social_link,
        status,
        created_at,
        agents ( wallet_address )
      `)
      .eq("season_id", id)
      .order("created_at", { ascending: false });

    if (auditionsError) {
      console.error("Supabase error:", auditionsError);
      return NextResponse.json({ ok: false, error: auditionsError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, auditions });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    const status = msg === "NOT_ADMIN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}