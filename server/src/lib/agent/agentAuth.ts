import { jwtVerify, SignJWT } from "jose";
import { verifyMessage, isAddress } from "viem";

const encoder = new TextEncoder();

function getJwtSecret() {
  // Server-only secret. In production, set AGT_JWT_SECRET.
  const secret = process.env.AGT_JWT_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    // Dev fallback so local works, but noisy.
    // NOTE: Do NOT rely on this in production.
    return "dev_insecure_secret_change_me";
  }
  return secret;
}

export type AgentSession = {
  address: `0x${string}`;
};

// In-memory challenge store (dev-friendly). For production, store in DB/Redis.
const challenges = new Map<
  string,
  { nonce: string; message: string; expiresAt: number }
>();

export function makeChallenge(addressRaw: string) {
  const address = addressRaw?.trim() as string;
  if (!isAddress(address)) throw new Error("INVALID_ADDRESS");

  const nonce = crypto.randomUUID();
  const now = Date.now();
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes

  const message = [
    "AgentGotTalent Agent Session",
    `Address: ${address}`,
    `Nonce: ${nonce}`,
    `IssuedAt: ${new Date(now).toISOString()}`,
    `ExpiresAt: ${new Date(expiresAt).toISOString()}`,
  ].join("\n");

  challenges.set(address.toLowerCase(), { nonce, message, expiresAt });

  return { address, nonce, message, expiresAt };
}

export async function redeemChallenge(params: {
  addressRaw: string;
  signature: `0x${string}`;
}) {
  const address = params.addressRaw?.trim() as string;
  if (!isAddress(address)) throw new Error("INVALID_ADDRESS");

  const record = challenges.get(address.toLowerCase());
  if (!record) throw new Error("NO_CHALLENGE");
  if (Date.now() > record.expiresAt) {
    challenges.delete(address.toLowerCase());
    throw new Error("CHALLENGE_EXPIRED");
  }

  const ok = await verifyMessage({
    address: address as `0x${string}`,
    message: record.message,
    signature: params.signature,
  });

  if (!ok) throw new Error("INVALID_SIGNATURE");

  // One-time use
  challenges.delete(address.toLowerCase());

  return { address: address as `0x${string}` };
}

export async function signAgentJwt(address: `0x${string}`) {
  const secret = getJwtSecret();
  return new SignJWT({ sub: address.toLowerCase(), typ: "agt-agent" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encoder.encode(secret));
}

export async function requireAgent(req: Request): Promise<AgentSession> {
  const auth = req.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (!m) throw new Error("MISSING_AUTH");

  const secret = getJwtSecret();
  const { payload } = await jwtVerify(m[1], encoder.encode(secret));

  const sub = (payload.sub || "").toString();
  if (!sub || !isAddress(sub)) throw new Error("INVALID_TOKEN");
  const typ = typeof payload["typ"] === "string" ? payload["typ"] : undefined;
  if (typ !== "agt-agent") throw new Error("INVALID_TOKEN_TYPE");

  return { address: sub.toLowerCase() as `0x${string}` };
}
