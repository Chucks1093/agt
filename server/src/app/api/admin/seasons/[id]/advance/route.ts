import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const ORDER = ["draft", "auditions", "episode1", "voting", "episode2", "closed"] as const;
type SeasonStatus = (typeof ORDER)[number];

function nextStatus(s: SeasonStatus): SeasonStatus {
  const i = ORDER.indexOf(s);
  return ORDER[Math.min(i + 1, ORDER.length - 1)];
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

  const to = body?.to as SeasonStatus | undefined; // optional explicit target

  const { data: season, error: seasonErr } = await supabaseAdmin
    .from("seasons")
    .select("id, status")
    .eq("id", id)
    .maybeSingle();

  if (seasonErr) return NextResponse.json({ ok: false, error: seasonErr.message }, { status: 500 });
  if (!season) return NextResponse.json({ ok: false, error: "SEASON_NOT_FOUND" }, { status: 404 });

  const current = season.status as SeasonStatus;
  const target: SeasonStatus = to ?? nextStatus(current);

  if (!ORDER.includes(target))
    return NextResponse.json({ ok: false, error: "INVALID_STATUS" }, { status: 400 });

  const { data: updated, error: updErr } = await supabaseAdmin
    .from("seasons")
    .update({ status: target })
    .eq("id", id)
    .select("id, status")
    .single();

  if (updErr) return NextResponse.json({ ok: false, error: updErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, season: updated, changed_by_wallet: adminWallet });
}
