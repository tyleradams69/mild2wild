import { describe, expect, it } from "vitest";
import { buildProfileEditModel, mergeStaffProfileOverrides, normalizeStaffProfileUpdate } from "../src/lib/staff-profile-overrides";
import { ownerAdminProfile, type DashboardAuthSession } from "../src/lib/auth-session";
import { staffMembers } from "../src/lib/studio-data";

const ownerSession: DashboardAuthSession = {
  role: "owner",
  displayName: ownerAdminProfile.name,
  email: ownerAdminProfile.email,
  staffSlug: ownerAdminProfile.staffSlug,
  expiresAt: Date.now() + 1000,
};

const staffSession: DashboardAuthSession = {
  role: "staff",
  displayName: "Caitlin",
  staffSlug: "team-member-13",
  expiresAt: Date.now() + 1000,
};

describe("staff profile overrides", () => {
  it("merges saved profile edits onto base staff data without changing unrelated fields", () => {
    const merged = mergeStaffProfileOverrides(staffMembers, {
      "team-member-13": {
        name: "Caitlin",
        bio: "Custom bio written in the dashboard.",
        instagramUrl: "https://instagram.com/caitlin.nails",
        tiktokUrl: "",
      },
    });

    const caitlin = merged.find((staff) => staff.slug === "team-member-13");
    expect(caitlin).toMatchObject({
      slug: "team-member-13",
      name: "Caitlin",
      bio: "Custom bio written in the dashboard.",
    });
    expect(caitlin?.socialLinks.find((link) => link.label === "Instagram")?.href).toBe("https://instagram.com/caitlin.nails");
    expect(merged.find((staff) => staff.slug === "team-member-10")?.name).toBe("Team Member 10");
  });

  it("normalizes editable form input and rejects missing required profile fields", () => {
    const result = normalizeStaffProfileUpdate({
      name: "  Caitlin  ",
      title: " Owner / Nail Artist ",
      bio: " A longer dashboard-editable bio. ",
      instagramUrl: " instagram.com/caitlin.nails ",
      tiktokUrl: " ",
    });

    expect(result).toEqual({
      ok: true,
      value: {
        name: "Caitlin",
        title: "Owner / Nail Artist",
        bio: "A longer dashboard-editable bio.",
        instagramUrl: "https://instagram.com/caitlin.nails",
        tiktokUrl: "",
      },
    });

    expect(normalizeStaffProfileUpdate({ name: "", title: "Nail Artist", bio: "bio" })).toMatchObject({ ok: false });
  });

  it("allows owner to edit any staff profile but staff can only edit their own", () => {
    expect(buildProfileEditModel(ownerSession, "team-member-10", staffMembers)).toMatchObject({ canEdit: true, profile: { slug: "team-member-10" } });
    expect(buildProfileEditModel(staffSession, "team-member-13", staffMembers)).toMatchObject({ canEdit: true, profile: { slug: "team-member-13" } });
    expect(buildProfileEditModel(staffSession, "team-member-10", staffMembers)).toMatchObject({ canEdit: false, profile: { slug: "team-member-10" } });
    expect(buildProfileEditModel(ownerSession, "team-member-12", staffMembers)).toMatchObject({ canEdit: false, reason: "Mascot profiles are public-only." });
  });
});
