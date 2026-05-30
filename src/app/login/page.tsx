import type { Metadata } from "next";
import Image from "next/image";
import { PageShell, PaintSplat, SectionEyebrow } from "@/components/site";
import { staffMembers } from "@/lib/studio-data";
import { readStoredStaffMembers } from "@/lib/staff-profile-overrides";

export const metadata: Metadata = {
  title: "Team Login",
  description: "Authorized Mild 2 Wild team login for managing appointments, schedules, and staff profiles.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

function errorCopy(error?: string) {
  if (!error) return null;
  const messages: Record<string, string> = {
    missing_credentials: "Enter your email and password to continue.",
    invalid_credentials: "That email or password did not match a dashboard user.",
    supabase_not_configured: "Dashboard sign-in is not configured for this environment yet.",
    unauthorized_user: "That account is not assigned to this dashboard yet.",
  };

  return messages[error] ?? "Could not create that login session.";
}

function safeLoginNext(value?: string) {
  const next = value?.trim() ?? "";
  if (!next || !next.startsWith("/dashboard") || next.startsWith("//")) return "/dashboard";
  return next;
}

function safeStaffSlug(value?: string) {
  const slug = value?.trim() ?? "";
  return /^team-member-\d{2,3}$/.test(slug) ? slug : "";
}

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ error?: string; staff?: string; next?: string }> }) {
  const params = await searchParams;
  const message = errorCopy(params?.error);
  const staffSlug = safeStaffSlug(params?.staff);
  const staffProfile = (await readStoredStaffMembers(staffMembers)).find((staff) => staff.slug === staffSlug && !staff.isMascot);
  const next = safeLoginNext(params?.next || (staffProfile ? `/dashboard/staff/${staffProfile.slug}/edit` : "/dashboard"));

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-5 py-16">
        <SectionEyebrow color="#F06BD6">Team login</SectionEyebrow>
        <h1 className="brand-display max-w-4xl text-4xl font-black uppercase min-[420px]:text-5xl md:text-7xl">
          Sign in to the <span className="block">dashboard.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
          Authorized team members can sign in to manage appointments, schedules, profile copy, and portfolio showcases.
        </p>

        {staffProfile ? (
          <div className="mt-8 flex items-center gap-4 rounded-[2rem] border border-pink-200/30 bg-white/[0.06] p-4 shadow-2xl shadow-pink-500/10">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[1.4rem] border-2 border-pink-200 bg-black shadow-[4px_5px_0_#F06BD6]">
              <Image src={staffProfile.photoUrl} alt={`${staffProfile.name} profile photo`} fill sizes="80px" className="object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-pink-100/70">Signing in for</p>
              <p className="brand-display mt-1 text-2xl font-black uppercase text-white">{staffProfile.name}</p>
              <p className="mt-1 text-sm font-bold text-white/55">You&apos;ll land on this profile editor after your account is verified.</p>
            </div>
          </div>
        ) : null}

        {message ? (
          <div className="mt-8 rounded-3xl border border-pink-300/40 bg-pink-500/10 p-4 text-sm font-bold text-pink-100">
            {message}
          </div>
        ) : null}

        <form
          action="/api/dashboard-login"
          method="post"
          className="neon-card relative mx-1 mt-10 grid overflow-hidden rounded-[2rem] bg-[#fff7e8] p-5 shadow-[8px_9px_0_#17130f,0_0_0_8px_#F06BD633,0_26px_60px_rgba(40,26,20,0.2)] sm:mx-0 sm:p-6"
        >
          <input type="hidden" name="staff" value={staffProfile?.slug ?? ""} />
          <input type="hidden" name="next" value={next} />
          <PaintSplat color="#F06BD6" variant="window" className="absolute -right-10 -top-12 w-40 rotate-12 opacity-40" />
          <PaintSplat color="#4DDCE5" variant="bubble" className="absolute -bottom-14 -left-10 w-40 -rotate-12 opacity-35" />

          <div className="relative z-10 grid gap-5 pb-1">
            <div className="rounded-[1.6rem] border-2 border-black bg-pink-100/85 p-4 shadow-[4px_5px_0_#17130f] sm:p-5">
              <label>
                <span className="block text-xs font-black uppercase tracking-[0.24em] text-black/65">Email</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="mt-3 w-full rounded-2xl border-2 border-black bg-[#fffaf0] px-4 py-3 font-bold text-black shadow-[3px_4px_0_#17130f] outline-none placeholder:text-black/50 focus:border-pink-500 focus:bg-white"
                  required
                />
              </label>
            </div>

            <div className="rounded-[1.6rem] border-2 border-black bg-cyan-100/85 p-4 shadow-[4px_5px_0_#17130f] sm:p-5">
              <label>
                <span className="block text-xs font-black uppercase tracking-[0.24em] text-black/65">Password</span>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  className="mt-3 w-full rounded-2xl border-2 border-black bg-[#fffaf0] px-4 py-3 font-bold text-black shadow-[3px_4px_0_#17130f] outline-none focus:border-cyan-500 focus:bg-white"
                  required
                />
              </label>
            </div>

            <button className="shop-tag bg-lime-200 px-6 py-4 text-sm font-black uppercase tracking-[0.22em] transition hover:-translate-y-0.5 hover:bg-yellow-200" type="submit">
              Sign in
            </button>
          </div>
        </form>
      </section>
    </PageShell>
  );
}
