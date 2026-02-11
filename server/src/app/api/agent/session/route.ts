import { NextResponse } from "next/server";
import { signAgentJwt } from "@/lib/agent/agentAuth";
import { redeemChallenge } from "@/lib/agent/agentChallengesDb";
import type { AgentSessionResponse } from "@shared/agent.types";

function ok<T>(data: T, message = "OK") {
  return NextResponse.json({ success: true, data, message });
}

function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, message, code }, { status });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const address = body?.address as string | undefined;
  const signature = body?.signature as `0x${string}` | undefined;

  if (!address) {
    return err("MISSING_ADDRESS", 400, "MISSING_ADDRESS");
  }
  if (!signature) {
    return err("MISSING_SIGNATURE", 400, "MISSING_SIGNATURE");
  }

  try {
    const { address: verified } = await redeemChallenge({ addressRaw: address, signature });
    const token = await signAgentJwt(verified);
    const response: AgentSessionResponse = { token, address: verified };
    return ok({ token: response.token, address: response.address }, "SESSION_CREATED");
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    const status = ["NO_CHALLENGE", "CHALLENGE_EXPIRED", "INVALID_SIGNATURE"].includes(msg)
      ? 401
      : 400;
    return err(msg, status, msg);
  }
}
