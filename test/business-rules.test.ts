import { describe, expect, it } from "vitest";
import {
  getFeaturedStaffForCategory,
  getServiceCategoryBySlug,
  getStaffBySlug,
  getStaffDashboardScope,
  serviceCategories,
  staffMembers,
} from "../src/lib/studio-data";

describe("Mild 2 Wild service and staff rules", () => {
  it("keeps service pages scoped to only staff who offer that service category", () => {
    const tattooStaff = getFeaturedStaffForCategory("tattoo");

    expect(tattooStaff.length).toBeGreaterThan(0);
    expect(tattooStaff.every((staff) => staff.serviceCategorySlugs.includes("tattoo"))).toBe(true);
    expect(tattooStaff.some((staff) => staff.serviceCategorySlugs.includes("nails"))).toBe(false);
  });

  it("creates a meet-me profile shape for every staff member", () => {
    expect(staffMembers.length).toBeGreaterThanOrEqual(6);
    expect(
      staffMembers.every(
        (staff) =>
          staff.slug &&
          staff.name &&
          staff.bio &&
          staff.photoUrl &&
          staff.socialLinks.length > 0 &&
          (staff.serviceCategorySlugs.length > 0 || staff.isMascot),
      ),
    ).toBe(true);
  });

  it("sorts illustrated staff photos by the object they are holding and keeps the shop dog as mascot", () => {
    const slugsFor = (categorySlug: string) =>
      staffMembers.filter((staff) => staff.serviceCategorySlugs.includes(categorySlug as never)).map((staff) => staff.slug);

    expect(slugsFor("nails")).toEqual([
      "team-member-01",
      "team-member-02",
      "team-member-05",
      "team-member-13",
      "team-member-14",
      "team-member-15",
      "team-member-16",
    ]);
    expect(slugsFor("hair")).toEqual(["team-member-08", "team-member-09", "team-member-11"]);
    expect(slugsFor("tattoo")).toEqual(["team-member-03", "team-member-07", "team-member-10"]);
    expect(slugsFor("aesthetics")).toEqual(["team-member-04", "team-member-06", "team-member-17"]);
    expect(staffMembers.find((staff) => staff.slug === "team-member-12")?.isMascot).toBe(true);
  });

  it("maps Caitlin to team member 13 as a nail artist", () => {
    const caitlin = getStaffBySlug("team-member-13");

    expect(caitlin?.title).toBe("Nail Artist");
    expect(caitlin?.serviceCategorySlugs).toEqual(["nails"]);
    expect(caitlin?.photoUrl).toBe("/staff/team-member-13.jpg");
  });

  it("models owner/admin access differently from individual employee calendar access", () => {
    const ownerScope = getStaffDashboardScope("owner");
    const employeeScope = getStaffDashboardScope("staff", "team-member-10");

    expect(ownerScope.canManageAllCalendars).toBe(true);
    expect(ownerScope.visibleStaffSlugs).toEqual(staffMembers.map((staff) => staff.slug));
    expect(employeeScope.canManageAllCalendars).toBe(false);
    expect(employeeScope.visibleStaffSlugs).toEqual(["team-member-10"]);
  });

  it("includes all client-requested primary service categories", () => {
    expect(serviceCategories.map((category) => category.slug)).toEqual([
      "nails",
      "hair",
      "tattoo",
      "aesthetics",
    ]);
    expect(getServiceCategoryBySlug("hair")?.staffLabel).toContain("Hair");
    expect(getStaffBySlug("unknown")).toBeUndefined();
  });
});
