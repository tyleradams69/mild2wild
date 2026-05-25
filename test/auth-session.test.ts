import { describe, expect, it } from "vitest";
import {
  ownerAdminProfile,
  createSignedDashboardSession,
  parseSignedDashboardSession,
  shouldSecureDashboardSessionCookie,
} from "../src/lib/auth-session";

describe("dashboard auth session foundation", () => {
  const secret = "test-secret-with-enough-length";

  it("signs and verifies a minimal owner session without exposing credentials", () => {
    const cookie = createSignedDashboardSession(
      { role: "owner", displayName: "Owner Admin", expiresAt: Date.now() + 60_000 },
      secret,
    );

    expect(cookie).not.toContain(secret);
    expect(cookie).not.toContain("password");
    expect(parseSignedDashboardSession(cookie, secret)?.role).toBe("owner");
  });

  it("rejects forged or expired dashboard sessions", () => {
    const cookie = createSignedDashboardSession(
      { role: "staff", staffSlug: "team-member-10", displayName: "Team Member 10", expiresAt: Date.now() + 60_000 },
      secret,
    );
    const forged = cookie.replace("team-member-10", "team-member-11");
    const expired = createSignedDashboardSession(
      { role: "owner", displayName: "Owner Admin", expiresAt: Date.now() - 1 },
      secret,
    );

    expect(parseSignedDashboardSession(forged, secret)).toBeNull();
    expect(parseSignedDashboardSession(expired, secret)).toBeNull();
  });

  it("stores Caitlin's owner identity as dashboard metadata", () => {
    expect(ownerAdminProfile).toEqual({ name: "Caitlin", email: "Hyer.quality.craft@gmail.com", staffSlug: "team-member-13" });
  });

  it("does not mark localhost production cookies secure over plain http", () => {
    expect(shouldSecureDashboardSessionCookie("production", "127.0.0.1:3002", "http")).toBe(false);
    expect(shouldSecureDashboardSessionCookie("production", "localhost:3002", "http")).toBe(false);
    expect(shouldSecureDashboardSessionCookie("production", "mild2wild.vercel.app", "https")).toBe(true);
    expect(shouldSecureDashboardSessionCookie("development", "mild2wild.vercel.app", "https")).toBe(false);
  });
});
