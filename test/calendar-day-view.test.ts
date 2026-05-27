import { describe, expect, it } from "vitest";
import { buildCalendarDayView, type CalendarBoardCard } from "../src/lib/calendar-board";

function appointment(overrides: Partial<CalendarBoardCard>): CalendarBoardCard {
  return {
    id: "appointment-1",
    staffSlug: "team-member-01",
    serviceName: "Custom Nail Art",
    clientName: "Avery Sample",
    clientPhone: "555-1101",
    clientEmail: "avery@example.com",
    startsAt: "2026-06-03T14:00:00.000Z",
    endsAt: "2026-06-03T15:15:00.000Z",
    status: "confirmed",
    source: "manual",
    notes: "Chrome stars full set.",
    internalNotes: "QA note",
    dateLabel: "Wed, Jun 3",
    timeRange: "10:00 AM - 11:15 AM",
    statusLabel: "Confirmed",
    statusTone: "bg-lime-200 text-black",
    contactLabel: "555-1101 · avery@example.com",
    canEdit: true,
    ...overrides,
  };
}

describe("buildCalendarDayView", () => {
  it("groups a staff lane into calendar days with timeline slots", () => {
    const view = buildCalendarDayView([
      appointment({ id: "morning", startsAt: "2026-06-03T14:00:00.000Z", endsAt: "2026-06-03T15:15:00.000Z" }),
      appointment({ id: "noon", clientName: "Jordan Demo", startsAt: "2026-06-03T16:00:00.000Z", endsAt: "2026-06-03T16:45:00.000Z" }),
      appointment({ id: "next-day", clientName: "Casey Placeholder", startsAt: "2026-06-04T18:30:00.000Z", endsAt: "2026-06-04T20:00:00.000Z" }),
    ]);

    expect(view.days.map((day) => day.dateKey)).toEqual(["2026-06-03", "2026-06-04"]);
    expect(view.days[0].heading).toBe("Wednesday, Jun 3");
    expect(view.days[0].slots.map((slot) => slot.label)).toContain("10 AM");
    expect(view.days[0].slots.map((slot) => slot.label)).toContain("12 PM");
    expect(view.days[0].events.map((event) => event.appointment.clientName)).toEqual(["Avery Sample", "Jordan Demo"]);
  });

  it("calculates event placement and keeps short calendar cards tall enough for readable text", () => {
    const view = buildCalendarDayView([
      appointment({ startsAt: "2026-06-03T14:00:00.000Z", endsAt: "2026-06-03T15:15:00.000Z" }),
      appointment({ id: "short", startsAt: "2026-06-03T16:00:00.000Z", endsAt: "2026-06-03T16:45:00.000Z" }),
    ]);

    const event = view.days[0].events[0];
    expect(event.startLabel).toBe("10:00 AM");
    expect(event.endLabel).toBe("11:15 AM");
    expect(event.durationLabel).toBe("75m");
    expect(event.offsetMinutes).toBe(60);
    expect(event.durationMinutes).toBe(75);
    expect(event.topRem).toBeGreaterThan(4);
    expect(event.heightRem).toBeGreaterThanOrEqual(8);

    const shortEvent = view.days[0].events[1];
    expect(shortEvent.durationLabel).toBe("45m");
    expect(shortEvent.heightRem).toBeGreaterThanOrEqual(8);
    expect(shortEvent.topRem).toBeGreaterThanOrEqual(event.topRem + event.heightRem + 0.5);
  });

  it("assigns status-specific calendar block tones", () => {
    const view = buildCalendarDayView([
      appointment({ id: "confirmed", status: "confirmed" }),
      appointment({ id: "requested", status: "requested" }),
      appointment({ id: "blocked", status: "blocked" }),
      appointment({ id: "cancelled", status: "cancelled" }),
    ]);

    expect(view.days[0].events.map((event) => event.tone)).toEqual([
      "confirmed",
      "requested",
      "blocked",
      "cancelled",
    ]);
  });
});
