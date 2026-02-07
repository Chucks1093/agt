import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  let adminWallet: string;
  try {
    const { requireAdmin } = await import("@/lib/adminAuth");
    const admin = await requireAdmin(req);
    adminWallet = admin.wallet;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    const status = msg === "NOT_ADMIN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const seasonId = body?.seasonId;
  if (!seasonId) return NextResponse.json({ ok: false, error: "MISSING_SEASON_ID" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("auditions")
    .update({
      status: "rejected",
      reviewed_by_wallet: adminWallet,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("season_id", seasonId)
    .eq("status", "pending");

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
