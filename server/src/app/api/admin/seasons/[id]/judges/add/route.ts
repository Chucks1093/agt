import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: "INVALID_SEASON_ID" }, { status: 400 });
  }

  try {
    await requireAdmin(request);

    const body = await request.json();
    const { wallet_address } = body;

    if (!wallet_address) {
      return NextResponse.json({ ok: false, error: "WALLET_ADDRESS_REQUIRED" }, { status: 400 });
    }

    const { data: newJudge, error: insertError } = await supabaseAdmin
      .from("season_judges")
      .insert({
        season_id: id,
        wallet_address: wallet_address.toLowerCase(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error("Supabase error:", insertError);
      return NextResponse.json({ ok: false, error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, judge: newJudge });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    const status = msg === "NOT_ADMIN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}