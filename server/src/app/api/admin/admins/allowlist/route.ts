import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request);
    if (admin.role !== "super")
      return NextResponse.json({ ok: false, error: "NOT_SUPER_ADMIN" }, { status: 403 });

    const body = await request.json().catch(() => ({}));
    const wallet = (body?.wallet as string | undefined)?.toLowerCase();
    const role = (body?.role as "super" | "admin" | undefined) ?? "admin";

    if (!wallet) return NextResponse.json({ ok: false, error: "MISSING_WALLET" }, { status: 400 });
    if (!role || !["admin", "super"].includes(role))
      return NextResponse.json({ ok: false, error: "INVALID_ROLE" }, { status: 400 });

    const { data, error } = await supabaseAdmin
      .from("admins")
      .upsert({ wallet_address: wallet, role }, { onConflict: "wallet_address" })
      .select("wallet_address, role")
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, admin: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    const status = msg === "NOT_ADMIN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
