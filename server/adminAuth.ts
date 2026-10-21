import crypto from "node:crypto";
import { Request, Response, NextFunction } from "express";
const sessions = new Map<string, number>();
const attempts = new Map<string, { count: number; until: number }>();
const equal = (a: string, b: string) => {
  const x = crypto.createHash("sha256").update(a).digest();
  const y = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(x, y);
};
function readSession(req: Request) {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return null;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) return null;
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length) return null;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  if (!equal(signature, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (
      typeof data.exp !== "number" ||
      data.exp <= Date.now() ||
      data.user !== process.env.ADMIN_USERNAME ||
      sessions.has(data.id)
    )
      return null;
    return data as { id: string; exp: number; user: string };
  } catch {
    return null;
  }
}
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (readSession(req)) {
    res.setHeader("Cache-Control", "no-store");
    return next();
  }
  return res
    .status(401)
    .json({
      message:
        "Your administrator session is missing or expired. Please sign in.",
    });
}
export function adminLogin(req: Request, res: Response) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!username || !password || !secret || secret.length < 32)
    return res
      .status(503)
      .json({
        message: "Administrator login is not configured on this server.",
      });
  const key = req.ip || "unknown";
  const now = Date.now();
  for (const [id, entry] of attempts)
    if (entry.until <= now) attempts.delete(id);
  for (const [id, expiry] of sessions) if (expiry <= now) sessions.delete(id);
  const limit = attempts.get(key);
  if (limit && limit.count >= 10)
    return res
      .status(429)
      .json({ message: "Too many login attempts. Try again in 15 minutes." });
  if (
    typeof req.body.username !== "string" ||
    typeof req.body.password !== "string" ||
    !equal(req.body.username, username) ||
    !equal(req.body.password, password)
  ) {
    attempts.set(key, {
      count: (limit?.count || 0) + 1,
      until: limit?.until || now + 900000,
    });
    return res.status(401).json({ message: "Invalid username or password." });
  }
  attempts.delete(key);
  const payload = Buffer.from(
    JSON.stringify({
      user: username,
      id: crypto.randomUUID(),
      exp: now + 8 * 60 * 60 * 1000,
    }),
  ).toString("base64url");
  const token =
    payload +
    "." +
    crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  res.setHeader("Cache-Control", "no-store");
  return res.json({
    success: true,
    token,
    user: { username, role: "admin", name: "Event Administrator" },
  });
}
export function adminLogout(req: Request, res: Response) {
  const session = readSession(req);
  if (session) sessions.set(session.id, session.exp);
  return res.json({ success: true });
}
