import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
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

  const body = await req.json().catch(() => ({}));
  const name = (body?.name as string | undefined) ?? "Season";
  const description = (body?.description as string | null | undefined) ?? null;
  const image_url = (body?.image_url as string | null | undefined) ?? null;

  const auditions_start = body?.auditions_start as string | undefined;
  const auditions_end = body?.auditions_end as string | undefined;
  const performance_start = body?.performance_start as string | undefined;
  const performance_end = body?.performance_end as string | undefined;
  const voting_start = body?.voting_start as string | undefined;
  const voting_end = body?.voting_end as string | undefined;

  const status = (body?.status as string | undefined) ?? "draft";
  const episode1_start = (body?.episode1_start as string | null | undefined) ?? null;
  const episode1_end = (body?.episode1_end as string | null | undefined) ?? null;
  const episode2_start = (body?.episode2_start as string | null | undefined) ?? null;
  const episode2_end = (body?.episode2_end as string | null | undefined) ?? null;
  const episode1_advances = (body?.episode1_advances as number | undefined) ?? 12;
  const max_golden_buzzers = (body?.max_golden_buzzers as number | undefined) ?? 2;

  if (!auditions_start || !auditions_end || !performance_start || !performance_end || !voting_start || !voting_end) {
    return NextResponse.json({ ok: false, error: "MISSING_TIMELINE_FIELDS" }, { status: 400 });
  }

  const { data: created, error: createErr } = await supabaseAdmin
    .from("seasons")
    .insert({
      name,
      description,
      image_url,
      status,
      auditions_start,
      auditions_end,
      performance_start,
      performance_end,
      voting_start,
      voting_end,
      episode1_start,
      episode1_end,
      episode2_start,
      episode2_end,
      episode1_advances,
      max_golden_buzzers,
      created_by_wallet: adminWallet,
    })
    .select("id, name, description, image_url, status, created_by_wallet")
    .single();

  if (createErr) return NextResponse.json({ ok: false, error: createErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, season: created });
}
