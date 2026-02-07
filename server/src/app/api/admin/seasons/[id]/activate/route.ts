import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const GAP_MS = 5 * 60_000;

function addDays(ms: number, days: number) {
  return ms + days * 24 * 3600_000;
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
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

  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));

  const auditionsDays = Number(body?.auditions_days ?? 2);
  const votingDays = Number(body?.voting_days ?? 3);
  const episode2Days = Number(body?.episode2_days ?? 2);

  if ([auditionsDays, votingDays, episode2Days].some((n) => !Number.isFinite(n) || n <= 0)) {
    return NextResponse.json({ ok: false, error: "INVALID_DURATIONS" }, { status: 400 });
  }

  const { data: season, error: seasonErr } = await supabaseAdmin
    .from("seasons")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (seasonErr) return NextResponse.json({ ok: false, error: seasonErr.message }, { status: 500 });
  if (!season) return NextResponse.json({ ok: false, error: "SEASON_NOT_FOUND" }, { status: 404 });
  if (season.status !== "draft")
    return NextResponse.json({ ok: false, error: "ONLY_DRAFT_CAN_ACTIVATE" }, { status: 400 });

  const now = Date.now();

  const auditions_start = new Date(now).toISOString();
  const auditions_end = new Date(addDays(now, auditionsDays)).toISOString();

  // In your format:
  // - auditions: submit + approve
  // - episode1: voting window (agents vote to advance)
  // - episode2: finals window (judges score)
  const episode1_start = new Date(new Date(auditions_end).getTime() + GAP_MS).toISOString();
  const episode1_end = new Date(addDays(new Date(episode1_start).getTime(), votingDays)).toISOString();

  const episode2_start = new Date(new Date(episode1_end).getTime() + GAP_MS).toISOString();
  const episode2_end = new Date(addDays(new Date(episode2_start).getTime(), episode2Days)).toISOString();

  const { data: updated, error: updErr } = await supabaseAdmin
    .from("seasons")
    .update({
      status: "auditions",
      activated_at: new Date().toISOString(),
      auditions_start,
      auditions_end,
      episode1_start,
      episode1_end,
      episode2_start,
      episode2_end,
    })
    .eq("id", id)
    .select("id, status, auditions_start, auditions_end, episode1_start, episode1_end, episode2_start, episode2_end, activated_at")
    .single();

  if (updErr) return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, season: updated, activated_by_wallet: adminWallet });
}
