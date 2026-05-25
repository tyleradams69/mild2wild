import { NextRequest, NextResponse } from "next/server";
import {
  createSignedDashboardSession,
  dashboardSessionCookieName,
  shouldSecureDashboardSessionCookie,
} from "../../../lib/auth-session";
import { authenticateDashboardUser } from "../../../lib/supabase-auth";

function getDashboardSessionSecret() {
  return process.env.HERMES_DASHBOARD_SESSION_SECRET ?? "mild2wild-local-prototype-session-secret";
}

function loginLocation(error?: string) {
  const url = new URL("/login", "http://local.invalid");
  if (error) url.searchParams.set("error", error);
  return `${url.pathname}${url.search}`;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const resolved = await authenticateDashboardUser({ email, password });

  if (resolved.ok === false) {
    return new NextResponse(null, { status: 303, headers: { Location: loginLocation(resolved.error) } });
  }

  const response = new NextResponse(null, { status: 303, headers: { Location: "/dashboard" } });
  response.cookies.set(dashboardSessionCookieName, createSignedDashboardSession(resolved.session, getDashboardSessionSecret()), {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldSecureDashboardSessionCookie(process.env.NODE_ENV, request.headers.get("host"), request.headers.get("x-forwarded-proto")),
    path: "/",
    expires: new Date(resolved.session.expiresAt),
  });

  return response;
}
