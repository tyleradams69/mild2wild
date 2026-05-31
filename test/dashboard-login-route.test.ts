import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../src/app/api/dashboard-login/route";
import { dashboardSessionCookieName, ownerAdminProfile } from "../src/lib/auth-session";

describe("dashboard login route", () => {
  it("sets the session cookie and redirects with a relative dashboard location", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "anon-test-key");
    vi.stubEnv("HERMES_DASHBOARD_SESSION_SECRET", "test-secret-with-enough-length");
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "redacted-token",
          refresh_token: "redacted-refresh",
          user: { email: ownerAdminProfile.email, user_metadata: { full_name: "Caitlin" } },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const body = new URLSearchParams({
      email: ownerAdminProfile.email,
      password: "123456",
      staff: "team-member-14",
      next: "/dashboard/staff/team-member-14/edit",
    });
    const request = new NextRequest("http://127.0.0.1:3002/api/dashboard-login", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", host: "127.0.0.1:3002" },
      body,
    });

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/dashboard/staff/team-member-14/edit");
    expect(response.headers.get("set-cookie")).toContain(dashboardSessionCookieName);
    expect(response.headers.get("set-cookie")).not.toContain("Secure");
    expect(fetcher).toHaveBeenCalledOnce();
    vi.unstubAllEnvs();
    fetcher.mockRestore();
  });

  it("keeps staff login redirects on the staff calendar even when a profile-editor next path is requested", async () => {
    vi.stubEnv("SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("SUPABASE_ANON_KEY", "anon-test-key");
    vi.stubEnv("HERMES_DASHBOARD_SESSION_SECRET", "test-secret-with-enough-length");
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          access_token: "redacted-token",
          refresh_token: "redacted-refresh",
          user: { email: "staff@example.com", user_metadata: { full_name: "Staff", staff_slug: "team-member-10" } },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const body = new URLSearchParams({
      email: "staff@example.com",
      password: "123456",
      staff: "team-member-10",
      next: "/dashboard/staff/team-member-10/edit",
    });
    const request = new NextRequest("http://127.0.0.1:3002/api/dashboard-login", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", host: "127.0.0.1:3002" },
      body,
    });

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/dashboard/calendar/team-member-10");
    vi.unstubAllEnvs();
    fetcher.mockRestore();
  });
});
