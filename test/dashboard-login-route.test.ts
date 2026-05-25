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

    const body = new URLSearchParams({ email: ownerAdminProfile.email, password: "123456" });
    const request = new NextRequest("http://127.0.0.1:3002/api/dashboard-login", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", host: "127.0.0.1:3002" },
      body,
    });

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/dashboard");
    expect(response.headers.get("set-cookie")).toContain(dashboardSessionCookieName);
    expect(response.headers.get("set-cookie")).not.toContain("Secure");
    expect(fetcher).toHaveBeenCalledOnce();
    vi.unstubAllEnvs();
    fetcher.mockRestore();
  });
});
