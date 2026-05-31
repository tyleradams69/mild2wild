import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { PageShell, SectionEyebrow } from "@/components/site";
import { dashboardSessionCookieName, parseSignedDashboardSession } from "@/lib/auth-session";
import { buildCalendarBoard, calendarActionStatuses, formatDateTimeInputInNewYork, normalizeCalendarStatus, type CalendarBoardAppointment } from "@/lib/calendar-board";
import { buildCalendarDashboardModel } from "@/lib/calendar-access";
import { buildDashboardLeadInbox, buildProfileEditorModel } from "@/lib/dashboard-workspace";
import { canEditOwnedAppointment, detectOwnedCalendarConflicts, parseCalendarLocalDateTimeInput, type OwnedCalendarAppointment } from "@/lib/owned-calendar-system";
import { serviceCategories, staffMembers } from "@/lib/studio-data";
import { services } from "@/lib/studio-data";
import {
  normalizeStaffProfileCreation,
  readStoredStaffMembers,
  writeStaffProfileCreation,
} from "@/lib/staff-profile-overrides";
import { createSupabaseServerClient } from "@/lib/supabase";

function getDashboardSessionSecret() {
  return process.env.HERMES_DASHBOARD_SESSION_SECRET ?? "m2w-dashboard-dev-session-secret";
}

async function readDashboardSession() {
  const cookieStore = await cookies();
  return parseSignedDashboardSession(cookieStore.get(dashboardSessionCookieName)?.value, getDashboardSessionSecret());
}

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
  staff_members?: { slug?: string | null; name?: string | null; title?: string | null; calendar_color?: string | null } | { slug?: string | null; name?: string | null; title?: string | null; calendar_color?: string | null }[] | null;
  services?: { slug?: string | null; name?: string | null } | { slug?: string | null; name?: string | null }[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

type SupabaseServerClient = NonNullable<ReturnType<typeof createSupabaseServerClient>>;

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

async function loadCalendarAppointments() {
  const supabase = createSupabaseServerClient();
  if (!supabase) return fallbackCalendarAppointments;

  const { data, error } = await supabase
    .from("appointments")
    .select("id, customer_name, customer_phone, customer_email, starts_at, ends_at, status, source, notes, internal_notes, staff_members(slug, name, title, calendar_color), services(slug, name)")
    .order("starts_at", { ascending: true })
    .limit(80);

  if (error) return fallbackCalendarAppointments;
  const mapped = ((data ?? []) as AppointmentRelationRow[]).map(mapAppointmentRow).filter((row): row is CalendarBoardAppointment => Boolean(row));
  return mapped.length > 0 ? mapped : fallbackCalendarAppointments;
}

async function updateAppointmentAction(formData: FormData) {
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

async function createCalendarAppointmentAction(formData: FormData) {
  "use server";

  const session = await readDashboardSession();
  if (!session) redirect("/login");
  const staffSlug = String(formData.get("staffSlug") ?? "").trim();
  const startsAtInput = String(formData.get("startsAt") ?? "").trim();
  const durationMinutes = Number.parseInt(String(formData.get("durationMinutes") ?? "60"), 10);
  const startsAt = parseCalendarLocalDateTimeInput(startsAtInput);
  if (!staffSlug || !startsAt || !Number.isFinite(durationMinutes) || durationMinutes < 15) return;
  if (!canEditOwnedAppointment(session, { staffSlug })) return;

  const endsAt = new Date(startsAt);
  endsAt.setUTCMinutes(endsAt.getUTCMinutes() + durationMinutes);
  const allowConflict = formData.get("allowConflict") === "on";
  const existingAppointments = await loadCalendarAppointments();
  const conflicts = detectOwnedCalendarConflicts({ staffSlug, startsAt, endsAt: endsAt.toISOString() }, existingAppointments.map(toOwnedCalendarAppointment));
  if (conflicts.length > 0 && !allowConflict) return;

  const supabase = createSupabaseServerClient();
  if (!supabase) return;
  const { data: staffRow } = await supabase.from("staff_members").select("id").eq("slug", staffSlug).single();
  const staffId = (staffRow as { id?: string } | null)?.id;
  if (!staffId) return;

  const serviceSlug = String(formData.get("serviceSlug") ?? "").trim();
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
    ends_at: endsAt.toISOString(),
    status: serviceId ? "confirmed" : "blocked",
    notes: notes || (serviceId ? null : "Blocked from dashboard."),
    internal_notes: internalNotes || notes || null,
  });
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/calendar/${staffSlug}`);
}

async function logoutAction() {
  "use server";

  const cookieStore = await cookies();
  cookieStore.delete(dashboardSessionCookieName);
  redirect("/login");
}

async function createStaffProfileAction(formData: FormData) {
  "use server";

  const session = await readDashboardSession();
  if (!session) redirect("/login");
  if (session.role !== "owner") return;

  const currentStaffMembers = await readStoredStaffMembers(staffMembers);
  const normalized = normalizeStaffProfileCreation(
    {
      name: formData.get("name"),
      title: formData.get("title"),
      bio: formData.get("bio"),
      categorySlug: formData.get("categorySlug"),
      photoUrl: formData.get("photoUrl"),
      calendarColor: formData.get("calendarColor"),
      instagramUrl: formData.get("instagramUrl"),
      tiktokUrl: formData.get("tiktokUrl"),
      galleryNotes: formData.get("galleryNotes"),
      portfolioImages: [],
    },
    currentStaffMembers,
  );

  if (!normalized.ok) redirect("/dashboard?createStaff=invalid#profile-controls");
  await writeStaffProfileCreation(normalized.value);
  revalidatePath("/dashboard");
  revalidatePath("/staff");
  revalidatePath(`/staff/${normalized.value.slug}`);
  redirect(`/dashboard/staff/${normalized.value.slug}/edit?saved=1`);
}

export default async function DashboardPage() {
  const session = await readDashboardSession();

  if (!session) {
    redirect("/login");
  }

  const [mergedStaffMembers, calendarAppointments] = await Promise.all([
    readStoredStaffMembers(staffMembers),
    loadCalendarAppointments(),
  ]);
  const bookableStaffMembers = mergedStaffMembers.filter((staff) => !staff.isMascot);
  const dashboardModel = buildCalendarDashboardModel(session, bookableStaffMembers);
  const calendarBoard = buildCalendarBoard({ session, staffMembers: mergedStaffMembers, appointments: calendarAppointments });
  const profileEditorModel = buildProfileEditorModel(session, mergedStaffMembers, services);
  const leadInbox = buildDashboardLeadInbox({
    session,
    staffMembers: mergedStaffMembers,
    services,
    appointments: calendarAppointments.map((appointment) => ({
      id: appointment.id,
      customer_name: appointment.clientName,
      customer_phone: appointment.clientPhone,
      customer_email: appointment.clientEmail,
      service_name: appointment.serviceName,
      staff_slug: appointment.staffSlug,
      starts_at: appointment.startsAt,
      status: appointment.status,
      lead_status: appointment.status === "requested" ? "new" : "contacted",
      internal_notes: appointment.internalNotes,
      notes: appointment.notes,
    })),
  });
  const identityChipLabel = dashboardModel.canManageAllCalendars ? "Owner Admin" : (dashboardModel.profileAvatar?.title ?? dashboardModel.sessionLabel);
  const primaryCalendarSlug =
    session.staffSlug && dashboardModel.editableCalendarSlugs.includes(session.staffSlug)
      ? session.staffSlug
      : dashboardModel.editableCalendarSlugs[0] ?? dashboardModel.visibleCalendars[0]?.staffSlug;
  const primaryCalendarHref = primaryCalendarSlug ? `/dashboard/calendar/${primaryCalendarSlug}` : "#calendar-board";
  const primaryCalendarLabel = dashboardModel.canManageAllCalendars ? "Open Caitlin's calendar" : "Open my calendar";
  return (
    <PageShell>
      <div className="fixed inset-x-4 bottom-5 z-50 mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-3 rounded-[2rem] border border-cyan-200/40 bg-black/90 p-3 shadow-2xl shadow-cyan-400/25 backdrop-blur md:bottom-8">
        <Link href="#calendar-board" className="rounded-full bg-cyan-200 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white sm:text-sm">
          Open all calendars ↓
        </Link>
        <Link href={primaryCalendarHref} className="rounded-full bg-purple-300 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white sm:text-sm">
          {primaryCalendarLabel} →
        </Link>
      </div>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <SectionEyebrow color="#A95CFF">Admin + staff portal</SectionEyebrow>
            <h1 className="brand-display max-w-5xl text-5xl font-black uppercase md:text-7xl">Calendar buttons are live.</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
              Signed sessions now separate owner/admin access from individual employee logins. The owner can manage every calendar; employees can only edit their own schedule lane.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="#calendar-board" className="rounded-full bg-cyan-200 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-black shadow-lg shadow-cyan-400/20 transition hover:scale-[1.02] hover:bg-white">
                Open all calendars ↓
              </Link>
              <Link href={primaryCalendarHref} className="rounded-full border border-white/15 px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-white/80 transition hover:bg-white hover:text-black">
                {primaryCalendarLabel} →
              </Link>
            </div>
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
                ? "Can manage all calendars, staff profiles, services, products, and booking requests."
                : "Can view the portal and only edit their own calendar, appointments, and block time."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="#calendar-board" className="rounded-full bg-cyan-200 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:bg-white">
                Open all calendars ↓
              </Link>
              <Link href={primaryCalendarHref} className="rounded-full border border-purple-200/45 bg-purple-300 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black transition hover:bg-white">
                {primaryCalendarLabel} →
              </Link>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {session.email ? <Metric label="Admin email" value={session.email} wide /> : null}
              <Metric label="Visible calendars" value={dashboardModel.visibleCalendars.length.toString()} />
              <Metric label="Editable calendars" value={dashboardModel.editableCalendarSlugs.length.toString()} />
              <Metric label="Permission" value={dashboardModel.canManageAllCalendars ? "Owner" : "Staff"} />
            </div>
          </article>

          <article className="neon-card rounded-[2rem] p-6" style={{ boxShadow: "0 0 70px #4DDCE522" }}>
            <SectionEyebrow color="#4DDCE5">Website booking flow</SectionEyebrow>
            <h2 className="brand-display text-3xl font-black uppercase">Booking requests route to the right calendar.</h2>
            <p className="mt-4 text-white/65">
              The site collects customer details, requested services, staff preference, and appointment notes through the website form. Those requests stay in the dashboard so Caitlin can follow up from the website workflow.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="neon-card rounded-[2rem] p-6" style={{ boxShadow: "0 0 70px #FFE45C22" }}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <SectionEyebrow color="#FFE45C">Lead inbox</SectionEyebrow>
              <h2 className="brand-display text-4xl font-black uppercase">Website booking requests.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                Public website booking requests land in one routed queue so Caitlin can see who needs a follow-up and which staff lane owns it.
              </p>
            </div>
            <span className="rounded-full bg-yellow-200 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">{leadInbox.length} open</span>
          </div>
          <div className="mt-6 space-y-3">
            {leadInbox.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-black/40 p-6 text-sm leading-6 text-white/58">
                No open requests for this login yet. New website booking requests will appear here when they are routed to this calendar lane.
              </div>
            ) : leadInbox.map((lead) => (
              <div key={lead.id} className="rounded-3xl border border-white/10 bg-black/50 p-4">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-black">{lead.source}</span>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-white/55">{lead.statusLabel}</span>
                      <span className={`rounded-full px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] ${lead.workflowTone}`}>{lead.workflowStatusLabel}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-black text-white">{lead.customerName}</h3>
                    <p className="mt-1 text-sm text-white/55">{lead.contact}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm font-black text-white">{lead.serviceLabel}</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-white/45">{lead.routedStaffName} · {lead.requestedFor}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/62">{lead.summary}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-lime-200/20 bg-lime-200/10 px-4 py-3 text-xs leading-5 text-lime-50">
                    <span className="block font-black uppercase tracking-[0.18em] text-lime-100">Next action</span>
                    <span className="mt-1 block text-white/70">{lead.nextAction}</span>
                  </div>
                  <div className="rounded-2xl border border-purple-200/20 bg-purple-200/10 px-4 py-3 text-xs leading-5 text-purple-50">
                    <span className="block font-black uppercase tracking-[0.18em] text-purple-100">Internal note</span>
                    <span className="mt-1 block whitespace-pre-line text-white/70">{lead.internalNote || "No internal note yet."}</span>
                  </div>
                </div>
                {lead.ownerAlertLabel ? (
                  <p className="mt-3 rounded-2xl border border-cyan-200/20 bg-cyan-200/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-cyan-100">
                    {lead.ownerAlertLabel}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </article>

        <article className="neon-card rounded-[2rem] p-6" style={{ boxShadow: "0 0 70px #FF4FD822" }}>
          <SectionEyebrow color="#FF4FD8">Profile controls</SectionEyebrow>
          <h2 className="brand-display text-4xl font-black uppercase">Meet-me pages ready to manage.</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">
            {profileEditorModel.canManageAllProfiles
              ? "Owner/admin can update every staff profile, create new hires from the same template, edit the dog profile, and control all colors, templates, bios, and portfolios."
              : "Staff accounts do not edit public profiles. Caitlin handles bios, portfolio uploads, colors, and templates from the admin account."}
          </p>
          {profileEditorModel.canManageAllProfiles ? (
            <form action={createStaffProfileAction} className="mt-6 rounded-[1.6rem] border border-pink-200/20 bg-white/[0.04] p-4">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-pink-100/60">New staff template</p>
                  <h3 className="brand-display mt-1 text-2xl font-black uppercase text-white">Create a profile</h3>
                </div>
                <button type="submit" className="rounded-full bg-pink-300 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white">
                  Create + edit
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-white/40">Display name</span>
                  <input name="name" required placeholder="New hire name" className="mt-1 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-pink-200/60" />
                </label>
                <label className="block">
                  <span className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-white/40">Title / role</span>
                  <input name="title" required placeholder="Nail Artist" className="mt-1 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-pink-200/60" />
                </label>
                <label className="block">
                  <span className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-white/40">Primary service category</span>
                  <select name="categorySlug" required defaultValue="nails" className="mt-1 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none focus:border-pink-200/60">
                    {serviceCategories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-white/40">Accent color</span>
                  <input name="calendarColor" placeholder="#F06BD6" className="mt-1 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-pink-200/60" />
                </label>
              </div>
              <label className="mt-3 block">
                <span className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-white/40">Bio</span>
                <textarea name="bio" required rows={4} placeholder="Paste the same kind of public bio Caitlin sends for existing staff." className="mt-1 w-full resize-y rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-pink-200/60" />
              </label>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-white/40">Photo path / URL</span>
                  <input name="photoUrl" placeholder="Optional; uses placeholder until art is ready" className="mt-1 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-pink-200/60" />
                </label>
                <label className="block">
                  <span className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-white/40">Portfolio notes</span>
                  <input name="galleryNotes" placeholder="One or two highlights, separated by lines later" className="mt-1 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-pink-200/60" />
                </label>
                <label className="block">
                  <span className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-white/40">Instagram URL / handle</span>
                  <input name="instagramUrl" className="mt-1 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-pink-200/60" />
                </label>
                <label className="block">
                  <span className="text-[0.66rem] font-black uppercase tracking-[0.18em] text-white/40">TikTok URL / handle</span>
                  <input name="tiktokUrl" className="mt-1 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-pink-200/60" />
                </label>
              </div>
              <p className="mt-3 text-xs font-bold leading-5 text-white/45">After creating, Caitlin lands on the regular profile editor to add portfolio showcase rows and polish the page.</p>
            </form>
          ) : null}
          <div className="mt-6 max-h-[34rem] space-y-3 overflow-y-auto pr-2 [scrollbar-color:#FF8AC8_rgba(255,255,255,0.08)]">
            {profileEditorModel.editableProfiles.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-black/40 p-5 text-sm leading-6 text-white/58">
                No profile editors are available for this login. Caitlin&apos;s admin account handles all bios, colors, templates, and portfolio uploads.
              </div>
            ) : profileEditorModel.editableProfiles.map((profile) => (
              <Link key={profile.slug} href={`/dashboard/staff/${profile.slug}/edit`} className="block rounded-3xl border border-white/10 bg-white/5 p-4 transition hover:border-white/30 hover:bg-white/10">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black text-white">{profile.name}</p>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.18em] text-white/45">{profile.title}</p>
                  </div>
                  <span className="rounded-full bg-pink-300 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.14em] text-black">Edit</span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/55">{profile.serviceNames.join(" · ")}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section id="calendar-board" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <SectionEyebrow color="#4DDCE5">Calendar board</SectionEyebrow>
            <h2 className="brand-display max-w-4xl text-4xl font-black uppercase md:text-6xl">
              {dashboardModel.canManageAllCalendars ? "Manage every staff calendar." : "Manage your own calendar lane."}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/60">
              Real appointment/request rows are grouped by staff. Editable lanes can update appointment status, save owner/staff notes, and block time without exposing another employee&apos;s calendar controls.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-cyan-200 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black">{calendarBoard.totalAppointments} appointments</span>
            {session.staffSlug ? (
              <Link href={`/staff/${session.staffSlug}`} className="rounded-full border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white/75 transition hover:bg-white hover:text-black">
                View my profile
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid items-start gap-5 xl:grid-cols-3">
          {calendarBoard.visibleLanes.map((lane) => {
            const staff = mergedStaffMembers.find((item) => item.slug === lane.staffSlug);
            const category = serviceCategories.find((item) => item.slug === staff?.serviceCategorySlugs[0]);
            const laneServices = services.filter((service) => staff?.serviceCategorySlugs.includes(service.categorySlug));
            return (
              <article
                key={lane.staffSlug}
                className="min-w-0 rounded-[1.8rem] border bg-black/70 p-5"
                style={{
                  borderColor: lane.canEdit ? `${lane.calendarColor}88` : "rgba(255,255,255,0.1)",
                  boxShadow: lane.canEdit ? `0 0 55px ${lane.calendarColor}24` : "none",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className="rounded-full px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-black"
                      style={{ background: lane.canEdit ? lane.calendarColor : "rgba(255,255,255,0.55)" }}
                    >
                      {lane.canEdit ? "Editable" : "Locked"}
                    </span>
                    <h3 className="brand-display mt-5 text-2xl font-black uppercase">{lane.staffName}</h3>
                    <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-white/45">{lane.staffTitle}</p>
                    <Link
                      href={lane.detailHref}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-black shadow-lg transition hover:scale-[1.02] hover:bg-white sm:w-auto"
                      style={{ background: lane.calendarColor, boxShadow: `0 0 30px ${lane.calendarColor}55` }}
                    >
                      Open calendar →
                    </Link>
                  </div>
                  <span className="text-xl">{lane.canEdit ? "✦" : "锁"}</span>
                </div>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.18em]" style={{ color: category?.accent ?? lane.calendarColor }}>
                  {category?.name ?? "Staff calendar"} · {lane.appointments.length} booked
                </p>

                {lane.canEdit ? (
                  <form action={createCalendarAppointmentAction} className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
                    <input type="hidden" name="staffSlug" value={lane.staffSlug} />
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Add appointment or block time</p>
                    <div className="mt-3 grid gap-3">
                      <span className="relative min-w-0">
                        <select name="serviceSlug" defaultValue="" className="w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-black py-2 pl-3 pr-12 text-sm text-white outline-none focus:border-cyan-300">
                          <option value="">Blocked / unavailable time</option>
                          {laneServices.map((service) => <option key={service.slug} value={service.slug}>{service.name}</option>)}
                        </select>
                        <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-lg leading-none text-white/90">⌄</span>
                      </span>
                      <input name="clientName" placeholder="Client name (leave blank for blocked time)" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300" />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input name="clientPhone" placeholder="Phone" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300" />
                        <input name="clientEmail" type="email" placeholder="Email" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300" />
                      </div>
                      <input name="startsAt" type="datetime-local" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-cyan-300" required />
                      <span className="relative min-w-0">
                        <select name="durationMinutes" defaultValue="60" className="w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-black py-2 pl-3 pr-12 text-sm text-white outline-none focus:border-cyan-300">
                          <option value="15">15m</option>
                          <option value="30">30m</option>
                          <option value="45">45m</option>
                          <option value="60">60m</option>
                          <option value="90">90m</option>
                          <option value="120">120m</option>
                          <option value="180">180m</option>
                        </select>
                        <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-lg leading-none text-white/90">⌄</span>
                      </span>
                    </div>
                    <input name="notes" placeholder="Client/request note or blocked-time reason" className="mt-3 w-full min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300" />
                    <input name="internalNotes" placeholder="Private staff/admin note" className="mt-3 w-full min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300" />
                    <label className="mt-3 flex items-start gap-2 text-xs font-bold leading-5 text-white/45">
                      <input name="allowConflict" type="checkbox" className="mt-1 accent-cyan-200" />
                      Allow overlap if this double-booking is intentional.
                    </label>
                    <button type="submit" className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-cyan-200">Add to calendar</button>
                  </form>
                ) : null}

                <div className="mt-5 max-h-[34rem] min-h-[18rem] space-y-3 overflow-y-auto pr-2 [scrollbar-color:#4DDCE5_rgba(255,255,255,0.08)]">
                  {lane.appointments.length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-white/15 bg-black/40 p-5 text-sm leading-6 text-white/55">No appointments in this lane yet.</div>
                  ) : lane.appointments.map((appointment) => (
                    <div key={appointment.id} className="min-w-0 rounded-3xl border border-white/10 bg-black/55 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] ${appointment.statusTone}`}>{appointment.statusLabel}</span>
                        <span className="rounded-full border border-white/10 px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-white/55">{appointment.source}</span>
                      </div>
                      <h4 className="mt-3 text-lg font-black text-white">{appointment.clientName}</h4>
                      <p className="mt-1 text-sm text-white/55">{appointment.serviceName}</p>
                      <p className="mt-3 text-sm font-black text-white">{appointment.dateLabel} · {appointment.timeRange}</p>
                      <p className="mt-1 text-xs text-white/45">{appointment.contactLabel}</p>
                      {appointment.notes ? <p className="mt-3 text-sm leading-6 text-white/60">{appointment.notes}</p> : null}

                      {appointment.canEdit ? (
                        <form action={updateAppointmentAction} className="mt-4 min-w-0 rounded-2xl border border-white/10 bg-white/5 p-3">
                          <input type="hidden" name="appointmentId" value={appointment.id} />
                          <div className="grid min-w-0 gap-3">
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
                            <div className="grid gap-3 sm:grid-cols-2">
                              <input name="clientPhone" defaultValue={appointment.clientPhone ?? ""} placeholder="Phone" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-pink-300" />
                              <input name="clientEmail" type="email" defaultValue={appointment.clientEmail ?? ""} placeholder="Email" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-pink-300" />
                            </div>
                            <input name="startsAt" type="datetime-local" defaultValue={formatDateTimeInputInNewYork(appointment.startsAt)} className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-pink-300" required />
                            <span className="relative min-w-0">
                              <select name="durationMinutes" defaultValue={String(getAppointmentDurationMinutes(appointment.startsAt, appointment.endsAt))} className="w-full min-w-0 appearance-none rounded-2xl border border-white/10 bg-black py-2 pl-3 pr-12 text-sm text-white outline-none focus:border-pink-300">
                                {appointmentDurationOptions(appointment.startsAt, appointment.endsAt).map((minutes) => <option key={minutes} value={minutes}>{minutes}m</option>)}
                              </select>
                              <span className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-lg leading-none text-white/90">⌄</span>
                            </span>
                            <input name="notes" defaultValue={appointment.notes ?? ""} placeholder="Client/request note" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-pink-300" />
                            <input name="internalNotes" defaultValue={appointment.internalNotes ?? ""} placeholder="Internal note" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-pink-300" />
                            <label className="flex items-start gap-2 text-xs font-bold leading-5 text-white/45">
                              <input name="allowConflict" type="checkbox" className="mt-1 accent-pink-300" />
                              Allow overlap if this double-booking is intentional.
                            </label>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button name="action" value="update" type="submit" className="rounded-full bg-pink-300 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white">Save changes</button>
                            <button name="action" value="delete" type="submit" className="rounded-full border border-red-200/45 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-red-100 transition hover:bg-red-200 hover:text-black">Remove</button>
                          </div>
                        </form>
                      ) : null}
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
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

function Metric({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 ${wide ? "sm:col-span-2 xl:col-span-3" : ""}`}>
      <p className="min-w-0 break-words text-2xl font-black leading-tight text-white [overflow-wrap:anywhere] sm:text-3xl">{value}</p>
      <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/42">{label}</p>
    </div>
  );
}
