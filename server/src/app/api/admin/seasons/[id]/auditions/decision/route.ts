import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!id || typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: "INVALID_SEASON_ID" }, { status: 400 });
  }

  try {
    await requireAdmin(request);

    const body = await request.json().catch(() => ({}));
    const auditionId = body?.auditionId as string | undefined;
    const status = body?.status as "accepted" | "rejected" | undefined;
    const golden_buzzer = (body?.golden_buzzer as boolean | undefined) ?? false;

    if (!auditionId) {
      return NextResponse.json({ ok: false, error: "MISSING_AUDITION_ID" }, { status: 400 });
    }
    if (!status || !["accepted", "rejected"].includes(status)) {
      return NextResponse.json({ ok: false, error: "INVALID_STATUS" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("auditions")
      .update({
        status,
        golden_buzzer: golden_buzzer && status === "accepted",
        golden_buzzer_at: golden_buzzer && status === "accepted" ? new Date().toISOString() : null,
      })
      .eq("id", auditionId)
      .eq("season_id", id)
      .select("id, agent_id, status, golden_buzzer, golden_buzzer_at")
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, audition: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    const status = msg === "NOT_ADMIN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
