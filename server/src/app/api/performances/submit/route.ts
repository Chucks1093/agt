import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  // Agent auth
  const { requireAgent } = await import("@/lib/agent/agentAuth");
  let agentAddress: string;
  try {
    const agent = await requireAgent(req);
    agentAddress = agent.address;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    return NextResponse.json({ ok: false, error: msg }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const seasonId = body?.seasonId as string | undefined;
  const title = body?.title as string | undefined;
  const type = body?.type as "text" | "image" | undefined;
  const textContent = body?.textContent as string | null | undefined;
  const imageUrl = body?.imageUrl as string | null | undefined;

  if (!seasonId) return NextResponse.json({ ok: false, error: "MISSING_SEASON_ID" }, { status: 400 });
  if (!title) return NextResponse.json({ ok: false, error: "MISSING_TITLE" }, { status: 400 });
  if (!type || !["text", "image"].includes(type))
    return NextResponse.json({ ok: false, error: "INVALID_TYPE" }, { status: 400 });

  if (type === "text" && !textContent)
    return NextResponse.json({ ok: false, error: "MISSING_TEXT" }, { status: 400 });
  if (type === "image" && !imageUrl)
    return NextResponse.json({ ok: false, error: "MISSING_IMAGE_URL" }, { status: 400 });

  // Lookup agent id
  const { data: agentRow, error: agentErr } = await supabaseAdmin
    .from("agents")
    .select("id")
    .eq("wallet_address", agentAddress.toLowerCase())
    .maybeSingle();

  if (agentErr) return NextResponse.json({ ok: false, error: agentErr.message }, { status: 500 });
  if (!agentRow) return NextResponse.json({ ok: false, error: "AGENT_NOT_REGISTERED" }, { status: 400 });

  // Require accepted audition
  const { data: audition, error: audErr } = await supabaseAdmin
    .from("auditions")
    .select("id, status")
    .eq("season_id", seasonId)
    .eq("agent_id", agentRow.id)
    .maybeSingle();

  if (audErr) return NextResponse.json({ ok: false, error: audErr.message }, { status: 500 });
  if (!audition || audition.status !== "accepted")
    return NextResponse.json({ ok: false, error: "NOT_ACCEPTED" }, { status: 403 });

  // Determine episode from season status (episode1/episode2 performance windows)
  const { data: season, error: seasonErr } = await supabaseAdmin
    .from("seasons")
    .select("status")
    .eq("id", seasonId)
    .maybeSingle();

  if (seasonErr) return NextResponse.json({ ok: false, error: seasonErr.message }, { status: 500 });
  if (!season) return NextResponse.json({ ok: false, error: "SEASON_NOT_FOUND" }, { status: 404 });

  const episode = season.status === "episode1" ? 1 : season.status === "episode2" ? 2 : null;
  if (!episode)
    return NextResponse.json({ ok: false, error: "NOT_IN_PERFORMANCE_WINDOW" }, { status: 403 });

  const { data: performance, error: perfErr } = await supabaseAdmin
    .from("performances")
    .upsert(
      {
        season_id: seasonId,
        agent_id: agentRow.id,
        episode,
        title,
        type,
        text_content: type === "text" ? textContent : null,
        image_url: type === "image" ? imageUrl : null,
      },
      { onConflict: "season_id,agent_id,episode" }
    )
    .select("id, season_id, agent_id, episode, title, type, created_at")
    .single();

  if (perfErr) return NextResponse.json({ ok: false, error: perfErr.message }, { status: 500 });

  return NextResponse.json({ ok: true, performance });
}
