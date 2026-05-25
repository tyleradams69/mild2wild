import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PageShell, SectionEyebrow } from "@/components/site";
import { dashboardSessionCookieName, parseSignedDashboardSession } from "@/lib/auth-session";
import { buildCalendarDashboardModel } from "@/lib/calendar-access";
import { getStaffBySlug, serviceCategories, staffMembers } from "@/lib/studio-data";

function getDashboardSessionSecret() {
  return process.env.HERMES_DASHBOARD_SESSION_SECRET ?? "mild2wild-local-prototype-session-secret";
}

async function logoutAction() {
  "use server";

  const cookieStore = await cookies();
  cookieStore.delete(dashboardSessionCookieName);
  redirect("/login");
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const session = parseSignedDashboardSession(cookieStore.get(dashboardSessionCookieName)?.value, getDashboardSessionSecret());

  if (!session) {
    redirect("/login");
  }

  const dashboardModel = buildCalendarDashboardModel(session, staffMembers);
  const identityChipLabel = dashboardModel.canManageAllCalendars ? "Owner Admin" : (dashboardModel.profileAvatar?.title ?? dashboardModel.sessionLabel);
  const featuredStaffCalendars = dashboardModel.visibleCalendars.filter(
    (calendar, index) =>
      !getStaffBySlug(calendar.staffSlug)?.isMascot &&
      (dashboardModel.canManageAllCalendars || index < 4 || calendar.canEdit || index > dashboardModel.visibleCalendars.length - 3),
  );

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <SectionEyebrow color="#A95CFF">Admin + staff portal</SectionEyebrow>
            <h1 className="brand-display max-w-5xl text-5xl font-black uppercase md:text-7xl">Role-based calendars are live.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
              Signed sessions now separate owner/admin access from individual employee logins. The owner can manage every calendar; employees can only edit their own schedule lane.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start rounded-full border border-white/10 bg-black/60 p-2 pr-4 shadow-2xl shadow-pink-500/10">
            {dashboardModel.profileAvatar ? (
              <div
                className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 bg-black"
                style={{ borderColor: dashboardModel.profileAvatar.accent, boxShadow: `0 0 28px ${dashboardModel.profileAvatar.accent}55` }}
              >
                <Image
                  src={dashboardModel.profileAvatar.photoUrl}
                  alt={`${dashboardModel.profileAvatar.name} cartoon portrait`}
                  fill
                  sizes="64px"
                  className="object-cover"
                  priority
                />
              </div>
            ) : null}
            <div className="hidden min-w-0 sm:block">
              <p className="max-w-56 text-sm font-black text-white">{session.displayName}</p>
              <p className="mt-0.5 max-w-56 text-[0.65rem] font-black uppercase tracking-[0.14em] text-white/45">
                {identityChipLabel}
              </p>
            </div>
            <form action={logoutAction}>
              <button className="rounded-full border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/75 transition hover:bg-white hover:text-black" type="submit">
                Log out
              </button>
            </form>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="neon-card rounded-[2rem] p-6" style={{ boxShadow: "0 0 70px #A95CFF22" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-purple-200/75">{dashboardModel.sessionLabel}</p>
                <h2 className="brand-display mt-2 text-3xl font-black uppercase">{session.displayName}</h2>
              </div>
              <span className="rounded-full bg-purple-300 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">
                {dashboardModel.canManageAllCalendars ? "All access" : "Scoped"}
              </span>
            </div>
            <p className="mt-4 text-white/65">
              {dashboardModel.canManageAllCalendars
                ? "Can manage all calendars, staff profiles, services, products, and call-agent leads."
                : "Can view the portal but only edit their own profile, availability, and bookings."}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {session.email ? <Metric label="Admin email" value={session.email} wide /> : null}
              <Metric label="Visible calendars" value={dashboardModel.visibleCalendars.length.toString()} />
              <Metric label="Editable calendars" value={dashboardModel.editableCalendarSlugs.length.toString()} />
              <Metric label="Permission" value={dashboardModel.canManageAllCalendars ? "Owner" : "Staff"} />
            </div>
          </article>

          <article className="neon-card rounded-[2rem] p-6" style={{ boxShadow: "0 0 70px #4DDCE522" }}>
            <SectionEyebrow color="#4DDCE5">Call-agent handoff</SectionEyebrow>
            <h2 className="brand-display text-3xl font-black uppercase">Lead intake can route to the right person.</h2>
            <p className="mt-4 text-white/65">
              The worker agent can collect name, requested service, and appointment notes, then hand the call to the shop with context already attached. Service-specific routing uses the same staff/category model as the public pages.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <SectionEyebrow color="#4DDCE5">Calendar board</SectionEyebrow>
            <h2 className="brand-display max-w-4xl text-4xl font-black uppercase md:text-6xl">
              {dashboardModel.canManageAllCalendars ? "Every staff calendar is editable." : "One editable calendar, every other calendar locked."}
            </h2>
          </div>
          {session.staffSlug ? (
            <Link href={`/staff/${session.staffSlug}`} className="rounded-full border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white/75 transition hover:bg-white hover:text-black">
              View my profile
            </Link>
          ) : null}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {featuredStaffCalendars.map((calendar) => {
            const category = serviceCategories.find((item) => item.slug === calendar.categorySlugs[0]);
            return (
              <article
                key={calendar.staffSlug}
                className="rounded-[1.6rem] border bg-black/70 p-5"
                style={{
                  borderColor: calendar.canEdit ? `${calendar.calendarColor}88` : "rgba(255,255,255,0.1)",
                  boxShadow: calendar.canEdit ? `0 0 55px ${calendar.calendarColor}28` : "none",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className="rounded-full px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-black"
                    style={{ background: calendar.canEdit ? calendar.calendarColor : "rgba(255,255,255,0.55)" }}
                  >
                    {calendar.statusLabel}
                  </span>
                  <span className="text-xl">{calendar.canEdit ? "✦" : "锁"}</span>
                </div>
                <h3 className="brand-display mt-7 text-2xl font-black uppercase">{calendar.staffName}</h3>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-white/45">{calendar.title}</p>
                <p className="mt-4 text-sm leading-6 text-white/60">{calendar.permissionNote}</p>
                <p className="mt-5 text-xs font-black uppercase tracking-[0.18em]" style={{ color: category?.accent ?? calendar.calendarColor }}>
                  {category?.name ?? "Staff calendar"}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}

function Metric({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 ${wide ? "sm:col-span-2 xl:col-span-3" : ""}`}>
      <p className="min-w-0 break-words text-2xl font-black leading-tight text-white [overflow-wrap:anywhere] sm:text-3xl">{value}</p>
      <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/42">{label}</p>
    </div>
  );
}
