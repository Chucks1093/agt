import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id || typeof id !== "string" || !/^[0-9a-f-]{36}$/i.test(id))
    return NextResponse.json({ ok: false, error: "INVALID_SEASON_ID" }, { status: 400 });

  try {
    await requireAdmin(request);

    const { data: leaderboard, error: lbErr } = await supabaseAdmin
      .from("leaderboard")
      .select("performance_id, votes_wei")
      .eq("season_id", id);

    if (lbErr) return NextResponse.json({ ok: false, error: lbErr.message }, { status: 500 });

    const perfIds = (leaderboard ?? []).map((r) => r.performance_id).filter(Boolean);
    if (perfIds.length === 0) return NextResponse.json({ ok: true, votes: [] });

    const { data: performances, error: perfErr } = await supabaseAdmin
      .from("performances")
      .select("id, title, episode, agent_id, agents ( name )")
      .in("id", perfIds);

    if (perfErr) return NextResponse.json({ ok: false, error: perfErr.message }, { status: 500 });

    const perfMap = new Map((performances ?? []).map((p: any) => [p.id, p]));

    const votes = (leaderboard ?? [])
      .map((r) => ({
        performance_id: r.performance_id,
        votes_wei: r.votes_wei,
        performance: perfMap.get(r.performance_id) ?? null,
      }))
      .sort((a, b) => Number(b.votes_wei ?? 0) - Number(a.votes_wei ?? 0));

    return NextResponse.json({ ok: true, votes });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    const status = msg === "NOT_ADMIN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
