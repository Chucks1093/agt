import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  // Admins are agents too: authenticate with the same JWT flow.
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

  const url = new URL(req.url);
  const seasonId = url.searchParams.get("seasonId");
  const status = url.searchParams.get("status") ?? "pending";

  if (!seasonId) return NextResponse.json({ ok: false, error: "MISSING_SEASON_ID" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("auditions")
    .select("id, created_at, display_name, pitch, talent, status, agent_id")
    .eq("season_id", seasonId)
    .eq("status", status)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, admin_wallet: adminWallet, auditions: data ?? [] });
}
