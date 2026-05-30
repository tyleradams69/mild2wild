import { describe, expect, it } from "vitest";
import {
  appendCreatedStaffProfiles,
  buildProfileEditModel,
  mergeStaffProfileOverrides,
  normalizeStaffProfileCreation,
  normalizeStaffProfileUpdate,
} from "../src/lib/staff-profile-overrides";
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
        title: "Owner / Nail Artist",
        bio: "Custom bio written in the dashboard.",
        instagramUrl: "https://instagram.com/caitlin.nails",
        tiktokUrl: "",
        gallery: ["Chrome sets", "Fine detail work"],
        portfolioImages: [{ src: "/staff/caitlin/work-01.jpg", alt: "Chrome nails by Caitlin.", label: "Chrome nails" }],
      },
    });

    const caitlin = merged.find((staff) => staff.slug === "team-member-13");
    expect(caitlin).toMatchObject({
      slug: "team-member-13",
      name: "Caitlin",
      bio: "Custom bio written in the dashboard.",
    });
    expect(caitlin?.socialLinks.find((link) => link.label === "Instagram")?.href).toBe("https://instagram.com/caitlin.nails");
    expect(caitlin?.socialLinks.map((link) => link.label)).not.toContain("Instagram coming soon");
    expect(caitlin?.gallery).toEqual(["Chrome sets", "Fine detail work"]);
    expect(caitlin?.portfolioImages?.[0]).toMatchObject({ src: "/staff/caitlin/work-01.jpg", label: "Chrome nails" });
    expect(merged.find((staff) => staff.slug === "team-member-10")?.name).toBe("Surge");
  });

  it("creates new owner-added staff profiles from the same public profile template", () => {
    const creation = normalizeStaffProfileCreation(
      {
        name: "New Hire",
        title: "Hair Stylist",
        bio: "A public bio Caitlin can paste when a new employee joins.",
        categorySlug: "hair",
        photoUrl: "",
        calendarColor: "#ffb84d",
        galleryNotes: "Color work\nEvent styling",
        instagramUrl: "@newhirehair",
      },
      staffMembers,
    );

    expect(creation).toMatchObject({ ok: true, value: { slug: "team-member-18", categorySlug: "hair" } });
    if (!creation.ok) throw new Error("Expected new staff creation to be valid.");

    const merged = appendCreatedStaffProfiles(staffMembers, { [creation.value.slug]: creation.value });
    const newHire = merged.find((staff) => staff.slug === "team-member-18");

    expect(newHire).toMatchObject({
      slug: "team-member-18",
      name: "New Hire",
      title: "Hair Stylist",
      photoUrl: "/staff/new-staff-placeholder.svg",
      serviceCategorySlugs: ["hair"],
      serviceSlugs: ["vivids-color", "cut-style"],
      gallery: ["Color work", "Event styling"],
      calendarColor: "#FFB84D",
    });
    expect(newHire?.socialLinks.find((link) => link.label === "Instagram")?.href).toBe("https://newhirehair");
  });

  it("normalizes editable form input and rejects missing required profile fields", () => {
    const result = normalizeStaffProfileUpdate({
      name: "  Caitlin  ",
      title: " Owner / Nail Artist ",
      bio: " A longer dashboard-editable bio. ",
      instagramUrl: " instagram.com/caitlin.nails ",
      tiktokUrl: " ",
      galleryNotes: " Chrome sets \n Fine details ",
      portfolioImages: [{ src: "/staff/caitlin/work-01.jpg", label: " Chrome nails ", alt: " Silver chrome nail art. " }],
    });

    expect(result).toEqual({
      ok: true,
      value: {
        name: "Caitlin",
        title: "Owner / Nail Artist",
        bio: "A longer dashboard-editable bio.",
        instagramUrl: "https://instagram.com/caitlin.nails",
        tiktokUrl: "",
        gallery: ["Chrome sets", "Fine details"],
        portfolioImages: [{ src: "/staff/caitlin/work-01.jpg", label: "Chrome nails", alt: "Silver chrome nail art." }],
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
