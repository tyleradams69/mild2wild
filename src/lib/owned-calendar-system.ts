import type { DashboardAuthSession } from "./auth-session";

export type OwnedAppointmentStatus = "requested" | "confirmed" | "checked_in" | "completed" | "cancelled" | "no_show" | "blocked";
export type OwnedAppointmentSource = "manual" | "website" | "call_agent" | "booksy";

export type OwnedCalendarAppointment = {
  id: string;
  externalId?: string | null;
  staffSlug: string;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  serviceName: string;
  startsAt: string;
  endsAt: string;
  status: OwnedAppointmentStatus;
  source: OwnedAppointmentSource;
  notes?: string | null;
};

export type BooksyCsvRow = {
  appointmentId: string | null;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  staffName: string;
  serviceName: string;
  date: string;
  time: string;
  durationMinutes: number;
  status: OwnedAppointmentStatus;
  notes: string | null;
};

type Result<T> = { ok: true; value: T } | { ok: false; errors: string[] };

export function filterOwnedAppointmentsForSession(session: DashboardAuthSession, appointments: OwnedCalendarAppointment[]) {
  if (session.role === "owner") return appointments;
  if (!session.staffSlug) return [];
  return appointments.filter((appointment) => appointment.staffSlug === session.staffSlug);
}

export function canEditOwnedAppointment(session: DashboardAuthSession, appointment: Pick<OwnedCalendarAppointment, "staffSlug">) {
  return session.role === "owner" || (!!session.staffSlug && session.staffSlug === appointment.staffSlug);
}

export function detectOwnedCalendarConflicts(
  candidate: { staffSlug: string; startsAt: string; endsAt: string; ignoreAppointmentId?: string },
  appointments: OwnedCalendarAppointment[],
) {
  const candidateStart = new Date(candidate.startsAt).getTime();
  const candidateEnd = new Date(candidate.endsAt).getTime();
  if (!Number.isFinite(candidateStart) || !Number.isFinite(candidateEnd) || candidateEnd <= candidateStart) return [];

  return appointments.filter((appointment) => {
    if (appointment.id === candidate.ignoreAppointmentId) return false;
    if (appointment.staffSlug !== candidate.staffSlug) return false;
    if (appointment.status === "cancelled" || appointment.status === "no_show") return false;
    const startsAt = new Date(appointment.startsAt).getTime();
    const endsAt = new Date(appointment.endsAt).getTime();
    return startsAt < candidateEnd && endsAt > candidateStart;
  });
}

export function normalizeBooksyCsvRow(row: Record<string, unknown>): BooksyCsvRow {
  const duration = Number.parseInt(readColumn(row, ["Duration", "Duration Minutes", "Duration (min)"]) || "0", 10);
  return {
    appointmentId: nullable(readColumn(row, ["Appointment ID", "Appointment Id", "ID", "Booking ID"])),
    clientName: readColumn(row, ["Client Name", "Client", "Customer", "Customer Name"]),
    clientPhone: nullable(readColumn(row, ["Phone", "Client Phone", "Mobile", "Customer Phone"])),
    clientEmail: nullable(readColumn(row, ["Email", "Client Email", "Customer Email"])),
    staffName: readColumn(row, ["Staff", "Staff Member", "Employee", "Provider"]),
    serviceName: readColumn(row, ["Service", "Service Name", "Treatment"]),
    date: readColumn(row, ["Date", "Appointment Date"]),
    time: readColumn(row, ["Time", "Start Time", "Appointment Time"]),
    durationMinutes: Number.isFinite(duration) && duration > 0 ? duration : 60,
    status: normalizeStatus(readColumn(row, ["Status", "Appointment Status"])),
    notes: nullable(readColumn(row, ["Notes", "Note", "Description"])),
  };
}

export function buildBooksyAppointmentImport(
  row: BooksyCsvRow,
  options: { staffSlugByBooksyName: Map<string, string>; defaultTimezone: string },
): Result<Omit<OwnedCalendarAppointment, "id">> {
  const errors: string[] = [];
  const staffKey = normalizeKey(row.staffName);
  const staffSlug = options.staffSlugByBooksyName.get(staffKey);
  if (!staffSlug) errors.push(`Booksy staff member ${row.staffName || "unknown"} is not mapped to a website staff profile.`);
  if (!row.clientName) errors.push("Booksy client name is required.");
  if (!row.serviceName) errors.push("Booksy service name is required.");

  const startsAt = parseBooksyLocalDateTime(row.date, row.time, options.defaultTimezone);
  if (!startsAt) errors.push("Booksy appointment date/time is invalid.");

  if (errors.length > 0 || !staffSlug || !startsAt) return { ok: false, errors };
  const endsAtDate = new Date(startsAt);
  endsAtDate.setUTCMinutes(endsAtDate.getUTCMinutes() + row.durationMinutes);

  return {
    ok: true,
    value: {
      externalId: row.appointmentId,
      source: "booksy",
      staffSlug,
      clientName: row.clientName,
      clientPhone: row.clientPhone,
      clientEmail: row.clientEmail,
      serviceName: row.serviceName,
      startsAt,
      endsAt: endsAtDate.toISOString(),
      status: row.status,
      notes: row.notes,
    },
  };
}

function readColumn(row: Record<string, unknown>, names: string[]) {
  for (const name of names) {
    const exact = row[name];
    if (typeof exact === "string" && exact.trim()) return exact.trim();
    const fuzzyKey = Object.keys(row).find((key) => normalizeKey(key) === normalizeKey(name));
    const fuzzy = fuzzyKey ? row[fuzzyKey] : undefined;
    if (typeof fuzzy === "string" && fuzzy.trim()) return fuzzy.trim();
  }
  return "";
}

function nullable(value: string) {
  return value.trim() || null;
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeStatus(value: string): OwnedAppointmentStatus {
  const normalized = normalizeKey(value).replace(/[- ]/g, "_");
  if (["requested", "confirmed", "checked_in", "completed", "cancelled", "no_show", "blocked"].includes(normalized)) {
    return normalized as OwnedAppointmentStatus;
  }
  if (normalized === "canceled") return "cancelled";
  if (normalized === "no_show") return "no_show";
  return "confirmed";
}

function parseBooksyLocalDateTime(dateValue: string, timeValue: string, timeZone: string) {
  const dateMatch = dateValue.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const timeMatch = timeValue.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!dateMatch || !timeMatch) return null;

  const year = Number(dateMatch[1]);
  const month = Number(dateMatch[2]);
  const day = Number(dateMatch[3]);
  let hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2] ?? "0");
  const meridiem = timeMatch[3]?.toUpperCase();
  if (meridiem === "PM" && hour < 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const offsetMinutes = getTimezoneOffsetMinutes(new Date(utcGuess), timeZone);
  return new Date(utcGuess - offsetMinutes * 60_000).toISOString();
}

function getTimezoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "shortOffset" }).formatToParts(date);
  const name = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = name.match(/^GMT([+-])(\d{1,2})(?::(\d{2}))?$/);
  if (!match) return 0;
  const sign = match[1] === "+" ? 1 : -1;
  const hours = Number(match[2]);
  const minutes = Number(match[3] ?? "0");
  return sign * (hours * 60 + minutes);
}
