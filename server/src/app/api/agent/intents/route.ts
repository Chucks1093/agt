import { NextResponse } from "next/server";
import { createAgentIntent } from "@/lib/agentIntentsDb";
import { shapeIntent } from "@/lib/agentIntentShape";

export async function POST() {
  const row = await createAgentIntent();
  return NextResponse.json({ ok: true, intent: shapeIntent(row) });
}
