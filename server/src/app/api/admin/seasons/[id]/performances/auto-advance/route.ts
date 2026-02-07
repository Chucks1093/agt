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
    const minScores = Number(body?.minScores ?? 0);
    if (![1, 2].includes(episode))
      return NextResponse.json({ ok: false, error: "INVALID_EPISODE" }, { status: 400 });

    // get current performer
    const { data: current, error: curErr } = await supabaseAdmin
      .from("performance_queue")
      .select("id, agent_id, position")
      .eq("season_id", id)
      .eq("episode", episode)
      .eq("status", "performing")
      .maybeSingle();

    if (curErr) return NextResponse.json({ ok: false, error: curErr.message }, { status: 500 });
    if (!current) return NextResponse.json({ ok: true, advanced: false, reason: "NO_CURRENT" });

    // performance must exist
    const { data: performance, error: perfErr } = await supabaseAdmin
      .from("performances")
      .select("id")
      .eq("season_id", id)
      .eq("agent_id", current.agent_id)
      .eq("episode", episode)
      .maybeSingle();

    if (perfErr) return NextResponse.json({ ok: false, error: perfErr.message }, { status: 500 });
    if (!performance) return NextResponse.json({ ok: true, advanced: false, reason: "NO_PERFORMANCE" });

    // count judges and scores
    const { count: judgeCount, error: judgeErr } = await supabaseAdmin
      .from("season_judges")
      .select("wallet_address", { count: "exact", head: true })
      .eq("season_id", id);

    if (judgeErr) return NextResponse.json({ ok: false, error: judgeErr.message }, { status: 500 });

    const { count: scoreCount, error: scoreErr } = await supabaseAdmin
      .from("judge_scores")
      .select("agent_id", { count: "exact", head: true })
      .eq("season_id", id)
      .eq("agent_id", current.agent_id);

    if (scoreErr) return NextResponse.json({ ok: false, error: scoreErr.message }, { status: 500 });

    const requiredScores = minScores && Number.isFinite(minScores)
      ? Math.max(1, Math.min(minScores, judgeCount || minScores))
      : judgeCount;

    const scored = scoreCount ?? 0;
    if (!requiredScores || scored < requiredScores)
      return NextResponse.json({ ok: true, advanced: false, reason: "WAITING_FOR_SCORES", judgeCount, scoreCount: scored, requiredScores });

    // advance to next performer
    await supabaseAdmin
      .from("performance_queue")
      .update({ status: "done", ended_at: new Date().toISOString() })
      .eq("season_id", id)
      .eq("episode", episode)
      .eq("status", "performing");

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
    if (!next) return NextResponse.json({ ok: true, advanced: true, done: true });

    const { data: updated, error: updErr } = await supabaseAdmin
      .from("performance_queue")
      .update({ status: "performing", started_at: new Date().toISOString() })
      .eq("id", next.id)
      .select("id, agent_id, position, status")
      .single();

    if (updErr) return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, advanced: true, current: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    const status = msg === "NOT_ADMIN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
