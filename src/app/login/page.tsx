import { PageShell, SectionEyebrow } from "@/components/site";

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

export default async function LoginPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const message = errorCopy(params?.error);

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-5 py-16">
        <SectionEyebrow color="#F06BD6">Team login</SectionEyebrow>
        <h1 className="brand-display max-w-4xl text-5xl font-black uppercase md:text-7xl">Sign in to the dashboard.</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">
          Authorized team members can sign in to manage appointments and schedules.
        </p>

        {message ? (
          <div className="mt-8 rounded-3xl border border-pink-300/40 bg-pink-500/10 p-4 text-sm font-bold text-pink-100">
            {message}
          </div>
        ) : null}

        <form action="/api/dashboard-login" method="post" className="neon-card mt-10 grid gap-6 rounded-[2rem] p-6" style={{ boxShadow: "0 0 70px #F06BD622" }}>
          <label className="rounded-3xl border border-white/10 bg-black/50 p-5">
            <span className="block text-xs font-black uppercase tracking-[0.24em] text-white/45">Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 font-bold text-white outline-none focus:border-pink-300"
              required
            />
          </label>

          <label className="rounded-3xl border border-white/10 bg-black/50 p-5">
            <span className="block text-xs font-black uppercase tracking-[0.24em] text-white/45">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black px-4 py-3 font-bold text-white outline-none focus:border-pink-300"
              required
            />
          </label>

          <button className="rounded-full bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-black transition hover:bg-pink-300" type="submit">
            Sign in
          </button>
        </form>
      </section>
    </PageShell>
  );
}
