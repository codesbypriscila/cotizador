import { createHmac, timingSafeEqual } from "node:crypto";

// Stateless signed session for the single admin account.
// Token = base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload)).

export const SESSION_COOKIE = "cotizador_session";
export const SESSION_DAYS = 30;

type Payload = { sub: string; exp: number };

function sign(data: string, secret: string) {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createSessionToken(email: string, secret: string, now = Date.now()) {
  const payload: Payload = { sub: email, exp: now + SESSION_DAYS * 24 * 60 * 60 * 1000 };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

/** Returns the email when the token is valid and not expired. */
export function readSessionToken(token: string | undefined, secret: string | undefined, now = Date.now()): string | null {
  if (!token || !secret) return null;
  const [data, mac] = token.split(".");
  if (!data || !mac) return null;
  const expected = Buffer.from(sign(data, secret));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as Payload;
    if (typeof payload.exp !== "number" || payload.exp < now) return null;
    return payload.sub;
  } catch {
    return null;
  }
}
