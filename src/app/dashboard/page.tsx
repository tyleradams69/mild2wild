import Link from "next/link";
import { PageShell, SectionEyebrow } from "@/components/site";
import { buildCalendarDashboardModel, createDemoDashboardSession } from "@/lib/calendar-access";
import { serviceCategories, staffMembers } from "@/lib/studio-data";

export default function DashboardPage() {
  const ownerModel = buildCalendarDashboardModel(createDemoDashboardSession("owner"), staffMembers);
  const staffModel = buildCalendarDashboardModel(createDemoDashboardSession("staff", "team-member-10"), staffMembers);
  const featuredStaffCalendars = staffModel.visibleCalendars.filter((calendar, index) =>
    index < 4 || calendar.staffSlug === "team-member-10" || calendar.staffSlug === "team-member-11" || index > staffModel.visibleCalendars.length - 3,
  );

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#A95CFF">Admin + staff portal</SectionEyebrow>
        <h1 className="brand-display max-w-5xl text-5xl font-black uppercase md:text-7xl">Role-based calendars are the backbone.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
          This is the dashboard foundation for the owner/admin login and individual employee logins. The real auth layer can plug into this permission model next: owner sees every calendar, staff can only move their own appointments.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="neon-card rounded-[2rem] p-6" style={{ boxShadow: "0 0 70px #A95CFF22" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-purple-200/75">{ownerModel.sessionLabel}</p>
                <h2 className="brand-display mt-2 text-3xl font-black uppercase">Owner command center</h2>
              </div>
              <span className="rounded-full bg-purple-300 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">All access</span>
            </div>
            <p className="mt-4 text-white/65">Can manage all calendars, staff profiles, services, products, and call-agent leads.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="Visible calendars" value={ownerModel.visibleCalendars.length.toString()} />
              <Metric label="Editable calendars" value={ownerModel.editableCalendarSlugs.length.toString()} />
              <Metric label="Permission" value="Owner" />
            </div>
          </article>

          <article className="neon-card rounded-[2rem] p-6" style={{ boxShadow: "0 0 70px #4DDCE522" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-100/75">{staffModel.sessionLabel}</p>
                <h2 className="brand-display mt-2 text-3xl font-black uppercase">Employee calendar lane</h2>
              </div>
              <span className="rounded-full bg-cyan-300 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">Scoped</span>
            </div>
            <p className="mt-4 text-white/65">Can view the portal but only edit their own profile, availability, and bookings.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Metric label="Visible calendars" value={staffModel.visibleCalendars.length.toString()} />
              <Metric label="Editable calendars" value={staffModel.editableCalendarSlugs.length.toString()} />
              <Metric label="Locked from" value="Others" />
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <SectionEyebrow color="#4DDCE5">Example staff-login calendar board</SectionEyebrow>
            <h2 className="brand-display max-w-4xl text-4xl font-black uppercase md:text-6xl">One editable calendar, every other calendar locked.</h2>
          </div>
          <Link href="/staff/team-member-10" className="rounded-full border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white/75 transition hover:bg-white hover:text-black">
            View example profile
          </Link>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/42">{label}</p>
    </div>
  );
}
