import { describe, expect, it } from "vitest";
import type { DashboardAuthSession } from "../src/lib/auth-session";
import { buildCalendarBoard, calendarActionStatuses, normalizeCalendarStatus } from "../src/lib/calendar-board";
import { staffMembers } from "../src/lib/studio-data";

const ownerSession: DashboardAuthSession = {
  role: "owner",
  displayName: "Caitlin",
  staffSlug: "team-member-13",
  expiresAt: Date.now() + 1000,
};

const staffSession: DashboardAuthSession = {
  role: "staff",
  displayName: "Tattoo Staff",
  staffSlug: "team-member-10",
  expiresAt: Date.now() + 1000,
};

const rows = [
  {
    id: "appt-nails",
    staffSlug: "team-member-13",
    serviceName: "Gel Manicure",
    clientName: "Maya Rose",
    clientPhone: "555-0101",
    clientEmail: "maya@example.com",
    startsAt: "2026-06-01T15:00:00.000Z",
    endsAt: "2026-06-01T16:00:00.000Z",
    status: "requested",
    source: "website",
    notes: "Chrome flames",
    internalNotes: "Call after lunch",
  },
  {
    id: "appt-tattoo",
    staffSlug: "team-member-10",
    serviceName: "Tattoo Consultation",
    clientName: "Riley Ink",
    clientPhone: "555-0202",
    clientEmail: null,
    startsAt: "2026-06-01T17:00:00.000Z",
    endsAt: "2026-06-01T17:30:00.000Z",
    status: "confirmed",
    source: "manual",
    notes: null,
    internalNotes: null,
  },
];

describe("calendar board", () => {
  it("lets owner see every appointment lane with editable actions", () => {
    const board = buildCalendarBoard({ session: ownerSession, staffMembers, appointments: rows, now: "2026-06-01T12:00:00.000Z" });

    expect(board.totalAppointments).toBe(2);
    expect(board.visibleLanes.find((lane) => lane.staffSlug === "team-member-13")?.appointments.map((item) => item.id)).toEqual(["appt-nails"]);
    expect(board.visibleLanes.find((lane) => lane.staffSlug === "team-member-10")?.appointments.map((item) => item.id)).toEqual(["appt-tattoo"]);
    expect(board.visibleLanes.find((lane) => lane.staffSlug === "team-member-13")?.detailHref).toBe("/dashboard/calendar/team-member-13");
    expect(board.visibleLanes.every((lane) => lane.canEdit)).toBe(true);
  });

  it("scopes staff calendar board to their own editable lane", () => {
    const board = buildCalendarBoard({ session: staffSession, staffMembers, appointments: rows, now: "2026-06-01T12:00:00.000Z" });

    expect(board.totalAppointments).toBe(1);
    expect(board.visibleLanes.map((lane) => lane.staffSlug)).toEqual(["team-member-10"]);
    expect(board.visibleLanes[0].canEdit).toBe(true);
    expect(board.visibleLanes[0].appointments[0]).toEqual(expect.objectContaining({
      id: "appt-tattoo",
      timeRange: "1:00 PM - 1:30 PM",
      statusLabel: "Confirmed",
      canEdit: true,
    }));
  });

  it("normalizes allowed calendar status changes and rejects unsupported statuses", () => {
    expect(calendarActionStatuses).toEqual(["requested", "confirmed", "completed", "cancelled"]);
    expect(normalizeCalendarStatus(" completed ")).toBe("completed");
    expect(normalizeCalendarStatus("no_show")).toBeNull();
  });
});
