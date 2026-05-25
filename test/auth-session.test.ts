import { describe, expect, it } from "vitest";
import {
  ownerAdminProfile,
  createSignedDashboardSession,
  parseSignedDashboardSession,
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
    expect(ownerAdminProfile).toEqual({ name: "Caitlin", email: "Hyer.quality.craft@gmail.com" });
  });
});
