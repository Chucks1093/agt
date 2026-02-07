import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Validate the season ID to ensure it's a proper UUID
  if (!id || typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: "INVALID_SEASON_ID" }, { status: 400 });
  }

  try {
    const body = await request.json();
    
    // First, verify admin access
    const authHeader = request.headers.get("x-admin-address");
    if (!authHeader) {
      return NextResponse.json({ ok: false, error: "Missing admin address" }, { status: 401 });
    }

    const { data: admin, error: adminError } = await supabaseAdmin
      .from("admins")
      .select("role")
      .eq("wallet_address", authHeader.toLowerCase())
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
    }

    const allowedKeys = [
      "name",
      "description",
      "image_url",
      "status",
      "activated_at",
      "auditions_start",
      "auditions_end",
      "performance_start",
      "performance_end",
      "voting_start",
      "voting_end",
      "episode1_start",
      "episode1_end",
      "episode2_start",
      "episode2_end",
      "episode1_advances",
      "max_golden_buzzers",
    ] as const;

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowedKeys) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        updates[key] = body[key];
      }
    }

    const { data: updatedSeason, error: updateError } = await supabaseAdmin
      .from("seasons")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Supabase error:", updateError);
      return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, season: updatedSeason });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
  }
}