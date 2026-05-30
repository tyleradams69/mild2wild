import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Link from "next/link";
import { PageShell, SectionEyebrow } from "@/components/site";
import { dashboardSessionCookieName, parseSignedDashboardSession } from "@/lib/auth-session";
import { buildCalendarBoard, buildCalendarDayView, calendarActionStatuses, formatDateTimeInputInNewYork, normalizeCalendarStatus, type CalendarDayEvent, type CalendarBoardAppointment } from "@/lib/calendar-board";
import { canEditOwnedAppointment, detectOwnedCalendarConflicts, parseCalendarLocalDateTimeInput, type OwnedCalendarAppointment } from "@/lib/owned-calendar-system";
import { readStoredStaffMembers } from "@/lib/staff-profile-overrides";
import { serviceCategories, services, staffMembers } from "@/lib/studio-data";
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
  source?: string | null;
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

type SupabaseServerClient = NonNullable<ReturnType<typeof createSupabaseServerClient>>;

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
    source: row.source === "booksy" || row.source === "manual" || row.source === "website" ? row.source : service?.slug ? "website" : "manual",
    notes: row.notes,
    internalNotes: row.internal_notes,
  };
}

function toOwnedCalendarAppointment(appointment: CalendarBoardAppointment): OwnedCalendarAppointment {
  const normalizedStatus = normalizeCalendarStatus(appointment.status) ?? (appointment.status === "no_show" ? "no_show" : "requested");
  return {
    id: appointment.id,
    staffSlug: appointment.staffSlug,
    clientName: appointment.clientName,
    clientPhone: appointment.clientPhone,
    clientEmail: appointment.clientEmail,
    serviceName: appointment.serviceName,
    startsAt: appointment.startsAt,
    endsAt: appointment.endsAt,
    status: normalizedStatus,
    source: appointment.source === "booksy" || appointment.source === "manual" ? appointment.source : "website",
    notes: appointment.notes,
  };
}

async function resolveServiceForAppointment(supabase: SupabaseServerClient, serviceSlug: string) {
  if (!serviceSlug) return { serviceId: null, serviceName: "Blocked / manual time" };
  const fallbackService = services.find((service) => service.slug === serviceSlug);
  const { data } = await supabase.from("services").select("id, name").eq("slug", serviceSlug).single();
  const serviceRow = data as { id?: string | null; name?: string | null } | null;
  return { serviceId: serviceRow?.id ?? null, serviceName: serviceRow?.name ?? fallbackService?.name ?? "Manual appointment" };
}

async function loadCalendarAppointments() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallbackCalendarAppointments;

  const { data, error } = await supabase
    .from("appointments")
    .select("id, customer_name, customer_phone, customer_email, starts_at, ends_at, status, source, notes, internal_notes, staff_members(slug), services(slug, name)")
    .order("starts_at", { ascending: true })
    .limit(120);

  if (error) return fallbackCalendarAppointments;
  const mapped = ((data ?? []) as AppointmentRelationRow[]).map(mapAppointmentRow).filter((row): row is CalendarBoardAppointment => Boolean(row));
  return mapped.length > 0 ? mapped : fallbackCalendarAppointments;
}

async function createFocusedCalendarAppointmentAction(formData: FormData) {
  "use server";

  const session = await readDashboardSession();
  if (!session) redirect("/login");

  const targetStaffSlug = String(formData.get("targetStaffSlug") ?? "").trim();
  const currentCalendarSlug = String(formData.get("currentCalendarSlug") ?? "").trim();
  const startsAtInput = String(formData.get("startsAt") ?? "").trim();
  const durationMinutes = Number.parseInt(String(formData.get("durationMinutes") ?? "60"), 10);
  const startsAt = parseCalendarLocalDateTimeInput(startsAtInput);
  if (!targetStaffSlug || !startsAt || !Number.isFinite(durationMinutes) || durationMinutes < 15) return;
  if (!canEditOwnedAppointment(session, { staffSlug: targetStaffSlug })) return;

  const currentStaffMembers = await readStoredStaffMembers(staffMembers);
  const targetStaff = currentStaffMembers.find((item) => item.slug === targetStaffSlug && !item.isMascot);
  if (!targetStaff) return;

  const serviceSlug = String(formData.get("serviceSlug") ?? "").trim();
  if (serviceSlug && !targetStaff.serviceSlugs.includes(serviceSlug)) return;

  const endsAtDate = new Date(startsAt);
  endsAtDate.setUTCMinutes(endsAtDate.getUTCMinutes() + durationMinutes);
  const endsAt = endsAtDate.toISOString();
  const allowConflict = formData.get("allowConflict") === "on";
  const existingAppointments = await loadCalendarAppointments();
  const conflicts = detectOwnedCalendarConflicts({ staffSlug: targetStaffSlug, startsAt, endsAt }, existingAppointments.map(toOwnedCalendarAppointment));
  if (conflicts.length > 0 && !allowConflict) return;

  const supabase = createSupabaseServerClient();
  if (!supabase) return;
  const { data: staffRow } = await supabase.from("staff_members").select("id").eq("slug", targetStaffSlug).single();
  const staffId = (staffRow as { id?: string } | null)?.id;
  if (!staffId) return;

  const { serviceId, serviceName } = await resolveServiceForAppointment(supabase, serviceSlug);
  const clientName = String(formData.get("clientName") ?? "").trim() || (serviceId ? "Client name needed" : "Blocked time");
  const clientPhone = String(formData.get("clientPhone") ?? "").trim();
  const clientEmail = String(formData.get("clientEmail") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const internalNotes = String(formData.get("internalNotes") ?? "").trim();

  await supabase.from("appointments").insert({
    staff_id: staffId,
    service_id: serviceId,
    service_name: serviceName,
    source: "manual",
    customer_name: clientName,
    customer_phone: clientPhone || null,
    customer_email: clientEmail || null,
    starts_at: startsAt,
    ends_at: endsAt,
    status: serviceId ? "confirmed" : "blocked",
    notes: notes || (serviceId ? null : "Blocked from dashboard."),
    internal_notes: internalNotes || notes || null,
  });

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/calendar/${targetStaffSlug}`);
  if (currentCalendarSlug && currentCalendarSlug !== targetStaffSlug) revalidatePath(`/dashboard/calendar/${currentCalendarSlug}`);
}

async function updateFocusedAppointmentAction(formData: FormData) {
  "use server";

  const session = await readDashboardSession();
  if (!session) redirect("/login");
  const appointmentId = String(formData.get("appointmentId") ?? "").trim();
  const action = String(formData.get("action") ?? "update");
  if (!appointmentId) return;

  const supabase = createSupabaseServerClient();
  if (!supabase) return;
  const { data } = await supabase.from("appointments").select("id, starts_at, ends_at, staff_members(slug)").eq("id", appointmentId).single();
  const existingAppointment = data as { starts_at?: string | null; ends_at?: string | null; staff_members?: { slug?: string | null } | { slug?: string | null }[] | null } | null;
  const staffSlug = firstRelation(existingAppointment?.staff_members)?.slug;
  if (!staffSlug || !canEditOwnedAppointment(session, { staffSlug })) return;

  if (action === "delete") {
    await supabase.from("appointments").delete().eq("id", appointmentId);
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/calendar/${staffSlug}`);
    return;
  }

  const status = normalizeCalendarStatus(formData.get("status"));
  const startsAtInput = String(formData.get("startsAt") ?? "").trim();
  const durationMinutes = Number.parseInt(String(formData.get("durationMinutes") ?? "60"), 10);
  const startsAt = startsAtInput ? parseCalendarLocalDateTimeInput(startsAtInput) : existingAppointment?.starts_at;
  if (!status || !startsAt || !Number.isFinite(durationMinutes) || durationMinutes < 15) return;

  const endsAtDate = new Date(startsAt);
  endsAtDate.setUTCMinutes(endsAtDate.getUTCMinutes() + durationMinutes);
  const endsAt = endsAtDate.toISOString();
  const allowConflict = formData.get("allowConflict") === "on";
  const existingAppointments = await loadCalendarAppointments();
  const conflicts = detectOwnedCalendarConflicts({ staffSlug, startsAt, endsAt, ignoreAppointmentId: appointmentId }, existingAppointments.map(toOwnedCalendarAppointment));
  if (conflicts.length > 0 && !allowConflict) return;

  const serviceSlug = String(formData.get("serviceSlug") ?? "").trim();
  const { serviceId, serviceName } = await resolveServiceForAppointment(supabase, serviceSlug);
  const clientName = String(formData.get("clientName") ?? "").trim() || (serviceId ? "Client name needed" : "Blocked time");
  const clientPhone = String(formData.get("clientPhone") ?? "").trim();
  const clientEmail = String(formData.get("clientEmail") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const internalNotes = String(formData.get("internalNotes") ?? "").trim();

  await supabase.from("appointments").update({
    service_id: serviceId,
    service_name: serviceName,
    customer_name: clientName,
    customer_phone: clientPhone || null,
    customer_email: clientEmail || null,
    starts_at: startsAt,
    ends_at: endsAt,
    status,
    source: "manual",
    notes: notes || null,
    internal_notes: internalNotes || null,
    updated_at: new Date().toISOString(),
  }).eq("id", appointmentId);

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/calendar/${staffSlug}`);
}

export default async function StaffCalendarPage({ params }: { params: Promise<{ staffSlug: string }> }) {
  const { staffSlug } = await params;
  const session = await readDashboardSession();
  if (!session) redirect("/login");

  const mergedStaffMembers = await readStoredStaffMembers(staffMembers);
  const staff = mergedStaffMembers.find((item) => item.slug === staffSlug && !item.isMascot);
  if (!staff) redirect("/dashboard");

  if (!canEditOwnedAppointment(session, { staffSlug })) redirect("/dashboard");

  const board = buildCalendarBoard({ session, staffMembers: mergedStaffMembers, appointments: await loadCalendarAppointments() });
  const lane = board.visibleLanes.find((item) => item.staffSlug === staffSlug);
  const dayView = buildCalendarDayView(lane?.appointments ?? []);
  const category = serviceCategories.find((item) => staff.serviceCategorySlugs.includes(item.slug));
  const laneServices = services.filter((service) => staff.serviceCategorySlugs.includes(service.categorySlug));
  const editableStaffMembers = mergedStaffMembers.filter((item) => !item.isMascot && canEditOwnedAppointment(session, { staffSlug: item.slug }));
  const addableServices = session.role === "owner" ? services : laneServices;

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
              This is the focused calendar view for {staff.name}. Use the manager below the day calendar to edit, reschedule, or remove appointments in this lane.
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

        {lane?.canEdit ? (
          <article className="mt-8 rounded-[2rem] border bg-black/70 p-5 md:p-6" style={{ borderColor: `${staff.calendarColor}66`, boxShadow: `0 0 50px ${staff.calendarColor}18` }}>
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: category?.accent ?? staff.calendarColor }}>Add to calendar</p>
                <h2 className="brand-display mt-2 text-3xl font-black uppercase text-white md:text-5xl">
                  {session.role === "owner" ? "Add to any staff calendar" : `Add to ${staff.name}'s calendar`}
                </h2>
              </div>
              <span className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/60">
                {session.role === "owner" ? "Owner add access" : "Scoped add access"}
              </span>
            </div>
            <form action={createFocusedCalendarAppointmentAction} className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <input type="hidden" name="currentCalendarSlug" value={staffSlug} />
              <div className="grid gap-3 md:grid-cols-2">
                <span className="relative min-w-0">
                  <select name="targetStaffSlug" defaultValue={staffSlug} className="w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-black py-2 pl-3 pr-12 text-sm text-white outline-none focus:border-cyan-300">
                    {editableStaffMembers.map((item) => <option key={item.slug} value={item.slug}>{item.name} — {item.title}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-lg leading-none text-white/90">⌄</span>
                </span>
                <span className="relative min-w-0">
                  <select name="serviceSlug" defaultValue="" className="w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-black py-2 pl-3 pr-12 text-sm text-white outline-none focus:border-cyan-300">
                    <option value="">Blocked / unavailable time</option>
                    {addableServices.map((service) => <option key={service.slug} value={service.slug}>{service.name}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-lg leading-none text-white/90">⌄</span>
                </span>
                <input name="clientName" placeholder="Client name (leave blank for blocked time)" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300" />
                <input name="startsAt" type="datetime-local" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-cyan-300" required />
                <input name="clientPhone" placeholder="Phone" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300" />
                <input name="clientEmail" type="email" placeholder="Email" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300" />
                <span className="relative min-w-0">
                  <select name="durationMinutes" defaultValue="60" className="w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-black py-2 pl-3 pr-12 text-sm text-white outline-none focus:border-cyan-300">
                    {[15, 30, 45, 60, 75, 90, 120, 180].map((minutes) => <option key={minutes} value={minutes}>{minutes}m</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-lg leading-none text-white/90">⌄</span>
                </span>
                <label className="flex items-start gap-2 text-xs font-bold leading-5 text-white/45">
                  <input name="allowConflict" type="checkbox" className="mt-1 accent-cyan-300" />
                  Allow overlap if intentional.
                </label>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <input name="notes" placeholder="Client/request note or blocked-time reason" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300" />
                <input name="internalNotes" placeholder="Private staff/admin note" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300" />
              </div>
              <button type="submit" className="mt-4 rounded-full bg-cyan-200 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white">Add appointment / block</button>
              {session.role === "owner" ? <p className="mt-3 text-xs leading-5 text-white/45">For appointments, choose a service that belongs to the selected staff member. Blocked time can go on any calendar.</p> : null}
            </form>
          </article>
        ) : null}

        {lane && lane.canEdit && lane.appointments.length > 0 ? (
          <article className="mt-8 rounded-[2rem] border bg-black/70 p-5 md:p-6" style={{ borderColor: `${staff.calendarColor}66`, boxShadow: `0 0 50px ${staff.calendarColor}18` }}>
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em]" style={{ color: category?.accent ?? staff.calendarColor }}>Appointment manager</p>
                <h2 className="brand-display mt-2 text-3xl font-black uppercase text-white md:text-5xl">Edit {staff.name}&apos;s calendar</h2>
              </div>
              <span className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/60">
                Save or remove rows below
              </span>
            </div>

            <div className="mt-6 max-h-[42rem] space-y-4 overflow-y-auto pr-2 [scrollbar-color:#4DDCE5_rgba(255,255,255,0.08)]">
              {lane.appointments.map((appointment) => (
                <form key={appointment.id} action={updateFocusedAppointmentAction} className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                  <input type="hidden" name="appointmentId" value={appointment.id} />
                  <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] ${appointment.statusTone}`}>{appointment.statusLabel}</span>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-white/55">{appointment.source}</span>
                      </div>
                      <h3 className="mt-3 truncate text-xl font-black text-white">{appointment.clientName}</h3>
                      <p className="mt-1 text-sm text-white/55">{appointment.dateLabel} · {appointment.timeRange}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button name="action" value="update" type="submit" className="rounded-full bg-pink-300 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white">Save changes</button>
                      <button name="action" value="delete" type="submit" className="rounded-full border border-red-200/45 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-red-100 transition hover:bg-red-200 hover:text-black">Remove</button>
                    </div>
                  </div>

                  <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2">
                    <span className="relative min-w-0">
                      <select name="status" defaultValue={appointment.status} className="w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-black py-2 pl-3 pr-12 text-sm text-white outline-none focus:border-pink-300">
                        {calendarActionStatuses.map((status) => (
                          <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-lg leading-none text-white/90">⌄</span>
                    </span>
                    <span className="relative min-w-0">
                      <select name="serviceSlug" defaultValue={laneServices.find((service) => service.name === appointment.serviceName)?.slug ?? ""} className="w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-black py-2 pl-3 pr-12 text-sm text-white outline-none focus:border-pink-300">
                        <option value="">Blocked / manual time</option>
                        {laneServices.map((service) => <option key={service.slug} value={service.slug}>{service.name}</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-lg leading-none text-white/90">⌄</span>
                    </span>
                    <input name="clientName" defaultValue={appointment.clientName} placeholder="Client name" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-pink-300" />
                    <input name="startsAt" type="datetime-local" defaultValue={formatDateTimeInputInNewYork(appointment.startsAt)} className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-pink-300" required />
                    <input name="clientPhone" defaultValue={appointment.clientPhone ?? ""} placeholder="Phone" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-pink-300" />
                    <input name="clientEmail" type="email" defaultValue={appointment.clientEmail ?? ""} placeholder="Email" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-pink-300" />
                    <span className="relative min-w-0">
                      <select name="durationMinutes" defaultValue={String(getAppointmentDurationMinutes(appointment.startsAt, appointment.endsAt))} className="w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-black py-2 pl-3 pr-12 text-sm text-white outline-none focus:border-pink-300">
                        {appointmentDurationOptions(appointment.startsAt, appointment.endsAt).map((minutes) => <option key={minutes} value={minutes}>{minutes}m</option>)}
                      </select>
                      <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-lg leading-none text-white/90">⌄</span>
                    </span>
                    <label className="flex items-start gap-2 text-xs font-bold leading-5 text-white/45">
                      <input name="allowConflict" type="checkbox" className="mt-1 accent-pink-300" />
                      Allow overlap if intentional.
                    </label>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <input name="notes" defaultValue={appointment.notes ?? ""} placeholder="Client/request note" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-pink-300" />
                    <input name="internalNotes" defaultValue={appointment.internalNotes ?? ""} placeholder="Private staff/admin note" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-pink-300" />
                  </div>
                </form>
              ))}
            </div>
          </article>
        ) : null}
      </section>
    </PageShell>
  );
}

function getAppointmentDurationMinutes(startsAt: string, endsAt: string) {
  const startTime = new Date(startsAt).getTime();
  const endTime = new Date(endsAt).getTime();
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || endTime <= startTime) return 60;
  return Math.round((endTime - startTime) / 60_000);
}

function appointmentDurationOptions(startsAt: string, endsAt: string) {
  const duration = getAppointmentDurationMinutes(startsAt, endsAt);
  return Array.from(new Set([15, 30, 45, 60, 75, 90, 120, 180, duration])).sort((left, right) => left - right);
}

function calendarEventClassName(event: CalendarDayEvent) {
  if (event.tone === "confirmed") return "border-lime-200/45 bg-lime-300/18 shadow-lime-400/10";
  if (event.tone === "requested") return "border-yellow-200/45 bg-yellow-300/18 shadow-yellow-400/10";
  if (event.tone === "blocked") return "border-purple-200/35 bg-purple-300/14 shadow-purple-400/10";
  if (event.tone === "completed") return "border-cyan-200/40 bg-cyan-300/14 shadow-cyan-400/10";
  return "border-white/15 bg-white/8 opacity-70";
}
