import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageShell, SectionEyebrow } from "@/components/site";
import { dashboardSessionCookieName, parseSignedDashboardSession } from "@/lib/auth-session";
import { buildCalendarBoard, buildCalendarDayView, type CalendarDayEvent, type CalendarBoardAppointment } from "@/lib/calendar-board";
import { canEditOwnedAppointment } from "@/lib/owned-calendar-system";
import { mergeStaffProfileOverrides, readStaffProfileOverrides } from "@/lib/staff-profile-overrides";
import { serviceCategories, staffMembers } from "@/lib/studio-data";
import { createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const fallbackCalendarAppointments: CalendarBoardAppointment[] = [
  {
    id: "sample-booking-1",
    staffSlug: "team-member-13",
    serviceName: "Custom Nail Art",
    clientName: "Maya Rose",
    clientPhone: "555-0101",
    clientEmail: "maya@example.com",
    startsAt: "2026-06-01T18:00:00.000Z",
    endsAt: "2026-06-01T19:00:00.000Z",
    status: "requested",
    source: "website",
    notes: "Wants chrome flame nail art and asked for Caitlin if available.",
    internalNotes: "Called once, send inspiration/photo examples before confirming deposit.",
  },
  {
    id: "sample-calendar-2",
    staffSlug: "team-member-10",
    serviceName: "Tattoo Consultation",
    clientName: "Riley Ink",
    clientPhone: "555-0202",
    clientEmail: null,
    startsAt: "2026-06-01T20:00:00.000Z",
    endsAt: "2026-06-01T20:30:00.000Z",
    status: "confirmed",
    source: "manual",
    notes: "Fine-line consult with placement questions.",
    internalNotes: "Ask for reference images before deposit.",
  },
];

type AppointmentRelationRow = {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  starts_at: string;
  ends_at: string;
  status: string;
  notes: string | null;
  internal_notes: string | null;
  staff_members?: { slug?: string | null } | { slug?: string | null }[] | null;
  services?: { slug?: string | null; name?: string | null } | { slug?: string | null; name?: string | null }[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getDashboardSessionSecret() {
  return process.env.HERMES_DASHBOARD_SESSION_SECRET ?? "m2w-dashboard-dev-session-secret";
}

async function readDashboardSession() {
  const cookieStore = await cookies();
  return parseSignedDashboardSession(cookieStore.get(dashboardSessionCookieName)?.value, getDashboardSessionSecret());
}

function mapAppointmentRow(row: AppointmentRelationRow): CalendarBoardAppointment | null {
  const staff = firstRelation(row.staff_members);
  if (!staff?.slug) return null;
  const service = firstRelation(row.services);
  return {
    id: row.id,
    staffSlug: staff.slug,
    serviceName: service?.name || "Blocked / manual time",
    clientName: row.customer_name,
    clientPhone: row.customer_phone,
    clientEmail: row.customer_email,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    status: row.status,
    source: service?.slug ? "website" : "manual",
    notes: row.notes,
    internalNotes: row.internal_notes,
  };
}

async function loadCalendarAppointments() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallbackCalendarAppointments;

  const { data, error } = await supabase
    .from("appointments")
    .select("id, customer_name, customer_phone, customer_email, starts_at, ends_at, status, notes, internal_notes, staff_members(slug), services(slug, name)")
    .order("starts_at", { ascending: true })
    .limit(120);

  if (error) return fallbackCalendarAppointments;
  const mapped = ((data ?? []) as AppointmentRelationRow[]).map(mapAppointmentRow).filter((row): row is CalendarBoardAppointment => Boolean(row));
  return mapped.length > 0 ? mapped : fallbackCalendarAppointments;
}

export default async function StaffCalendarPage({ params }: { params: Promise<{ staffSlug: string }> }) {
  const { staffSlug } = await params;
  const session = await readDashboardSession();
  if (!session) redirect("/login");

  const mergedStaffMembers = mergeStaffProfileOverrides(staffMembers, await readStaffProfileOverrides());
  const staff = mergedStaffMembers.find((item) => item.slug === staffSlug && !item.isMascot);
  if (!staff) redirect("/dashboard");

  if (!canEditOwnedAppointment(session, { staffSlug })) redirect("/dashboard");

  const board = buildCalendarBoard({ session, staffMembers: mergedStaffMembers, appointments: await loadCalendarAppointments() });
  const lane = board.visibleLanes.find((item) => item.staffSlug === staffSlug);
  const dayView = buildCalendarDayView(lane?.appointments ?? []);
  const category = serviceCategories.find((item) => staff.serviceCategorySlugs.includes(item.slug));

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <Link href="/dashboard#calendar-board" className="rounded-full border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white/70 transition hover:bg-white hover:text-black">
          ← Back to all calendars
        </Link>
        <div className="mt-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <SectionEyebrow color={staff.calendarColor}>Staff calendar</SectionEyebrow>
            <h1 className="brand-display max-w-4xl text-5xl font-black uppercase md:text-7xl">{staff.name}</h1>
            <p className="mt-3 text-xl font-bold text-white/65">{staff.title}</p>
            <p className="mt-5 max-w-3xl text-sm leading-6 text-white/60">
              This is the focused calendar view for {staff.name}. Use the main dashboard board to add blocked time or change appointment status.
            </p>
          </div>
          <span className="rounded-full px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black" style={{ background: staff.calendarColor }}>
            {lane?.appointments.length ?? 0} appointments
          </span>
        </div>

        <article className="mt-8 overflow-hidden rounded-[2rem] border bg-black/70" style={{ borderColor: `${staff.calendarColor}88`, boxShadow: `0 0 65px ${staff.calendarColor}22` }}>
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: category?.accent ?? staff.calendarColor }}>
                {category?.name ?? "Calendar"} schedule
              </p>
              <h2 className="brand-display mt-2 text-3xl font-black uppercase text-white md:text-5xl">Day calendar</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-white/55">
              Appointments are plotted by time so the lane reads like a real calendar instead of a stacked list.
            </p>
          </div>

          {!lane || lane.appointments.length === 0 ? (
            <div className="m-6 rounded-3xl border border-dashed border-white/15 bg-black/40 p-8 text-white/60">No appointments or blocked time are on this staff calendar yet.</div>
          ) : (
            <div className="space-y-8 p-4 md:p-6">
              {dayView.days.map((day) => (
                <section key={day.dateKey} className="overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.03]">
                  <div className="flex flex-col justify-between gap-2 border-b border-white/10 bg-white/[0.04] px-5 py-4 md:flex-row md:items-center">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-white/40">{day.dateKey}</p>
                      <h3 className="brand-display text-3xl font-black uppercase text-white">{day.heading}</h3>
                    </div>
                    <span className="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black" style={{ background: staff.calendarColor }}>
                      {day.subheading}
                    </span>
                  </div>

                  <div className="grid grid-cols-[4.5rem_1fr] md:grid-cols-[6rem_1fr]">
                    <div className="border-r border-white/10 bg-black/35">
                      {day.slots.map((slot) => (
                        <div key={slot.hour} className="h-[5.25rem] border-b border-white/10 px-3 pt-2 text-right text-[0.68rem] font-black uppercase tracking-[0.12em] text-white/35 md:px-4">
                          {slot.label}
                        </div>
                      ))}
                    </div>
                    <div className="relative min-h-[24rem] bg-[linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:100%_5.25rem]" style={{ height: `${day.heightRem}rem` }}>
                      {day.events.map((event) => (
                        <div
                          key={event.appointment.id}
                          className={`absolute left-3 right-3 overflow-hidden rounded-2xl border p-4 shadow-2xl md:left-5 md:right-5 ${calendarEventClassName(event)}`}
                          style={{ top: `${event.topRem}rem`, height: `${event.heightRem}rem` }}
                        >
                          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-black/40 px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.16em] text-white">{event.appointment.statusLabel}</span>
                                <span className="rounded-full border border-white/20 px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.16em] text-white/70">{event.appointment.source}</span>
                                <span className="rounded-full border border-white/20 px-3 py-1 text-[0.6rem] font-black uppercase tracking-[0.16em] text-white/70">{event.durationLabel}</span>
                              </div>
                              <h4 className="mt-3 truncate text-xl font-black leading-tight text-white md:text-2xl">{event.appointment.clientName}</h4>
                              <p className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-white/70 md:text-base">{event.appointment.serviceName}</p>
                            </div>
                            <div className="shrink-0 rounded-2xl bg-black/35 px-4 py-3 text-left md:text-right">
                              <p className="text-sm font-black text-white">{event.startLabel}</p>
                              <p className="text-xs font-bold text-white/55">to {event.endLabel}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          )}
        </article>
      </section>
    </PageShell>
  );
}

function calendarEventClassName(event: CalendarDayEvent) {
  if (event.tone === "confirmed") return "border-lime-200/45 bg-lime-300/18 shadow-lime-400/10";
  if (event.tone === "requested") return "border-yellow-200/45 bg-yellow-300/18 shadow-yellow-400/10";
  if (event.tone === "blocked") return "border-purple-200/35 bg-purple-300/14 shadow-purple-400/10";
  if (event.tone === "completed") return "border-cyan-200/40 bg-cyan-300/14 shadow-cyan-400/10";
  return "border-white/15 bg-white/8 opacity-70";
}
