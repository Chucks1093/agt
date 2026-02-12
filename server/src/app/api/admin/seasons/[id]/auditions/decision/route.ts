import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: "INVALID_SEASON_ID" }, { status: 400 });
  }

  try {
    const { wallet } = await requireAdmin(request);

    const body = await request.json().catch(() => ({}));
    const auditionId = body?.auditionId as string | undefined;
    const status = body?.status as "accepted" | "rejected" | "reviewing" | "pending" | undefined;
    const reviewNotes = (body?.review_notes as string | null | undefined) ?? null;
    const rejectionReason = (body?.rejection_reason as string | null | undefined) ?? null;

    if (!auditionId) {
      return NextResponse.json({ ok: false, error: "MISSING_AUDITION_ID" }, { status: 400 });
    }
    if (!status || !["pending", "reviewing", "accepted", "rejected"].includes(status)) {
      return NextResponse.json({ ok: false, error: "INVALID_STATUS" }, { status: 400 });
    }

    const nowIso = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("auditions")
      .update({
        status,
        reviewed_by: wallet,
        reviewed_at: nowIso,
        review_notes: reviewNotes,
        rejection_reason: status === "rejected" ? rejectionReason : null,
        updated_at: nowIso,
      })
      .eq("id", auditionId)
      .eq("season_id", id)
      .select("id, season_id, agent_id, status, reviewed_by, reviewed_at, review_notes, rejection_reason, updated_at")
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, audition: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    const status = msg === "NOT_ADMIN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
