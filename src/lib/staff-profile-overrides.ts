import { promises as fs } from "fs";
import * as path from "path";
import type { DashboardAuthSession } from "./auth-session";
import type { StaffMember } from "./studio-data";

export type StaffProfileUpdate = {
  name: string;
  title: string;
  bio: string;
  instagramUrl: string;
  tiktokUrl: string;
};

export type StaffProfileOverrides = Record<string, StaffProfileUpdate>;

const overridePath = path.join(process.cwd(), ".data", "staff-profile-overrides.json");

type NormalizedResult = { ok: true; value: StaffProfileUpdate } | { ok: false; errors: string[] };

export function mergeStaffProfileOverrides(staffMembers: StaffMember[], overrides: StaffProfileOverrides): StaffMember[] {
  return staffMembers.map((staff) => {
    const override = overrides[staff.slug];
    if (!override) return staff;

    const socialLinks = staff.socialLinks.filter((link) => link.label !== "Instagram" && link.label !== "TikTok");
    if (override.instagramUrl) socialLinks.push({ label: "Instagram", href: override.instagramUrl });
    if (override.tiktokUrl) socialLinks.push({ label: "TikTok", href: override.tiktokUrl });

    return {
      ...staff,
      name: override.name || staff.name,
      title: override.title || staff.title,
      bio: override.bio || staff.bio,
      socialLinks,
    };
  });
}

export function normalizeStaffProfileUpdate(input: Record<string, unknown>): NormalizedResult {
  const name = clean(input.name);
  const title = clean(input.title);
  const bio = clean(input.bio);
  const instagramUrl = normalizeOptionalUrl(input.instagramUrl);
  const tiktokUrl = normalizeOptionalUrl(input.tiktokUrl);
  const errors: string[] = [];

  if (!name) errors.push("Profile name is required.");
  if (!title) errors.push("Profile title is required.");
  if (!bio) errors.push("Profile bio is required.");
  if (instagramUrl === null) errors.push("Instagram URL must be a valid URL or handle.");
  if (tiktokUrl === null) errors.push("TikTok URL must be a valid URL or handle.");

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: { name, title, bio, instagramUrl: instagramUrl ?? "", tiktokUrl: tiktokUrl ?? "" } };
}

export function buildProfileEditModel(session: DashboardAuthSession, staffSlug: string, staffMembers: StaffMember[]) {
  const profile = staffMembers.find((staff) => staff.slug === staffSlug);
  if (!profile) return { canEdit: false, profile: null, reason: "Profile not found." };
  if (profile.isMascot) return { canEdit: false, profile, reason: "Mascot profiles are public-only." };
  if (session.role !== "owner" && session.staffSlug !== profile.slug) {
    return { canEdit: false, profile, reason: "Staff can only edit their own profile." };
  }
  return { canEdit: true, profile, reason: null };
}

export async function readStaffProfileOverrides(): Promise<StaffProfileOverrides> {
  try {
    const raw = await fs.readFile(overridePath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).flatMap(([slug, value]) => {
        const normalized = normalizeStaffProfileUpdate(value && typeof value === "object" ? (value as Record<string, unknown>) : {});
        return normalized.ok ? [[slug, normalized.value]] : [];
      }),
    );
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return {};
    throw error;
  }
}

export async function writeStaffProfileOverride(staffSlug: string, update: StaffProfileUpdate) {
  const current = await readStaffProfileOverrides();
  const next = { ...current, [staffSlug]: update };
  await fs.mkdir(path.dirname(overridePath), { recursive: true });
  await fs.writeFile(overridePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeOptionalUrl(value: unknown) {
  const raw = clean(value);
  if (!raw) return "";
  const withProtocol = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw.replace(/^@/, "")}`;
  try {
    const url = new URL(withProtocol);
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}
