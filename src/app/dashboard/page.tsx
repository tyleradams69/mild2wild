import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { PageShell, SectionEyebrow } from "@/components/site";
import { dashboardSessionCookieName, parseSignedDashboardSession } from "@/lib/auth-session";
import { buildCalendarBoard, calendarActionStatuses, normalizeCalendarStatus, type CalendarBoardAppointment } from "@/lib/calendar-board";
import { buildCalendarDashboardModel } from "@/lib/calendar-access";
import { businessOwnerCallRouting } from "@/lib/call-agent-config";
import { buildDashboardLeadInbox, buildProfileEditorModel } from "@/lib/dashboard-workspace";
import { canEditOwnedAppointment } from "@/lib/owned-calendar-system";
import { getStaffBySlug, serviceCategories, staffMembers } from "@/lib/studio-data";
import { services } from "@/lib/studio-data";
import { mergeStaffProfileOverrides, readStaffProfileOverrides } from "@/lib/staff-profile-overrides";
import { createSupabaseServerClient } from "@/lib/supabase";

function getDashboardSessionSecret() {
  return process.env.HERMES_DASHBOARD_SESSION_SECRET ?? "m2w-dashboard-dev-session-secret";
}

async function readDashboardSession() {
  const cookieStore = await cookies();
  return parseSignedDashboardSession(cookieStore.get(dashboardSessionCookieName)?.value, getDashboardSessionSecret());
}

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
  staff_members?: { slug?: string | null; name?: string | null; title?: string | null; calendar_color?: string | null } | { slug?: string | null; name?: string | null; title?: string | null; calendar_color?: string | null }[] | null;
  services?: { slug?: string | null; name?: string | null } | { slug?: string | null; name?: string | null }[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? value[0] : value;
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
    .select("id, customer_name, customer_phone, customer_email, starts_at, ends_at, status, notes, internal_notes, staff_members(slug, name, title, calendar_color), services(slug, name)")
    .order("starts_at", { ascending: true })
    .limit(80);

  if (error) return demoCalendarAppointments;
  const mapped = ((data ?? []) as AppointmentRelationRow[]).map(mapAppointmentRow).filter((row): row is CalendarBoardAppointment => Boolean(row));
  return mapped.length > 0 ? mapped : demoCalendarAppointments;
}

async function updateAppointmentAction(formData: FormData) {
  "use server";

  const session = await readDashboardSession();
  if (!session) redirect("/login");
  const appointmentId = String(formData.get("appointmentId") ?? "").trim();
  const status = normalizeCalendarStatus(formData.get("status"));
  const internalNotes = String(formData.get("internalNotes") ?? "").trim();
  if (!appointmentId || !status) return;

  const supabase = createSupabaseServerClient();
  if (!supabase) return;
  const { data } = await supabase.from("appointments").select("id, staff_members(slug)").eq("id", appointmentId).single();
  const staffSlug = firstRelation((data as { staff_members?: { slug?: string | null } | { slug?: string | null }[] | null } | null)?.staff_members)?.slug;
  if (!staffSlug || !canEditOwnedAppointment(session, { staffSlug })) return;

  await supabase.from("appointments").update({ status, internal_notes: internalNotes || null }).eq("id", appointmentId);
  revalidatePath("/dashboard");
}

async function blockCalendarTimeAction(formData: FormData) {
  "use server";

  const session = await readDashboardSession();
  if (!session) redirect("/login");
  const staffSlug = String(formData.get("staffSlug") ?? "").trim();
  const startsAtInput = String(formData.get("startsAt") ?? "").trim();
  const durationMinutes = Number.parseInt(String(formData.get("durationMinutes") ?? "60"), 10);
  const notes = String(formData.get("notes") ?? "").trim();
  if (!staffSlug || !startsAtInput || !Number.isFinite(durationMinutes) || durationMinutes < 15) return;
  if (!canEditOwnedAppointment(session, { staffSlug })) return;

  const startsAt = new Date(startsAtInput);
  if (Number.isNaN(startsAt.getTime())) return;
  const endsAt = new Date(startsAt);
  endsAt.setMinutes(endsAt.getMinutes() + durationMinutes);

  const supabase = createSupabaseServerClient();
  if (!supabase) return;
  const { data: staffRow } = await supabase.from("staff_members").select("id").eq("slug", staffSlug).single();
  const staffId = (staffRow as { id?: string } | null)?.id;
  if (!staffId) return;

  await supabase.from("appointments").insert({
    staff_id: staffId,
    service_id: null,
    customer_name: "Blocked time",
    customer_phone: null,
    customer_email: null,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    status: "confirmed",
    notes: notes || "Blocked from dashboard.",
    internal_notes: notes || null,
  });
  revalidatePath("/dashboard");
}

async function logoutAction() {
  "use server";

  const cookieStore = await cookies();
  cookieStore.delete(dashboardSessionCookieName);
  redirect("/login");
}

export default async function DashboardPage() {
  const session = await readDashboardSession();

  if (!session) {
    redirect("/login");
  }

  const [mergedStaffMembers, calendarAppointments] = await Promise.all([
    readStaffProfileOverrides().then((overrides) => mergeStaffProfileOverrides(staffMembers, overrides)),
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
    appointments: [
      {
        id: "demo-booking-1",
        customer_name: "Maya Rose",
        customer_phone: "555-0101",
        customer_email: "maya@example.com",
        service_slug: "custom-nail-art",
        staff_slug: "team-member-13",
        starts_at: "2026-06-01T18:00:00.000Z",
        status: "requested",
        lead_status: "contacted",
        internal_notes: "Called once, send inspiration/photo examples before confirming deposit.",
        notes: "Wants chrome flame nail art and asked for Caitlin if available.",
      },
    ],
    callAgentLeads: [
      {
        id: "demo-call-1",
        customer_name: "Riley",
        customer_phone: "555-0303",
        requested_service: "Fine-line tattoo consult",
        preferred_staff_slug: "team-member-10",
        preferred_time: "Saturday afternoon",
        summary: "Call agent collected the consult request and told Riley the shop would follow up with timing options.",
        transferred_to: businessOwnerCallRouting.transferLabel,
        text_summary_recipient: businessOwnerCallRouting.phoneE164,
        text_summary_status: "pending",
        lead_status: "waiting_on_client",
        internal_notes: "Needs Saturday consult options before follow-up.",
        created_at: "2026-06-02T19:00:00.000Z",
      },
    ],
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
                ? "Can manage all calendars, staff profiles, services, products, and call-agent leads."
                : "Can view the portal but only edit their own profile, availability, and bookings."}
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
            <SectionEyebrow color="#4DDCE5">Call-agent handoff</SectionEyebrow>
            <h2 className="brand-display text-3xl font-black uppercase">Lead intake can route to the right person.</h2>
            <p className="mt-4 text-white/65">
              The worker agent can collect name, requested service, and appointment notes, then hand the call to the shop with context already attached. Service-specific routing uses the same staff/category model as the public pages.
            </p>
          </article>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-5 py-10 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="neon-card rounded-[2rem] p-6" style={{ boxShadow: "0 0 70px #FFE45C22" }}>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <SectionEyebrow color="#FFE45C">Lead inbox</SectionEyebrow>
              <h2 className="brand-display text-4xl font-black uppercase">Bookings + call-agent transfers.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                Public booking requests and worker-agent call handoffs land in one routed queue so Caitlin can see who needs a follow-up and which staff lane owns it.
              </p>
            </div>
            <span className="rounded-full bg-yellow-200 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black">{leadInbox.length} open</span>
          </div>
          <div className="mt-6 space-y-3">
            {leadInbox.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-black/40 p-6 text-sm leading-6 text-white/58">
                No open requests for this login yet. New booking requests and call-agent handoffs will appear here when they are routed to this calendar lane.
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
              ? "Owner/admin can update every staff profile. The mascot stays visible on the public site but is not an editable booking provider."
              : "Staff accounts only get their own editable profile controls."}
          </p>
          <div className="mt-6 max-h-[34rem] space-y-3 overflow-y-auto pr-2 [scrollbar-color:#FF8AC8_rgba(255,255,255,0.08)]">
            {profileEditorModel.editableProfiles.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-white/15 bg-black/40 p-5 text-sm leading-6 text-white/58">
                No editable staff profiles are assigned to this login yet.
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
            const staff = getStaffBySlug(lane.staffSlug);
            const category = serviceCategories.find((item) => item.slug === staff?.serviceCategorySlugs[0]);
            return (
              <article
                key={lane.staffSlug}
                className="flex max-h-[42rem] min-w-0 flex-col rounded-[1.8rem] border bg-black/70 p-5"
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
                  <form action={blockCalendarTimeAction} className="mt-5 rounded-3xl border border-white/10 bg-white/5 p-4">
                    <input type="hidden" name="staffSlug" value={lane.staffSlug} />
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/50">Block time</p>
                    <div className="mt-3 grid gap-3">
                      <input name="startsAt" type="datetime-local" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none focus:border-cyan-300" required />
                      <select name="durationMinutes" defaultValue="60" className="min-w-0 rounded-2xl border border-white/10 bg-black py-2 pl-3 pr-10 text-sm text-white outline-none focus:border-cyan-300">
                        <option value="30">30m</option>
                        <option value="60">60m</option>
                        <option value="90">90m</option>
                        <option value="120">120m</option>
                      </select>
                    </div>
                    <input name="notes" placeholder="Reason, e.g. lunch, consult hold, time off" className="mt-3 w-full min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-cyan-300" />
                    <button type="submit" className="mt-3 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-cyan-200">Add block</button>
                  </form>
                ) : null}

                <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-2 [scrollbar-color:#4DDCE5_rgba(255,255,255,0.08)]">
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
                            <select name="status" defaultValue={appointment.status} className="min-w-0 rounded-2xl border border-white/10 bg-black py-2 pl-3 pr-10 text-sm text-white outline-none focus:border-pink-300">
                              {calendarActionStatuses.map((status) => (
                                <option key={status} value={status}>{status.replace(/_/g, " ")}</option>
                              ))}
                            </select>
                            <input name="internalNotes" defaultValue={appointment.internalNotes ?? ""} placeholder="Internal note" className="min-w-0 rounded-2xl border border-white/10 bg-black px-3 py-2 text-sm text-white outline-none placeholder:text-white/35 focus:border-pink-300" />
                          </div>
                          <button type="submit" className="mt-3 rounded-full bg-pink-300 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white">Save update</button>
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

function Metric({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 ${wide ? "sm:col-span-2 xl:col-span-3" : ""}`}>
      <p className="min-w-0 break-words text-2xl font-black leading-tight text-white [overflow-wrap:anywhere] sm:text-3xl">{value}</p>
      <p className="mt-1 text-[0.65rem] font-black uppercase tracking-[0.2em] text-white/42">{label}</p>
    </div>
  );
}
