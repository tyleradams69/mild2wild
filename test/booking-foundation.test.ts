import { describe, expect, it } from "vitest";
import { services, staffMembers } from "../src/lib/studio-data";
import {
  buildAppointmentInsert,
  buildBookingServiceGroups,
  validateBookingRequest,
} from "../src/lib/booking-foundation";
import { serviceCategories } from "../src/lib/studio-data";

const staffIdsBySlug = new Map([
  ["team-member-10", "staff-tattoo-id"],
  ["team-member-01", "staff-nails-id"],
]);

const serviceIdsBySlug = new Map([
  ["tattoo-consult", "service-tattoo-consult-id"],
  ["custom-nail-art", "service-custom-nail-art-id"],
]);

describe("booking foundation", () => {
  it("builds customer booking choices with only compatible staff and no mascot", () => {
    const groups = buildBookingServiceGroups({ serviceCategories, services, staffMembers });
    const tattooConsult = groups.flatMap((group) => group.services).find((service) => service.slug === "tattoo-consult");

    expect(tattooConsult?.compatibleStaff.map((staff) => staff.slug)).toEqual([
      "team-member-03",
      "team-member-07",
      "team-member-10",
    ]);
    expect(groups.flatMap((group) => group.services).flatMap((service) => service.compatibleStaff.map((staff) => staff.slug))).not.toContain(
      "team-member-12",
    );
  });

  it("accepts a valid appointment only when the selected staff offers the selected service", () => {
    const result = validateBookingRequest(
      {
        customerName: "Maya Rose",
        customerPhone: "555-0101",
        customerEmail: "maya@example.com",
        serviceSlug: "tattoo-consult",
        staffSlug: "team-member-10",
        startsAt: "2026-06-01T18:00:00.000Z",
        notes: "First tattoo consult.",
      },
      { services, staffMembers },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error("expected booking to validate");
    expect(result.value.durationMinutes).toBe(30);
    expect(result.value.endsAt).toBe("2026-06-01T18:30:00.000Z");
  });

  it("rejects cross-department booking attempts before hitting the database", () => {
    const result = validateBookingRequest(
      {
        customerName: "Maya Rose",
        customerPhone: "555-0101",
        serviceSlug: "tattoo-consult",
        staffSlug: "team-member-01",
        startsAt: "2026-06-01T18:00:00.000Z",
      },
      { services, staffMembers },
    );

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected cross-department booking to fail");
    expect(result.errors).toContain("Selected staff member does not offer that service.");
  });

  it("builds an appointment insert payload with database ids and computed end time", () => {
    const valid = validateBookingRequest(
      {
        customerName: "Maya Rose",
        customerPhone: "555-0101",
        serviceSlug: "tattoo-consult",
        staffSlug: "team-member-10",
        startsAt: "2026-06-01T18:00:00.000Z",
        notes: "Placement consult.",
      },
      { services, staffMembers },
    );

    if (!valid.ok) throw new Error(valid.errors.join(", "));

    expect(buildAppointmentInsert(valid.value, { staffIdsBySlug, serviceIdsBySlug })).toEqual({
      staff_id: "staff-tattoo-id",
      service_id: "service-tattoo-consult-id",
      service_name: "Tattoo Consultation",
      source: "website",
      customer_name: "Maya Rose",
      customer_phone: "555-0101",
      customer_email: null,
      starts_at: "2026-06-01T18:00:00.000Z",
      ends_at: "2026-06-01T18:30:00.000Z",
      status: "requested",
      notes: "Placement consult.",
    });
  });
});
