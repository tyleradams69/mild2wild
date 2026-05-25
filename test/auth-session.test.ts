import { describe, expect, it } from "vitest";
import {
  ownerAdminProfile,
  createSignedDashboardSession,
  parseSignedDashboardSession,
  resolveLoginSession,
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

  it("maps login form choices to scoped sessions", () => {
    const owner = resolveLoginSession({ role: "owner", ownerEmail: "Hyer.quality.craft@gmail.com" });
    const staff = resolveLoginSession({ role: "staff", staffSlug: "team-member-10" });
    const missingStaff = resolveLoginSession({ role: "staff" });

    expect(owner.ok && owner.session.role).toBe("owner");
    expect(owner.ok && owner.session.displayName).toBe("Caitlin");
    expect(owner.ok && owner.session.email).toBe(ownerAdminProfile.email);
    expect(staff.ok && staff.session.staffSlug).toBe("team-member-10");
    expect(missingStaff.ok).toBe(false);
  });

  it("requires Caitlin's admin email for owner login", () => {
    expect(ownerAdminProfile).toEqual({ name: "Caitlin", email: "Hyer.quality.craft@gmail.com" });
    expect(resolveLoginSession({ role: "owner", ownerEmail: "hyER.quality.craft@gmail.com" }).ok).toBe(true);
    expect(resolveLoginSession({ role: "owner" })).toEqual({ ok: false, error: "invalid_owner_email" });
    expect(resolveLoginSession({ role: "owner", ownerEmail: "someone@example.com" })).toEqual({ ok: false, error: "invalid_owner_email" });
  });
});
