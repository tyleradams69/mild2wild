import { createHmac, timingSafeEqual } from "node:crypto";
import { staffMembers } from "./studio-data";

export const dashboardSessionCookieName = "m2w_dashboard_session";

export type DashboardAuthRole = "owner" | "staff";

export type DashboardAuthSession = {
  role: DashboardAuthRole;
  staffSlug?: string;
  displayName: string;
  email?: string;
  expiresAt: number;
};

export type LoginFormChoice = {
  role?: string;
  staffSlug?: string;
  ownerEmail?: string;
  ownerPassword?: string;
};

export type LoginSessionResult =
  | { ok: true; session: DashboardAuthSession }
  | { ok: false; error: "invalid_role" | "invalid_owner_email" | "invalid_owner_password" | "missing_staff" | "unknown_staff" | "mascot_not_bookable" };

const oneDayMs = 24 * 60 * 60 * 1000;

export const ownerAdminProfile = {
  name: "Caitlin",
  email: "Hyer.quality.craft@gmail.com",
} as const;

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function normalizeSecret(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
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
  return encodeURIComponent(JSON.stringify(session));
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

export function resolveLoginSession(choice: LoginFormChoice, now = Date.now(), expectedOwnerPassword = process.env.M2W_OWNER_ADMIN_PASSWORD ?? ""): LoginSessionResult {
  if (choice.role === "owner") {
    if (normalizeEmail(choice.ownerEmail) !== normalizeEmail(ownerAdminProfile.email)) {
      return { ok: false, error: "invalid_owner_email" };
    }

    const configuredOwnerPassword = normalizeSecret(expectedOwnerPassword);
    if (!configuredOwnerPassword || !safeEqual(normalizeSecret(choice.ownerPassword), configuredOwnerPassword)) {
      return { ok: false, error: "invalid_owner_password" };
    }

    return {
      ok: true,
      session: {
        role: "owner",
        displayName: ownerAdminProfile.name,
        email: ownerAdminProfile.email,
        expiresAt: now + oneDayMs,
      },
    };
  }

  if (choice.role !== "staff") {
    return { ok: false, error: "invalid_role" };
  }

  if (!choice.staffSlug) {
    return { ok: false, error: "missing_staff" };
  }

  const staff = staffMembers.find((member) => member.slug === choice.staffSlug);
  if (!staff) {
    return { ok: false, error: "unknown_staff" };
  }

  if (staff.isMascot) {
    return { ok: false, error: "mascot_not_bookable" };
  }

  return {
    ok: true,
    session: {
      role: "staff",
      staffSlug: staff.slug,
      displayName: staff.name,
      expiresAt: now + oneDayMs,
    },
  };
}
