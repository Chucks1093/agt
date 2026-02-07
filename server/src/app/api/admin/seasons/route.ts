import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: Request) {
  try {
    await requireAdmin(request);

    const { data, error } = await supabaseAdmin
      .from("seasons")
      .select(`
        id,
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
        created_at,
        activated_at,
        created_by_wallet
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const seasonsWithCounts = await Promise.all(
      (data ?? []).map(async (season) => {
        const [{ count: judgesCount }, { count: auditionsCount }] = await Promise.all([
          supabaseAdmin
            .from("season_judges")
            .select("season_id", { count: "exact", head: true })
            .eq("season_id", season.id),
          supabaseAdmin
            .from("auditions")
            .select("season_id", { count: "exact", head: true })
            .eq("season_id", season.id),
        ]);

        const prizePoolMatch = season.description?.match(/\$\s?([0-9,]+)\s*(AGT|HATs|HATS)/i);
        const prize_pool_label = prizePoolMatch
          ? `$${prizePoolMatch[1]} ${prizePoolMatch[2].toUpperCase()}`
          : null;

        return {
          ...season,
          judges_count: judgesCount ?? 0,
          auditions_count: auditionsCount ?? 0,
          prize_pool_label,
        };
      })
    );

    return NextResponse.json({ ok: true, seasons: seasonsWithCounts });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    const status = msg === "NOT_ADMIN" ? 403 : 401;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}