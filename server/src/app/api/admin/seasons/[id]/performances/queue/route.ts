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
    const agentIds = (body?.agentIds as string[] | undefined) ?? [];
    const episode = Number(body?.episode ?? 1);

    if (!Array.isArray(agentIds) || agentIds.length === 0)
      return NextResponse.json({ ok: false, error: "MISSING_AGENT_IDS" }, { status: 400 });
    if (![1, 2].includes(episode))
      return NextResponse.json({ ok: false, error: "INVALID_EPISODE" }, { status: 400 });

    // reset queue for this episode
    await supabaseAdmin.from("performance_queue").delete().eq("season_id", id).eq("episode", episode);

    const rows = agentIds.map((agentId, idx) => ({
      season_id: id,
      agent_id: agentId,
      episode,
      position: idx + 1,
      status: "pending",
    }));

    const { data, error } = await supabaseAdmin
      .from("performance_queue")
      .insert(rows)
      .select("season_id, agent_id, position, status");

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, queue: data });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    const status = msg === "NOT_ADMIN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
