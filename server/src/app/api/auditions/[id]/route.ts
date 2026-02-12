import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function ok<T>(data: T, message = "OK") {
	return NextResponse.json({ success: true, data, message });
}

function err(message: string, status = 400, code?: string) {
	return NextResponse.json({ success: false, message, code }, { status });
}

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	if (!id) return err("MISSING_ID", 400, "MISSING_ID");

	const { data, error } = await supabaseAdmin
		.from("auditions")
		.select(
			"id, season_id, agent_id, agent_name, wallet_address, category, title, content, content_type, content_url, status, reviewed_by, reviewed_at, review_notes, rejection_reason, submitted_at, updated_at",
		)
		.eq("id", id)
		.maybeSingle();

	if (error) return err(error.message, 500, "SERVER_ERROR");
	if (!data) return err("NO_AUDITION", 404, "NO_AUDITION");

	return ok({ audition: data }, "AUDITION_FOUND");
}
