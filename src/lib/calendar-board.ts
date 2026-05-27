import type { DashboardAuthSession } from "./auth-session";
import { canEditOwnedAppointment, filterOwnedAppointmentsForSession, type OwnedAppointmentStatus } from "./owned-calendar-system";
import type { StaffMember } from "./studio-data";

export const calendarActionStatuses = ["requested", "confirmed", "completed", "cancelled"] as const;
export type CalendarActionStatus = (typeof calendarActionStatuses)[number];

export type CalendarBoardAppointment = {
  id: string;
  staffSlug: string;
  serviceName: string;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  startsAt: string;
  endsAt: string;
  status: string;
  source: string;
  notes?: string | null;
  internalNotes?: string | null;
};

export type CalendarBoardCard = CalendarBoardAppointment & {
  dateLabel: string;
  timeRange: string;
  statusLabel: string;
  statusTone: string;
  contactLabel: string;
  canEdit: boolean;
};

export type CalendarBoardLane = {
  staffSlug: string;
  staffName: string;
  staffTitle: string;
  calendarColor: string;
  detailHref: string;
  canEdit: boolean;
  appointments: CalendarBoardCard[];
};

export type CalendarBoard = {
  totalAppointments: number;
  visibleLanes: CalendarBoardLane[];
  emptyState: string;
};

export type CalendarDaySlot = {
  hour: number;
  label: string;
};

export type CalendarDayEventTone = "confirmed" | "requested" | "blocked" | "cancelled" | "completed";

export type CalendarDayEvent = {
  appointment: CalendarBoardCard;
  startLabel: string;
  endLabel: string;
  durationLabel: string;
  offsetMinutes: number;
  durationMinutes: number;
  topRem: number;
  heightRem: number;
  tone: CalendarDayEventTone;
};

export type CalendarDayGroup = {
  dateKey: string;
  heading: string;
  subheading: string;
  slots: CalendarDaySlot[];
  events: CalendarDayEvent[];
  startsAtHour: number;
  endsAtHour: number;
  heightRem: number;
};

export type CalendarDayView = {
  days: CalendarDayGroup[];
};

const timelineHourHeightRem = 5.25;

export function normalizeCalendarStatus(value: unknown): CalendarActionStatus | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, "_");
  return calendarActionStatuses.includes(normalized as CalendarActionStatus) ? (normalized as CalendarActionStatus) : null;
}

export function buildCalendarBoard({
  session,
  staffMembers,
  appointments,
}: {
  session: DashboardAuthSession;
  staffMembers: StaffMember[];
  appointments: CalendarBoardAppointment[];
  now?: string;
}): CalendarBoard {
  const bookableStaff = staffMembers.filter((staff) => !staff.isMascot);
  const visibleAppointments = filterOwnedAppointmentsForSession(
    session,
    appointments.map((appointment) => ({
      id: appointment.id,
      staffSlug: appointment.staffSlug,
      clientName: appointment.clientName,
      clientPhone: appointment.clientPhone,
      clientEmail: appointment.clientEmail,
      serviceName: appointment.serviceName,
      startsAt: appointment.startsAt,
      endsAt: appointment.endsAt,
      status: coerceOwnedStatus(appointment.status),
      source: appointment.source === "call_agent" || appointment.source === "booksy" || appointment.source === "manual" ? appointment.source : "website",
      notes: appointment.notes,
    })),
  );
  const visibleIds = new Set(visibleAppointments.map((appointment) => appointment.id));
  const visibleRows = appointments.filter((appointment) => visibleIds.has(appointment.id));
  const staffWithAppointments = new Set(visibleRows.map((appointment) => appointment.staffSlug));

  const visibleStaff = bookableStaff.filter((staff) => {
    if (session.role === "owner") return true;
    return staff.slug === session.staffSlug || staffWithAppointments.has(staff.slug);
  });

  const lanes = visibleStaff.map((staff) => {
    const laneAppointments = visibleRows
      .filter((appointment) => appointment.staffSlug === staff.slug)
      .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
      .map((appointment) => buildCalendarCard(appointment, canEditOwnedAppointment(session, { staffSlug: appointment.staffSlug })));

    return {
      staffSlug: staff.slug,
      staffName: staff.name,
      staffTitle: staff.title,
      calendarColor: staff.calendarColor,
      detailHref: `/dashboard/calendar/${staff.slug}`,
      canEdit: session.role === "owner" || session.staffSlug === staff.slug,
      appointments: laneAppointments,
    };
  });

  return {
    totalAppointments: visibleRows.length,
    visibleLanes: session.role === "owner" ? lanes : lanes.filter((lane) => lane.canEdit || lane.appointments.length > 0),
    emptyState: session.role === "owner" ? "No appointments are on the calendar yet." : "No appointments are assigned to your calendar yet.",
  };
}

export function buildCalendarDayView(appointments: CalendarBoardCard[]): CalendarDayView {
  const grouped = new Map<string, CalendarBoardCard[]>();

  appointments
    .slice()
    .sort((left, right) => new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime())
    .forEach((appointment) => {
      const key = dateKeyInNewYork(appointment.startsAt);
      const existing = grouped.get(key) ?? [];
      grouped.set(key, [...existing, appointment]);
    });

  const days = Array.from(grouped.entries()).map(([dateKey, dayAppointments]) => {
    const startHours = dayAppointments.map((appointment) => partsInNewYork(appointment.startsAt).hour);
    const endHours = dayAppointments.map((appointment) => {
      const parts = partsInNewYork(appointment.endsAt);
      return parts.minute > 0 ? parts.hour + 1 : parts.hour;
    });
    const startsAtHour = Math.max(8, Math.min(...startHours) - 1);
    const endsAtHour = Math.min(21, Math.max(18, ...endHours) + 1);
    const slots = Array.from({ length: endsAtHour - startsAtHour + 1 }, (_, index) => {
      const hour = startsAtHour + index;
      return { hour, label: formatHourLabel(hour) };
    });
    const events = dayAppointments.map((appointment) => {
      const start = partsInNewYork(appointment.startsAt);
      const end = partsInNewYork(appointment.endsAt);
      const startMinutes = start.hour * 60 + start.minute;
      const endMinutes = end.hour * 60 + end.minute;
      const offsetMinutes = Math.max(0, startMinutes - startsAtHour * 60);
      const durationMinutes = Math.max(15, endMinutes - startMinutes);
      return {
        appointment,
        startLabel: formatTime(appointment.startsAt),
        endLabel: formatTime(appointment.endsAt),
        durationLabel: `${durationMinutes}m`,
        offsetMinutes,
        durationMinutes,
        topRem: (offsetMinutes / 60) * timelineHourHeightRem,
        heightRem: Math.max(3.5, (durationMinutes / 60) * timelineHourHeightRem),
        tone: dayEventTone(appointment.status),
      };
    });

    return {
      dateKey,
      heading: formatDayHeading(dayAppointments[0]?.startsAt ?? dateKey),
      subheading: `${dayAppointments.length} ${dayAppointments.length === 1 ? "appointment" : "appointments"}`,
      slots,
      events,
      startsAtHour,
      endsAtHour,
      heightRem: (endsAtHour - startsAtHour) * timelineHourHeightRem,
    };
  });

  return { days };
}

function buildCalendarCard(appointment: CalendarBoardAppointment, canEdit: boolean): CalendarBoardCard {
  return {
    ...appointment,
    dateLabel: formatDate(appointment.startsAt),
    timeRange: `${formatTime(appointment.startsAt)} - ${formatTime(appointment.endsAt)}`,
    statusLabel: labelForStatus(appointment.status),
    statusTone: toneForStatus(appointment.status),
    contactLabel: [appointment.clientPhone, appointment.clientEmail].filter(Boolean).join(" · ") || "No contact saved",
    canEdit,
  };
}

function coerceOwnedStatus(value: string): OwnedAppointmentStatus {
  const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, "_");
  if (["requested", "confirmed", "checked_in", "completed", "cancelled", "no_show", "blocked"].includes(normalized)) return normalized as OwnedAppointmentStatus;
  return "requested";
}

function labelForStatus(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[-_\s]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase()) || "Requested";
}

function toneForStatus(value: string) {
  const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, "_");
  if (normalized === "confirmed") return "bg-lime-200 text-black";
  if (normalized === "completed") return "bg-cyan-200 text-black";
  if (normalized === "cancelled") return "bg-white/15 text-white/55";
  return "bg-yellow-200 text-black";
}

function dayEventTone(value: string): CalendarDayEventTone {
  const normalized = value.trim().toLowerCase().replace(/[-\s]+/g, "_");
  if (normalized === "confirmed") return "confirmed";
  if (normalized === "completed") return "completed";
  if (normalized === "cancelled" || normalized === "no_show") return "cancelled";
  if (normalized === "blocked") return "blocked";
  return "requested";
}

function partsInNewYork(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { year: 0, month: 1, day: 1, hour: 8, minute: 0 };
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? 0);
  const rawHour = get("hour");
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: rawHour === 24 ? 0 : rawHour,
    minute: get("minute"),
  };
}

function dateKeyInNewYork(value: string) {
  const parts = partsInNewYork(value);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function formatDayHeading(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date TBD";
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "America/New_York" }).format(date);
}

function formatHourLabel(hour: number) {
  if (hour === 0) return "12 AM";
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return "12 PM";
  return `${hour - 12} PM`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date TBD";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", weekday: "short", timeZone: "America/New_York" }).format(date);
}

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBD";
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }).format(date);
}
