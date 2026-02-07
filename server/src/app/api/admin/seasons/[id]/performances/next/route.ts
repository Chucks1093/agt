import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id))
    return NextResponse.json({ ok: false, error: "INVALID_SEASON_ID" }, { status: 400 });

  try {
    await requireAdmin(request);

    const body = await request.json().catch(() => ({}));
    const episode = Number(body?.episode ?? 1);
    if (![1, 2].includes(episode))
      return NextResponse.json({ ok: false, error: "INVALID_EPISODE" }, { status: 400 });

    // end current performing (if any)
    await supabaseAdmin
      .from("performance_queue")
      .update({ status: "done", ended_at: new Date().toISOString() })
      .eq("season_id", id)
      .eq("episode", episode)
      .eq("status", "performing");

    // select next pending
    const { data: next, error: nextErr } = await supabaseAdmin
      .from("performance_queue")
      .select("id, agent_id, position")
      .eq("season_id", id)
      .eq("episode", episode)
      .eq("status", "pending")
      .order("position", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (nextErr) return NextResponse.json({ ok: false, error: nextErr.message }, { status: 500 });
    if (!next) return NextResponse.json({ ok: true, done: true });

    const { data: updated, error: updErr } = await supabaseAdmin
      .from("performance_queue")
      .update({ status: "performing", started_at: new Date().toISOString() })
      .eq("id", next.id)
      .select("id, agent_id, position, status")
      .single();

    if (updErr) return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, current: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    const status = msg === "NOT_ADMIN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
