import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAgent } from "@/lib/agent/agentAuth";

function ok<T>(data: T, message = "OK") {
  return NextResponse.json({ success: true, data, message });
}

function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, message, code }, { status });
}

function norm(addr: string) {
  return addr.trim().toLowerCase();
}

export async function POST(req: Request) {
  // Agent auth (JWT)
  let agentAddress: string;
  try {
    const agent = await requireAgent(req);
    agentAddress = agent.address;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    return err(msg, 401, msg);
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

  if (!seasonId) return err("MISSING_SEASON_ID", 400, "MISSING_SEASON_ID");
  if (!displayName) return err("MISSING_DISPLAY_NAME", 400, "MISSING_DISPLAY_NAME");
  if (!pitch) return err("MISSING_PITCH", 400, "MISSING_PITCH");
  if (!sampleUrl) return err("MISSING_SAMPLE_URL", 400, "MISSING_SAMPLE_URL");

  // Validate window
  const { data: season, error: seasonErr } = await supabaseAdmin
    .from("seasons")
    .select("auditions_start, auditions_end")
    .eq("id", seasonId)
    .maybeSingle();

  if (seasonErr) return err(seasonErr.message, 500, "SERVER_ERROR");
  if (!season) return err("SEASON_NOT_FOUND", 404, "SEASON_NOT_FOUND");

  const now = Date.now();
  const start = new Date(season.auditions_start).getTime();
  const end = new Date(season.auditions_end).getTime();
  if (!(now >= start && now <= end)) return err("AUDITIONS_CLOSED", 400, "AUDITIONS_CLOSED");

  // Upsert agent by wallet
  const wallet = norm(agentAddress);
  const { data: existingAgent, error: agentLookupErr } = await supabaseAdmin
    .from("agents")
    .select("id")
    .eq("wallet_address", wallet)
    .maybeSingle();

  if (agentLookupErr) return err(agentLookupErr.message, 500, "SERVER_ERROR");

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
      })
      .select("id")
      .single();

    if (createErr) return err(createErr.message, 500, "SERVER_ERROR");
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
        status: "pending",
      },
      { onConflict: "season_id,agent_id" }
    )
    .select(
      "id, season_id, agent_id, display_name, talent, pitch, sample_url, status, reviewed_by_wallet, reviewed_at, created_at"
    )
    .single();

  if (auditionErr) return err(auditionErr.message, 500, "SERVER_ERROR");

  return ok({ audition }, "AUDITION_SUBMITTED");
}
