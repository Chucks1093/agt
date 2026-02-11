import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAgent } from "@/lib/agent/agentAuth";

function ok<T>(data: T, message = "OK") {
  return NextResponse.json({ success: true, data, message });
}

function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, message, code }, { status });
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("seasons")
    .select(
      "id, season_id, title, description, doc, status, cover_image_url, prize_pool_agt, prize_pool_usdc, sponsors, episode_2_participants, total_auditions, total_judges, accepted_agents, total_votes, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  if (error) return err(error.message, 500, "SERVER_ERROR");

  return ok({ seasons: data ?? [] }, "SEASONS_FOUND");
}

export async function POST(req: Request) {
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
  const title = (body?.title as string | undefined)?.trim();
  const description = (body?.description as string | undefined)?.trim();
  const doc = (body?.doc as string | undefined)?.trim();
  const cover_image_url = (body?.cover_image_url as string | undefined)?.trim();

  if (!title) return err("MISSING_TITLE", 400, "MISSING_TITLE");
  if (!description) return err("MISSING_DESCRIPTION", 400, "MISSING_DESCRIPTION");
  if (!doc) return err("MISSING_DOC", 400, "MISSING_DOC");
  if (!cover_image_url) return err("MISSING_COVER_IMAGE", 400, "MISSING_COVER_IMAGE");

  const season_id = `season_${Date.now()}`;

  const { data, error } = await supabaseAdmin
    .from("seasons")
    .insert({
      season_id,
      title,
      description,
      doc,
      status: "UPCOMING",
      cover_image_url,
      prize_pool_agt: 0,
      prize_pool_usdc: 0,
      sponsors: [],
      episode_2_participants: 0,
      total_auditions: 0,
      total_judges: 0,
      accepted_agents: 0,
      total_votes: 0,
    })
    .select(
      "id, season_id, title, description, doc, status, cover_image_url, prize_pool_agt, prize_pool_usdc, sponsors, episode_2_participants, total_auditions, total_judges, accepted_agents, total_votes, created_at, updated_at"
    )
    .single();

  if (error) return err(error.message, 500, "SERVER_ERROR");

  return ok({ season: data }, "SEASON_CREATED");
}
