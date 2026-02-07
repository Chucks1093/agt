import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;

	if (
		!id ||
		typeof id !== "string" ||
		!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
			id,
		)
	) {
		return NextResponse.json(
			{ ok: false, error: "INVALID_SEASON_ID" },
			{ status: 400 },
		);
	}

	try {
		await requireAdmin(request);

		const { data: judges, error: judgesError } = await supabaseAdmin
			.from("season_judges")
			.select(
				`
        wallet_address,
        created_at
      `,
			)
			.eq("season_id", id);

		if (judgesError) {
			console.error("Supabase error:", judgesError);
			return NextResponse.json(
				{ ok: false, error: judgesError.message },
				{ status: 500 },
			);
		}

		return NextResponse.json({ ok: true, judges });
	} catch (err) {
		const msg = err instanceof Error ? err.message : "Internal server error";
		const status = msg === "NOT_ADMIN" ? 403 : 401;
		return NextResponse.json({ ok: false, error: msg }, { status });
	}
}
