import { NextResponse } from "next/server";
import { signAgentJwt } from "@/lib/agentAuth";
import { redeemChallenge } from "@/lib/agentChallengesDb";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const address = body?.address as string | undefined;
  const signature = body?.signature as `0x${string}` | undefined;

  if (!address) {
    return NextResponse.json({ ok: false, error: "MISSING_ADDRESS" }, { status: 400 });
  }
  if (!signature) {
    return NextResponse.json({ ok: false, error: "MISSING_SIGNATURE" }, { status: 400 });
  }

  try {
    const { address: verified } = await redeemChallenge({ addressRaw: address, signature });
    const token = await signAgentJwt(verified);
    return NextResponse.json({ ok: true, token, address: verified });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    const status = ["NO_CHALLENGE", "CHALLENGE_EXPIRED", "INVALID_SIGNATURE"].includes(msg)
      ? 401
      : 400;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
