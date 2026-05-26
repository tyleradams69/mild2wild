import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageShell, SectionEyebrow } from "@/components/site";
import { dashboardSessionCookieName, parseSignedDashboardSession } from "@/lib/auth-session";
import { buildCalendarBoard, type CalendarBoardAppointment } from "@/lib/calendar-board";
import { canEditOwnedAppointment } from "@/lib/owned-calendar-system";
import { mergeStaffProfileOverrides, readStaffProfileOverrides } from "@/lib/staff-profile-overrides";
import { serviceCategories, staffMembers } from "@/lib/studio-data";
import { createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const demoCalendarAppointments: CalendarBoardAppointment[] = [
  {
    id: "demo-booking-1",
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
    id: "demo-calendar-2",
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
  if (!supabase) return demoCalendarAppointments;

  const { data, error } = await supabase
    .from("appointments")
    .select("id, customer_name, customer_phone, customer_email, starts_at, ends_at, status, notes, internal_notes, staff_members(slug), services(slug, name)")
    .order("starts_at", { ascending: true })
    .limit(120);

  if (error) return demoCalendarAppointments;
  const mapped = ((data ?? []) as AppointmentRelationRow[]).map(mapAppointmentRow).filter((row): row is CalendarBoardAppointment => Boolean(row));
  return mapped.length > 0 ? mapped : demoCalendarAppointments;
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

        <article className="mt-8 rounded-[2rem] border bg-black/70 p-6" style={{ borderColor: `${staff.calendarColor}88`, boxShadow: `0 0 65px ${staff.calendarColor}22` }}>
          <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: category?.accent ?? staff.calendarColor }}>
            {category?.name ?? "Calendar"}
          </p>
          <div className="mt-5 space-y-4">
            {!lane || lane.appointments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-black/40 p-8 text-white/60">No appointments or blocked time are on this staff calendar yet.</div>
            ) : lane.appointments.map((appointment) => (
              <div key={appointment.id} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] ${appointment.statusTone}`}>{appointment.statusLabel}</span>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-white/55">{appointment.source}</span>
                </div>
                <h2 className="mt-4 text-2xl font-black text-white">{appointment.clientName}</h2>
                <p className="mt-1 text-white/60">{appointment.serviceName}</p>
                <p className="mt-4 text-sm font-black text-white">{appointment.dateLabel} · {appointment.timeRange}</p>
                <p className="mt-1 text-sm text-white/45">{appointment.contactLabel}</p>
                {appointment.notes ? <p className="mt-4 text-sm leading-6 text-white/65">{appointment.notes}</p> : null}
                {appointment.internalNotes ? <p className="mt-3 rounded-2xl border border-purple-200/20 bg-purple-200/10 p-4 text-sm leading-6 text-white/70">Internal note: {appointment.internalNotes}</p> : null}
              </div>
            ))}
          </div>
        </article>
      </section>
    </PageShell>
  );
}
