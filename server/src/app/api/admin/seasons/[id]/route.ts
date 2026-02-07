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

    const { data: season, error: seasonError } = await supabaseAdmin
      .from("seasons")
      .select(`
        id,
        name,
        description,
        image_url,
        status,
        auditions_start,
        auditions_end,
        performance_start,
        performance_end,
        voting_start,
        voting_end,
        episode1_start,
        episode1_end,
        episode2_start,
        episode2_end,
        episode1_advances,
        max_golden_buzzers,
        created_at,
        activated_at,
        created_by_wallet
      `)
      .eq("id", id)
      .single();

    if (seasonError) {
      console.error("Supabase error:", seasonError);
      return NextResponse.json({ ok: false, error: seasonError.message }, { status: 500 });
    }

    if (!season) {
      return NextResponse.json({ ok: false, error: "SEASON_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, season });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    const status = msg === "NOT_ADMIN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}