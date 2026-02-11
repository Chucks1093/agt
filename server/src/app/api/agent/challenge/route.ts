import { NextResponse } from "next/server";
import { createChallenge } from "@/lib/agent/agentChallengesDb";
import type { AgentChallenge } from "@shared/agent.types";

function ok<T>(data: T, message = "OK") {
  return NextResponse.json({ success: true, data, message });
}

function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, message, code }, { status });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address");
  if (!address) {
    return err("MISSING_ADDRESS", 400, "MISSING_ADDRESS");
  }

  try {
    const challenge: AgentChallenge = await createChallenge(address);
    return ok({ challenge }, "CHALLENGE_CREATED");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "BAD_REQUEST";
    return err(msg, 400, msg);
  }
}
