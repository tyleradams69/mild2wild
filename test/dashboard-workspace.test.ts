import { describe, expect, it } from "vitest";
import { ownerAdminProfile, type DashboardAuthSession } from "../src/lib/auth-session";
import { buildDashboardLeadInbox, buildProfileEditorModel } from "../src/lib/dashboard-workspace";
import { services, staffMembers } from "../src/lib/studio-data";

const ownerSession: DashboardAuthSession = {
  role: "owner",
  displayName: ownerAdminProfile.name,
  email: ownerAdminProfile.email,
  staffSlug: ownerAdminProfile.staffSlug,
  expiresAt: Date.now() + 1000,
};

const nailStaffSession: DashboardAuthSession = {
  role: "staff",
  displayName: "Nail Team",
  staffSlug: "team-member-13",
  expiresAt: Date.now() + 1000,
};

const tattooStaffSession: DashboardAuthSession = {
  role: "staff",
  displayName: "Tattoo Team",
  staffSlug: "team-member-10",
  expiresAt: Date.now() + 1000,
};

describe("dashboard workspace", () => {
  it("lets owner manage all non-mascot profiles but scopes staff to their own editable profile", () => {
    const ownerModel = buildProfileEditorModel(ownerSession, staffMembers, services);
    const staffModel = buildProfileEditorModel(nailStaffSession, staffMembers, services);

    expect(ownerModel.canManageAllProfiles).toBe(true);
    expect(ownerModel.editableProfiles).toHaveLength(staffMembers.filter((staff) => !staff.isMascot).length);
    expect(ownerModel.editableProfiles.map((profile) => profile.slug)).not.toContain("team-member-12");

    expect(staffModel.canManageAllProfiles).toBe(false);
    expect(staffModel.editableProfiles.map((profile) => profile.slug)).toEqual(["team-member-13"]);
    expect(staffModel.editableProfiles[0]).toMatchObject({ title: "Nail Artist", serviceNames: expect.arrayContaining(["Custom Nail Art"]) });
  });

  it("combines booking requests and call-agent transfers into a routed inbox", () => {
    const inbox = buildDashboardLeadInbox({
      session: ownerSession,
      staffMembers,
      services,
      appointments: [
        {
          id: "appt-1",
          customer_name: "Maya Rose",
          customer_phone: "555-0101",
          customer_email: "maya@example.com",
          service_slug: "custom-nail-art",
          staff_slug: "team-member-13",
          starts_at: "2026-06-01T18:00:00.000Z",
          status: "requested",
          notes: "Chrome flames.",
        },
      ],
      callAgentLeads: [
        {
          id: "call-1",
          customer_name: "Riley",
          customer_phone: "555-0303",
          requested_service: "small tattoo consult",
          preferred_staff_slug: "team-member-10",
          preferred_time: "Saturday",
          summary: "Riley wants a fine-line tattoo consult and asked for Saturday.",
          transferred_to: "front desk",
          created_at: "2026-06-02T19:00:00.000Z",
        },
      ],
    });

    expect(inbox).toHaveLength(2);
    expect(inbox[0]).toMatchObject({ source: "Call agent", customerName: "Riley", routedStaffName: "Team Member 10" });
    expect(inbox[1]).toMatchObject({ source: "Booking form", customerName: "Maya Rose", routedStaffName: "Caitlin" });
  });

  it("keeps staff inbox scoped to their own routed requests", () => {
    const inbox = buildDashboardLeadInbox({
      session: tattooStaffSession,
      staffMembers,
      services,
      appointments: [
        { id: "appt-nails", customer_name: "Maya", service_slug: "custom-nail-art", staff_slug: "team-member-13", starts_at: "2026-06-01T18:00:00.000Z", status: "requested" },
      ],
      callAgentLeads: [
        { id: "call-tattoo", customer_name: "Riley", requested_service: "tattoo", preferred_staff_slug: "team-member-10", summary: "Tattoo consult", created_at: "2026-06-01T17:00:00.000Z" },
      ],
    });

    expect(inbox.map((lead) => lead.id)).toEqual(["call-tattoo"]);
  });
});
