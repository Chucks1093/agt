import { NextResponse } from "next/server";
import { getAgentIntent } from "@/lib/agentIntentsDb";
import { shapeIntent } from "@/lib/agentIntentShape";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const row = await getAgentIntent(id);
  if (!row) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ ok: true, intent: shapeIntent(row) });
}
