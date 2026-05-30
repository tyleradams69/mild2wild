import { NextRequest, NextResponse } from "next/server";
import {
  createSignedDashboardSession,
  dashboardSessionCookieName,
  shouldSecureDashboardSessionCookie,
  type DashboardAuthSession,
} from "../../../lib/auth-session";
import { authenticateDashboardUser } from "../../../lib/supabase-auth";

function getDashboardSessionSecret() {
  return process.env.HERMES_DASHBOARD_SESSION_SECRET ?? "m2w-dashboard-dev-session-secret";
}

function loginLocation(error?: string, staffSlug?: string, next?: string) {
  const url = new URL("/login", "http://local.invalid");
  if (error) url.searchParams.set("error", error);
  if (staffSlug) url.searchParams.set("staff", staffSlug);
  if (next) url.searchParams.set("next", next);
  return `${url.pathname}${url.search}`;
}

function safeDashboardRedirect(value: string | undefined | null) {
  const next = value?.trim() ?? "";
  if (!next || !next.startsWith("/dashboard") || next.startsWith("//")) return "/dashboard";
  return next;
}

function requestedStaffSlug(value: string | undefined | null) {
  const slug = value?.trim() ?? "";
  return /^team-member-\d{2,3}$/.test(slug) ? slug : "";
}

function dashboardLocationForSession(session: DashboardAuthSession, next: string, staffSlug: string) {
  if (!staffSlug) return safeDashboardRedirect(next);
  if (session.role === "owner") return safeDashboardRedirect(next || `/dashboard/staff/${staffSlug}/edit`);
  if (session.staffSlug === staffSlug) return safeDashboardRedirect(next || `/dashboard/staff/${staffSlug}/edit`);
  return "/dashboard";
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const staffSlug = requestedStaffSlug(formData.get("staff")?.toString());
  const next = safeDashboardRedirect(formData.get("next")?.toString());
  const resolved = await authenticateDashboardUser({ email, password });

  if (resolved.ok === false) {
    return new NextResponse(null, { status: 303, headers: { Location: loginLocation(resolved.error, staffSlug, next) } });
  }

  const response = new NextResponse(null, { status: 303, headers: { Location: dashboardLocationForSession(resolved.session, next, staffSlug) } });
  response.cookies.set(dashboardSessionCookieName, createSignedDashboardSession(resolved.session, getDashboardSessionSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldSecureDashboardSessionCookie(process.env.NODE_ENV, request.headers.get("host"), request.headers.get("x-forwarded-proto")),
    path: "/",
    expires: new Date(resolved.session.expiresAt),
  });

  return response;
}
