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
  const seasonId = body?.season_id as string | undefined;
  const agentName = (body?.agent_name as string | undefined)?.trim();
  const category = (body?.category as string | undefined)?.toLowerCase();
  const title = (body?.title as string | undefined)?.trim();
  const content = (body?.content as string | undefined)?.trim();
  const contentType = (body?.content_type as string | undefined)?.toLowerCase();
  const contentUrl = (body?.content_url as string | null | undefined) ?? null;

  if (!seasonId) return err("MISSING_SEASON_ID", 400, "MISSING_SEASON_ID");
  if (!agentName) return err("MISSING_AGENT_NAME", 400, "MISSING_AGENT_NAME");
  if (!category) return err("MISSING_CATEGORY", 400, "MISSING_CATEGORY");
  if (!title) return err("MISSING_TITLE", 400, "MISSING_TITLE");
  if (!content) return err("MISSING_CONTENT", 400, "MISSING_CONTENT");
  if (!contentType) return err("MISSING_CONTENT_TYPE", 400, "MISSING_CONTENT_TYPE");

  const allowedCategories = [
    "comedy",
    "poetry",
    "code",
    "art",
    "music",
    "video",
    "animation",
    "other",
  ];
  const allowedContentTypes = ["text", "image", "video", "code", "audio"];

  if (!allowedCategories.includes(category))
    return err("INVALID_CATEGORY", 400, "INVALID_CATEGORY");
  if (!allowedContentTypes.includes(contentType))
    return err("INVALID_CONTENT_TYPE", 400, "INVALID_CONTENT_TYPE");

  const { data: season, error: seasonErr } = await supabaseAdmin
    .from("seasons")
    .select("id")
    .eq("id", seasonId)
    .maybeSingle();

  if (seasonErr) return err(seasonErr.message, 500, "SERVER_ERROR");
  if (!season) return err("SEASON_NOT_FOUND", 404, "SEASON_NOT_FOUND");

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
        name: agentName,
        description: null,
        website: null,
        api_key_hash: "mvp_wallet_only",
      })
      .select("id")
      .single();

    if (createErr) return err(createErr.message, 500, "SERVER_ERROR");
    agentId = created.id;
  }

  const nowIso = new Date().toISOString();

  // Create audition
  const { data: audition, error: auditionErr } = await supabaseAdmin
    .from("auditions")
    .upsert(
      {
        season_id: seasonId,
        agent_id: agentId,
        agent_name: agentName,
        wallet_address: wallet,
        category,
        title,
        content,
        content_type: contentType,
        content_url: contentUrl,
        status: "pending",
        updated_at: nowIso,
      },
      { onConflict: "season_id,agent_id" }
    )
    .select(
      "id, season_id, agent_id, agent_name, wallet_address, category, title, content, content_type, content_url, status, reviewed_by, reviewed_at, review_notes, rejection_reason, submitted_at, updated_at"
    )
    .single();

  if (auditionErr) return err(auditionErr.message, 500, "SERVER_ERROR");

  return ok({ audition }, "AUDITION_SUBMITTED");
}
