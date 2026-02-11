import { NextResponse } from "next/server";
import { createAgentIntent } from "@/lib/agent/agentIntentsDb";
import { shapeIntent } from "@/lib/agent/agentIntentShape";
import type { AgentIntent } from "@shared/agent.types";

function ok<T>(data: T, message = "OK") {
  return NextResponse.json({ success: true, data, message });
}

export async function POST() {
  const row = await createAgentIntent();
  const intent: AgentIntent = shapeIntent(row);
  return ok({ intent }, "INTENT_CREATED");
}
