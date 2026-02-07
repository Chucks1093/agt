import { NextResponse } from "next/server";
import { requireAgent } from "@/lib/agentAuth";

export async function GET(req: Request) {
  try {
    const agent = await requireAgent(req);
    return NextResponse.json({ ok: true, agent });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    return NextResponse.json({ ok: false, error: msg }, { status: 401 });
  }
}
