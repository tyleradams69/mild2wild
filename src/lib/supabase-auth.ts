import { ownerAdminProfile, type DashboardAuthSession } from "./auth-session";
import { staffMembers } from "./studio-data";

type SupabaseAuthEnv = Record<string, string | undefined>;

type LoginCredentials = {
  email?: string;
  password?: string;
};

type Fetcher = typeof fetch;

type SupabasePasswordGrantUser = {
  id?: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
};

type SupabasePasswordGrantResponse = {
  access_token?: string;
  refresh_token?: string;
  user?: SupabasePasswordGrantUser;
};

export type SupabaseDashboardAuthResult =
  | { ok: true; session: DashboardAuthSession }
  | { ok: false; error: "missing_credentials" | "supabase_not_configured" | "invalid_credentials" | "unauthorized_user" };

const oneDayMs = 24 * 60 * 60 * 1000;

export function readServerEnvValue(value: unknown) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.length >= 2) {
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return trimmed.slice(1, -1).trim();
    }
  }
  return trimmed;
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function metadataString(metadata: Record<string, unknown> | undefined, keys: string[]) {
  for (const key of keys) {
    const value = metadata?.[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function getSupabaseUrl(env: SupabaseAuthEnv) {
  return readServerEnvValue(env.SUPABASE_URL) || readServerEnvValue(env.NEXT_PUBLIC_SUPABASE_URL);
}

function getSupabaseAnonKey(env: SupabaseAuthEnv) {
  return readServerEnvValue(env.SUPABASE_ANON_KEY) || readServerEnvValue(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function buildSupabasePasswordGrantRequest(env: SupabaseAuthEnv, email: string, password: string) {
  const supabaseUrl = getSupabaseUrl(env).replace(/\/+$/, "");
  const anonKey = getSupabaseAnonKey(env);

  return {
    url: `${supabaseUrl}/auth/v1/token?grant_type=password`,
    headers: {
      apikey: anonKey,
      authorization: `Bearer ${anonKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  };
}

export function dashboardSessionFromSupabaseUser(user: SupabasePasswordGrantUser, now = Date.now()): DashboardAuthSession | null {
  const email = normalizeEmail(user.email);
  const metadata = user.user_metadata;
  const displayName = metadataString(metadata, ["full_name", "name", "displayName"]) || user.email || "Dashboard user";

  if (email === normalizeEmail(ownerAdminProfile.email)) {
    return {
      role: "owner",
      displayName: ownerAdminProfile.name,
      email: ownerAdminProfile.email,
      expiresAt: now + oneDayMs,
    };
  }

  const staffSlug = metadataString(metadata, ["staff_slug", "staffSlug"]);
  const staff = staffMembers.find((member) => member.slug === staffSlug && !member.isMascot);
  if (!staff) return null;

  return {
    role: "staff",
    staffSlug: staff.slug,
    displayName: displayName || staff.name,
    email: user.email,
    expiresAt: now + oneDayMs,
  };
}

export async function authenticateDashboardUser(
  credentials: LoginCredentials,
  env: SupabaseAuthEnv = process.env,
  fetcher: Fetcher = fetch,
  now = Date.now(),
): Promise<SupabaseDashboardAuthResult> {
  const email = typeof credentials.email === "string" ? credentials.email.trim() : "";
  const password = typeof credentials.password === "string" ? credentials.password : "";
  if (!email || !password) return { ok: false, error: "missing_credentials" };

  if (!getSupabaseUrl(env) || !getSupabaseAnonKey(env)) {
    return { ok: false, error: "supabase_not_configured" };
  }

  const request = buildSupabasePasswordGrantRequest(env, email, password);
  let response: Response;
  try {
    response = await fetcher(request.url, {
      method: "POST",
      headers: request.headers,
      body: request.body,
    });
  } catch {
    return { ok: false, error: "supabase_not_configured" };
  }

  if (!response.ok) return { ok: false, error: "invalid_credentials" };

  const payload = (await response.json().catch(() => null)) as SupabasePasswordGrantResponse | null;
  const session = payload?.user ? dashboardSessionFromSupabaseUser(payload.user, now) : null;
  if (!session) return { ok: false, error: "unauthorized_user" };

  return { ok: true, session };
}
