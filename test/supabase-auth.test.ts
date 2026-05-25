import { describe, expect, it, vi } from "vitest";
import { ownerAdminProfile } from "../src/lib/auth-session";
import { authenticateDashboardUser, buildSupabasePasswordGrantRequest } from "../src/lib/supabase-auth";

describe("Supabase dashboard auth", () => {
  const env = {
    SUPABASE_URL: ' "https://example.supabase.co" ',
    SUPABASE_ANON_KEY: ' "anon-test-key" ',
  };

  it("normalizes quoted env values for the password grant request", () => {
    const request = buildSupabasePasswordGrantRequest(env, ownerAdminProfile.email, "123456");

    expect(request.url).toBe("https://example.supabase.co/auth/v1/token?grant_type=password");
    expect(request.headers.apikey).toBe("anon-test-key");
    expect(request.headers.authorization).toBe("Bearer anon-test-key");
    expect(JSON.parse(request.body)).toEqual({ email: ownerAdminProfile.email, password: "123456" });
  });

  it("turns Caitlin's Supabase Auth user into an owner dashboard session without leaking tokens or passwords", async () => {
    const fetcher = vi.fn(async () =>
      new Response(
        JSON.stringify({
          access_token: "supabase-access-token",
          refresh_token: "supabase-refresh-token",
          user: {
            id: "auth-user-1",
            email: ownerAdminProfile.email,
            user_metadata: { full_name: "Caitlin" },
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );

    const result = await authenticateDashboardUser({ email: ownerAdminProfile.email, password: "123456" }, env, fetcher, 1_000);

    expect(result.ok && result.session.role).toBe("owner");
    expect(result.ok && result.session.displayName).toBe("Caitlin");
    expect(result.ok && result.session.email).toBe(ownerAdminProfile.email);
    expect(JSON.stringify(result)).not.toContain("123456");
    expect(JSON.stringify(result)).not.toContain("supabase-access-token");
    expect(JSON.stringify(result)).not.toContain("supabase-refresh-token");
  });

  it("rejects invalid Supabase credentials without returning upstream details", async () => {
    const fetcher = vi.fn(async () =>
      new Response(JSON.stringify({ error_description: "Invalid login credentials" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(authenticateDashboardUser({ email: ownerAdminProfile.email, password: "wrong" }, env, fetcher)).resolves.toEqual({
      ok: false,
      error: "invalid_credentials",
    });
  });
});
