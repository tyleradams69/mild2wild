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
          staff.serviceCategorySlugs.length > 0,
      ),
    ).toBe(true);
  });

  it("models owner/admin access differently from individual employee calendar access", () => {
    const ownerScope = getStaffDashboardScope("owner");
    const employeeScope = getStaffDashboardScope("staff", "raven-ink");

    expect(ownerScope.canManageAllCalendars).toBe(true);
    expect(ownerScope.visibleStaffSlugs).toEqual(staffMembers.map((staff) => staff.slug));
    expect(employeeScope.canManageAllCalendars).toBe(false);
    expect(employeeScope.visibleStaffSlugs).toEqual(["raven-ink"]);
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
