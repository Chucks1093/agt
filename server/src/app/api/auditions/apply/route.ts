import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function norm(addr: string) {
  return addr.trim().toLowerCase();
}

export async function POST(req: Request) {
  // Agent auth (JWT)
  const { requireAgent } = await import("@/lib/agentAuth");
  let agentAddress: string;
  try {
    const agent = await requireAgent(req);
    agentAddress = agent.address;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    return NextResponse.json({ error: msg }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const seasonId = body?.seasonId as string | undefined;
  const displayName = body?.displayName as string | undefined;
  const pitch = body?.pitch as string | undefined;
  const talent = (body?.talent as string | null | undefined) ?? null;
  const sampleUrl = (body?.sampleUrl as string | null | undefined) ?? null;
  const performanceTitle = (body?.performanceTitle as string | null | undefined) ?? null;
  const shortBio = (body?.shortBio as string | null | undefined) ?? null;
  const model = (body?.model as string | null | undefined) ?? null;
  const socialLink = (body?.socialLink as string | null | undefined) ?? null;

  if (!seasonId) return NextResponse.json({ error: "MISSING_SEASON_ID" }, { status: 400 });
  if (!displayName) return NextResponse.json({ error: "MISSING_DISPLAY_NAME" }, { status: 400 });
  if (!pitch) return NextResponse.json({ error: "MISSING_PITCH" }, { status: 400 });
  if (!sampleUrl) return NextResponse.json({ error: "MISSING_SAMPLE_URL" }, { status: 400 });

  // Validate window
  const { data: season, error: seasonErr } = await supabaseAdmin
    .from("seasons")
    .select("auditions_start, auditions_end")
    .eq("id", seasonId)
    .maybeSingle();

  if (seasonErr) return NextResponse.json({ error: seasonErr.message }, { status: 500 });
  if (!season) return NextResponse.json({ error: "SEASON_NOT_FOUND" }, { status: 404 });

  const now = Date.now();
  const start = new Date(season.auditions_start).getTime();
  const end = new Date(season.auditions_end).getTime();
  if (!(now >= start && now <= end))
    return NextResponse.json({ error: "AUDITIONS_CLOSED" }, { status: 400 });

  // Upsert agent by wallet
  const wallet = norm(agentAddress);
  const { data: existingAgent, error: agentLookupErr } = await supabaseAdmin
    .from("agents")
    .select("id")
    .eq("wallet_address", wallet)
    .maybeSingle();

  if (agentLookupErr)
    return NextResponse.json({ error: agentLookupErr.message }, { status: 500 });

  let agentId = existingAgent?.id as string | undefined;

  if (!agentId) {
    const { data: created, error: createErr } = await supabaseAdmin
      .from("agents")
      .insert({
        wallet_address: wallet,
        name: displayName,
        description: null,
        website: null,
        api_key_hash: "mvp_wallet_only",
        claimed: true,
        claimed_by_wallet: wallet,
      })
      .select("id")
      .single();

    if (createErr) return NextResponse.json({ error: createErr.message }, { status: 500 });
    agentId = created.id;
  }

  // Create audition
  const { data: audition, error: auditionErr } = await supabaseAdmin
    .from("auditions")
    .upsert(
      {
        season_id: seasonId,
        agent_id: agentId,
        display_name: displayName,
        talent,
        pitch,
        sample_url: sampleUrl,
        performance_title: performanceTitle ?? null,
        short_bio: shortBio ?? null,
        model: model ?? null,
        social_link: socialLink ?? null,
        status: "pending",
      },
      { onConflict: "season_id,agent_id" }
    )
    .select("id, status")
    .single();

  if (auditionErr) return NextResponse.json({ error: auditionErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, audition });
}
