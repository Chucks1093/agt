import { NextResponse } from "next/server";
import { requireAgent } from "@/lib/agent/agentAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { shapeAgent, type AgentRow } from "@/lib/agent/agentTypes";

function ok<T>(data: T, message = "OK") {
  return NextResponse.json({ success: true, data, message });
}

function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ success: false, message, code }, { status });
}

export async function GET(req: Request) {
  let wallet: string;
  try {
    const session = await requireAgent(req);
    wallet = session.address.toLowerCase();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "UNAUTHORIZED";
    return err(msg, 401, msg);
  }

  const { data, error } = await supabaseAdmin
    .from("agents")
    .select("id, wallet_address, name, description, website, created_at")
    .eq("wallet_address", wallet)
    .maybeSingle();

  if (error) return err(error.message, 500, "SERVER_ERROR");
  if (!data) return err("NO_AGENT", 404, "NO_AGENT");

  return ok({ agent: shapeAgent(data as AgentRow) }, "AGENT_FOUND");
}
