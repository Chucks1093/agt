import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  // Judge auth = agent JWT + must be in season_judges
  const { requireAgent } = await import("@/lib/agent/agentAuth");
  let judgeWallet: string;
  try {
    const agent = await requireAgent(req);
    judgeWallet = agent.address.toLowerCase();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    return NextResponse.json({ ok: false, error: msg }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const seasonId = body?.seasonId as string | undefined;
  const performanceId = body?.performanceId as string | undefined;
  const score = body?.score as number | undefined;
  const comment = (body?.comment as string | null | undefined) ?? null;

  if (!seasonId) return NextResponse.json({ ok: false, error: "MISSING_SEASON_ID" }, { status: 400 });
  if (!performanceId) return NextResponse.json({ ok: false, error: "MISSING_PERFORMANCE_ID" }, { status: 400 });
  if (!score || score < 1 || score > 10)
    return NextResponse.json({ ok: false, error: "INVALID_SCORE" }, { status: 400 });

  // ensure judge is assigned to season
  const { data: judge, error: judgeErr } = await supabaseAdmin
    .from("season_judges")
    .select("wallet_address")
    .eq("season_id", seasonId)
    .eq("wallet_address", judgeWallet)
    .maybeSingle();

  if (judgeErr) return NextResponse.json({ ok: false, error: judgeErr.message }, { status: 500 });
  if (!judge) return NextResponse.json({ ok: false, error: "NOT_A_JUDGE" }, { status: 403 });

  // lookup agent_id from performance (compatible with older judge_scores schema)
  const { data: perfRow, error: perfErr } = await supabaseAdmin
    .from("performances")
    .select("agent_id")
    .eq("id", performanceId)
    .maybeSingle();

  if (perfErr) return NextResponse.json({ ok: false, error: perfErr.message }, { status: 500 });
  if (!perfRow?.agent_id) return NextResponse.json({ ok: false, error: "PERFORMANCE_NOT_FOUND" }, { status: 404 });

  const { data, error } = await supabaseAdmin
    .from("judge_scores")
    .upsert(
      {
        season_id: seasonId,
        agent_id: perfRow.agent_id,
        judge_wallet: judgeWallet,
        score,
        notes: comment,
      },
      { onConflict: "season_id,agent_id,judge_wallet" }
    )
    .select("season_id, agent_id, judge_wallet, score")
    .single();

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, score: data });
}
