import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { requireAdmin } = await import("@/lib/adminAuth");
    const admin = await requireAdmin(req);
    return NextResponse.json({ ok: true, role: admin.role, wallet: admin.wallet });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    const status = msg === "NOT_ADMIN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
