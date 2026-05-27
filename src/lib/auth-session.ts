import { createHmac, timingSafeEqual } from "node:crypto";

export const dashboardSessionCookieName = "m2w_dashboard_session";

export type DashboardAuthRole = "owner" | "staff";

export type DashboardAuthSession = {
  role: DashboardAuthRole;
  staffSlug?: string;
  displayName: string;
  email?: string;
  expiresAt: number;
};

export const ownerAdminProfile = {
  name: "Caitlin",
  email: "Hyer.quality.craft@gmail.com",
  staffSlug: "team-member-13",
} as const;

function hostWithoutPort(host: string | undefined | null) {
  return (host ?? "").split(":")[0]?.toLowerCase() ?? "";
}

export function shouldSecureDashboardSessionCookie(nodeEnv: string | undefined, host: string | undefined | null, forwardedProto: string | undefined | null) {
  if (nodeEnv !== "production") return false;

  const hostname = hostWithoutPort(host);
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") return false;

  return forwardedProto === "https";
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function encodePayload(session: DashboardAuthSession) {
  return JSON.stringify(session);
}

function decodePayload(payload: string): DashboardAuthSession | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(payload)) as Partial<DashboardAuthSession>;

    if (parsed.role !== "owner" && parsed.role !== "staff") return null;
    if (typeof parsed.displayName !== "string" || parsed.displayName.length < 1) return null;
    if (typeof parsed.expiresAt !== "number") return null;
    if (parsed.role === "staff" && typeof parsed.staffSlug !== "string") return null;

    return {
      role: parsed.role,
      staffSlug: parsed.staffSlug,
      displayName: parsed.displayName,
      email: typeof parsed.email === "string" ? parsed.email : undefined,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export function createSignedDashboardSession(session: DashboardAuthSession, secret: string) {
  const payload = encodePayload(session);
  const signature = signPayload(payload, secret);

  return `${payload}.${signature}`;
}

export function parseSignedDashboardSession(cookieValue: string | undefined | null, secret: string, now = Date.now()) {
  if (!cookieValue || !secret) return null;

  const separatorIndex = cookieValue.lastIndexOf(".");
  if (separatorIndex <= 0) return null;

  const payload = cookieValue.slice(0, separatorIndex);
  const signature = cookieValue.slice(separatorIndex + 1);
  const expectedSignature = signPayload(payload, secret);

  if (!safeEqual(signature, expectedSignature)) return null;

  const session = decodePayload(payload);
  if (!session || session.expiresAt <= now) return null;

  return session;
}
