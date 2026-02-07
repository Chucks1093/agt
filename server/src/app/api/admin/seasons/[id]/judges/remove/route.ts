import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const { error: deleteError } = await supabaseAdmin
      .from("season_judges")
      .delete()
      .eq("season_id", id)
      .eq("wallet_address", wallet_address.toLowerCase());

    if (deleteError) {
      console.error("Supabase error:", deleteError);
      return NextResponse.json({ ok: false, error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, message: "Judge removed successfully" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    const status = msg === "NOT_ADMIN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}