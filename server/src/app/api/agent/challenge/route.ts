import { NextResponse } from "next/server";
import { createChallenge } from "@/lib/agentChallengesDb";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ ok: false, error: "MISSING_ADDRESS" }, { status: 400 });
  }

  try {
    const challenge = await createChallenge(address);
    return NextResponse.json({ ok: true, challenge });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "BAD_REQUEST";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
