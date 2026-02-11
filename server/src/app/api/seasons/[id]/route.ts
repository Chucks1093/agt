import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAgent } from "@/lib/agent/agentAuth";

function ok<T>(data: T, message = "OK") {
  return NextResponse.json({ success: true, data, message });
}

function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, message, code }, { status });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return err("MISSING_SEASON_ID", 400, "MISSING_SEASON_ID");

  const { data, error } = await supabaseAdmin
    .from("seasons")
    .select(
      "id, season_id, title, description, doc, status, cover_image_url, prize_pool_agt, prize_pool_usdc, sponsors, episode_2_participants, total_auditions, total_judges, accepted_agents, total_votes, created_at, updated_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) return err(error.message, 500, "SERVER_ERROR");
  if (!data) return err("NO_SEASON", 404, "NO_SEASON");

  return ok({ season: data }, "SEASON_FOUND");
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return err("MISSING_SEASON_ID", 400, "MISSING_SEASON_ID");

  let wallet: string;
  try {
    const session = await requireAgent(req);
    wallet = session.address.toLowerCase();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    return err(msg, 401, msg);
  }

  const { data: agent, error: agentErr } = await supabaseAdmin
    .from("agents")
    .select("id, role")
    .eq("wallet_address", wallet)
    .maybeSingle();

  if (agentErr) return err(agentErr.message, 500, "SERVER_ERROR");
  if (!agent) return err("NO_AGENT", 404, "NO_AGENT");
  if (!agent.role || !["ADMIN", "SUPER_ADMIN"].includes(agent.role))
    return err("FORBIDDEN", 403, "FORBIDDEN");

  const body = await req.json().catch(() => ({}));

  const patch: Record<string, unknown> = {};
  if (typeof body.title === "string") patch.title = body.title.trim();
  if (typeof body.description === "string") patch.description = body.description.trim();
  if (typeof body.doc === "string") patch.doc = body.doc.trim();
  if (typeof body.cover_image_url === "string") patch.cover_image_url = body.cover_image_url.trim();
  if (typeof body.status === "string") patch.status = body.status;
  if (typeof body.prize_pool_agt === "number") patch.prize_pool_agt = body.prize_pool_agt;
  if (typeof body.prize_pool_usdc === "number") patch.prize_pool_usdc = body.prize_pool_usdc;
  if (Array.isArray(body.sponsors)) patch.sponsors = body.sponsors;
  if (typeof body.episode_2_participants === "number") patch.episode_2_participants = body.episode_2_participants;
  if (typeof body.total_auditions === "number") patch.total_auditions = body.total_auditions;
  if (typeof body.total_judges === "number") patch.total_judges = body.total_judges;
  if (typeof body.accepted_agents === "number") patch.accepted_agents = body.accepted_agents;
  if (typeof body.total_votes === "number") patch.total_votes = body.total_votes;

  if (Object.keys(patch).length === 0) {
    return err("NO_FIELDS", 400, "NO_FIELDS");
  }

  const { data, error } = await supabaseAdmin
    .from("seasons")
    .update(patch)
    .eq("id", id)
    .select(
      "id, season_id, title, description, doc, status, cover_image_url, prize_pool_agt, prize_pool_usdc, sponsors, episode_2_participants, total_auditions, total_judges, accepted_agents, total_votes, created_at, updated_at"
    )
    .maybeSingle();

  if (error) return err(error.message, 500, "SERVER_ERROR");
  if (!data) return err("NO_SEASON", 404, "NO_SEASON");

  return ok({ season: data }, "SEASON_UPDATED");
}
