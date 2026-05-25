import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PageShell, SectionEyebrow } from "@/components/site";
import {
  createSignedDashboardSession,
  dashboardSessionCookieName,
  ownerAdminProfile,
  resolveLoginSession,
} from "@/lib/auth-session";
import { staffMembers } from "@/lib/studio-data";

function getDashboardSessionSecret() {
  return process.env.HERMES_DASHBOARD_SESSION_SECRET ?? "mild2wild-local-prototype-session-secret";
}

async function loginAction(formData: FormData) {
  "use server";

  const role = formData.get("role")?.toString();
  const staffSlug = formData.get("staffSlug")?.toString();
  const ownerEmail = formData.get("ownerEmail")?.toString();
  const resolved = resolveLoginSession({ role, staffSlug, ownerEmail });

  if (!resolved.ok) {
    redirect(`/login?error=${resolved.error}`);
  }

  const cookieValue = createSignedDashboardSession(resolved.session, getDashboardSessionSecret());
  const cookieStore = await cookies();
  cookieStore.set(dashboardSessionCookieName, cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(resolved.session.expiresAt),
  });

  redirect("/dashboard");
}

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const error = params?.error;
  const bookableStaff = staffMembers.filter((staff) => !staff.isMascot);

  return (
    <PageShell>
      <section className="mx-auto max-w-5xl px-5 py-16">
        <SectionEyebrow color="#F06BD6">Portal login</SectionEyebrow>
        <h1 className="brand-display max-w-4xl text-5xl font-black uppercase md:text-7xl">Owner sees everything. Staff stays scoped.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
          Prototype login for the Mild 2 Wild portal. Caitlin’s owner/admin route signs an all-access session, while each employee login receives a session scoped to only their calendar.
        </p>

        {error ? (
          <div className="mt-8 rounded-3xl border border-pink-300/40 bg-pink-500/10 p-4 text-sm font-bold text-pink-100">
            Could not create that login session: {error.replaceAll("_", " ")}.
          </div>
        ) : null}

        <form action={loginAction} className="neon-card mt-10 grid gap-6 rounded-[2rem] p-6" style={{ boxShadow: "0 0 70px #F06BD622" }}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="rounded-3xl border border-white/10 bg-black/50 p-5">
              <span className="block text-xs font-black uppercase tracking-[0.24em] text-white/45">Login type</span>
              <select name="role" className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 font-bold text-white outline-none focus:border-pink-300">
                <option value="owner">Owner admin - all calendars</option>
                <option value="staff">Employee - own calendar only</option>
              </select>
            </label>

            <label className="rounded-3xl border border-white/10 bg-black/50 p-5">
              <span className="block text-xs font-black uppercase tracking-[0.24em] text-white/45">Owner admin email</span>
              <input
                name="ownerEmail"
                type="email"
                defaultValue={ownerAdminProfile.email}
                className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 font-bold text-white outline-none focus:border-pink-300"
                aria-describedby="owner-email-help"
              />
              <span id="owner-email-help" className="mt-2 block text-xs leading-5 text-white/45">
                Caitlin’s owner login email. Staff logins can leave this as-is and choose their employee profile.
              </span>
            </label>

            <label className="rounded-3xl border border-white/10 bg-black/50 p-5">
              <span className="block text-xs font-black uppercase tracking-[0.24em] text-white/45">Employee profile</span>
              <select name="staffSlug" className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 font-bold text-white outline-none focus:border-cyan-300">
                <option value="">Owner login or choose staff</option>
                {bookableStaff.map((staff) => (
                  <option key={staff.slug} value={staff.slug}>
                    {staff.name} — {staff.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button className="rounded-full bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-black transition hover:bg-pink-300" type="submit">
            Enter dashboard
          </button>
        </form>
      </section>
    </PageShell>
  );
}
