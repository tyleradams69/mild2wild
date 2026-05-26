import { describe, expect, it } from "vitest";
import type { DashboardAuthSession } from "../src/lib/auth-session";
import {
  buildBooksyAppointmentImport,
  canEditOwnedAppointment,
  detectOwnedCalendarConflicts,
  filterOwnedAppointmentsForSession,
  normalizeBooksyCsvRow,
  type OwnedCalendarAppointment,
} from "../src/lib/owned-calendar-system";

const ownerSession: DashboardAuthSession = {
  role: "owner",
  displayName: "Caitlin",
  staffSlug: "team-member-13",
  expiresAt: Date.now() + 1000,
};

const nailStaffSession: DashboardAuthSession = {
  role: "staff",
  displayName: "Nail Staff",
  staffSlug: "team-member-13",
  expiresAt: Date.now() + 1000,
};

const appointments: OwnedCalendarAppointment[] = [
  {
    id: "appt-1",
    staffSlug: "team-member-13",
    clientName: "Maya Rose",
    clientPhone: "555-0101",
    clientEmail: "maya@example.com",
    serviceName: "Gel Manicure",
    startsAt: "2026-06-01T15:00:00.000Z",
    endsAt: "2026-06-01T16:00:00.000Z",
    status: "confirmed",
    source: "manual",
  },
  {
    id: "appt-2",
    staffSlug: "team-member-10",
    clientName: "Riley Ink",
    clientPhone: "555-0202",
    clientEmail: null,
    serviceName: "Tattoo Consultation",
    startsAt: "2026-06-01T17:00:00.000Z",
    endsAt: "2026-06-01T17:30:00.000Z",
    status: "requested",
    source: "booksy",
  },
];

describe("owned calendar system", () => {
  it("scopes appointment visibility by owner/admin versus staff login", () => {
    expect(filterOwnedAppointmentsForSession(ownerSession, appointments).map((item) => item.id)).toEqual(["appt-1", "appt-2"]);
    expect(filterOwnedAppointmentsForSession(nailStaffSession, appointments).map((item) => item.id)).toEqual(["appt-1"]);
  });

  it("allows staff to edit only their own appointment while owner can edit all", () => {
    expect(canEditOwnedAppointment(ownerSession, appointments[1])).toBe(true);
    expect(canEditOwnedAppointment(nailStaffSession, appointments[0])).toBe(true);
    expect(canEditOwnedAppointment(nailStaffSession, appointments[1])).toBe(false);
  });

  it("detects staff-specific appointment overlaps but ignores cancelled rows and other staff", () => {
    const conflicts = detectOwnedCalendarConflicts(
      {
        staffSlug: "team-member-13",
        startsAt: "2026-06-01T15:30:00.000Z",
        endsAt: "2026-06-01T16:30:00.000Z",
      },
      [
        ...appointments,
        { ...appointments[0], id: "cancelled", status: "cancelled", startsAt: "2026-06-01T15:15:00.000Z", endsAt: "2026-06-01T15:45:00.000Z" },
      ],
    );

    expect(conflicts.map((item) => item.id)).toEqual(["appt-1"]);
  });

  it("normalizes Booksy CSV rows into first-party appointment imports", () => {
    const row = normalizeBooksyCsvRow({
      "Appointment ID": " BKSY-1001 ",
      "Client Name": " Jordan Client ",
      Phone: " 555-7777 ",
      Email: " jordan@example.com ",
      Staff: " Caitlin ",
      Service: " Gel Manicure ",
      Date: "2026-06-03",
      Time: "2:30 PM",
      Duration: "60",
      Status: "Confirmed",
      Notes: "Imported from Booksy export.",
    });

    const mapped = buildBooksyAppointmentImport(row, {
      staffSlugByBooksyName: new Map([["caitlin", "team-member-13"]]),
      defaultTimezone: "America/New_York",
    });

    expect(mapped).toEqual({
      ok: true,
      value: expect.objectContaining({
        externalId: "BKSY-1001",
        source: "booksy",
        staffSlug: "team-member-13",
        clientName: "Jordan Client",
        clientPhone: "555-7777",
        clientEmail: "jordan@example.com",
        serviceName: "Gel Manicure",
        startsAt: "2026-06-03T18:30:00.000Z",
        endsAt: "2026-06-03T19:30:00.000Z",
        status: "confirmed",
        notes: "Imported from Booksy export.",
      }),
    });
  });

  it("flags Booksy rows for review when staff cannot be matched", () => {
    const row = normalizeBooksyCsvRow({
      "Client Name": "Unknown Client",
      Staff: "Guest Artist",
      Service: "Flash Tattoo",
      Date: "2026-06-03",
      Time: "11:00 AM",
      Duration: "120",
    });

    expect(buildBooksyAppointmentImport(row, { staffSlugByBooksyName: new Map(), defaultTimezone: "America/New_York" })).toEqual({
      ok: false,
      errors: ["Booksy staff member Guest Artist is not mapped to a website staff profile."],
    });
  });
});
