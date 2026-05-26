import { describe, expect, it } from "vitest";
import {
  buildCalendarDashboardModel,
  canMoveAppointment,
  createDemoDashboardSession,
  getEditableCalendarSlugs,
} from "../src/lib/calendar-access";
import { staffMembers } from "../src/lib/studio-data";

describe("calendar access foundation", () => {
  it("lets the owner see and edit every staff calendar", () => {
    const owner = createDemoDashboardSession("owner");

    expect(getEditableCalendarSlugs(owner, staffMembers)).toEqual(staffMembers.map((staff) => staff.slug));
    expect(canMoveAppointment(owner, staffMembers[0].slug)).toBe(true);
    expect(canMoveAppointment(owner, staffMembers[staffMembers.length - 1].slug)).toBe(true);
  });

  it("limits a staff login to only their own calendar", () => {
    const employee = createDemoDashboardSession("staff", "team-member-10");

    expect(getEditableCalendarSlugs(employee, staffMembers)).toEqual(["team-member-10"]);
    expect(canMoveAppointment(employee, "team-member-10")).toBe(true);
    expect(canMoveAppointment(employee, "team-member-11")).toBe(false);
  });

  it("builds dashboard cards that clearly distinguish locked calendars", () => {
    const employee = createDemoDashboardSession("staff", "team-member-10");
    const model = buildCalendarDashboardModel(employee, staffMembers);

    expect(model.sessionLabel).toBe("Team Member 10 staff login");
    expect(model.visibleCalendars).toHaveLength(staffMembers.length);
    expect(model.visibleCalendars.find((calendar) => calendar.staffSlug === "team-member-10")?.canEdit).toBe(true);
    expect(model.visibleCalendars.find((calendar) => calendar.staffSlug === "team-member-11")?.canEdit).toBe(false);
    expect(model.visibleCalendars.filter((calendar) => calendar.canEdit)).toHaveLength(1);
  });

  it("personalizes dashboard sessions with the logged-in employee cartoon image", () => {
    const model = buildCalendarDashboardModel(
      { role: "owner", displayName: "Caitlin", staffSlug: "team-member-13" },
      staffMembers,
    );

    expect(model.profileAvatar).toEqual({
      name: "Caitlin",
      title: "Nail Artist",
      photoUrl: "/staff/team-member-13.jpg",
      accent: expect.any(String),
    });
  });
});
