import { isAddress } from "viem";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function norm(addr: string) {
  return addr.trim().toLowerCase();
}

/**
 * Admin auth for MVP/hackathon:
 * - Preferred: Authorization: Bearer <agent JWT> (same as agent routes)
 * - Dev fallback: x-admin-address: 0x... (browser can send the connected agent wallet)
 *
 * NOTE: The x-admin-address path is not a cryptographic proof. It is only acceptable
 * for local/dev demos. Production should require a signed JWT flow.
 */
export async function requireAdmin(req: Request) {
  let wallet: string | null = null;

  const auth = req.headers.get("authorization") || "";
  if (/^Bearer\s+/i.test(auth)) {
    const { requireAgent } = await import("@/lib/agentAuth");
    const agent = await requireAgent(req); // throws on failure
    wallet = norm(agent.address);
  } else {
    const hdr = req.headers.get("x-admin-address") || "";
    if (hdr && isAddress(hdr)) wallet = norm(hdr);
  }

  if (!wallet) throw new Error("MISSING_ADMIN_AUTH");

  const { data, error } = await supabaseAdmin
    .from("admins")
    .select("role")
    .eq("wallet_address", wallet)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("NOT_ADMIN");

  return { wallet, role: data.role as "super" | "admin" };
}

// Back-compat export (older routes/pages).
export async function requireAdminAgent(req: Request) {
  return requireAdmin(req);
}
