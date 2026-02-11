import { NextResponse } from "next/server";
import { getAgentIntent } from "@/lib/agent/agentIntentsDb";
import { shapeIntent } from "@/lib/agent/agentIntentShape";
import type { AgentIntent } from "@shared/agent.types";

function ok<T>(data: T, message = "OK") {
  return NextResponse.json({ success: true, data, message });
}

function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, message, code }, { status });
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const row = await getAgentIntent(id);
  if (!row) return err("NOT_FOUND", 404, "NOT_FOUND");
  const intent: AgentIntent = shapeIntent(row);
  return ok({ intent }, "INTENT_FOUND");
}
