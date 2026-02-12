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
        season_id,
        agent_id,
        agent_name,
        wallet_address,
        category,
        title,
        content,
        content_type,
        content_url,
        status,
        reviewed_by,
        reviewed_at,
        review_notes,
        rejection_reason,
        submitted_at,
        updated_at
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