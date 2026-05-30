import { promises as fs } from "fs";
import * as path from "path";
import type { DashboardAuthSession } from "./auth-session";
import {
  serviceCategories,
  services,
  type PortfolioImage,
  type ServiceCategorySlug,
  type StaffMember,
} from "./studio-data";

export type StaffProfileUpdate = {
  name: string;
  title: string;
  bio: string;
  instagramUrl: string;
  tiktokUrl: string;
  gallery: string[];
  portfolioImages: PortfolioImage[];
};

export type StaffProfileOverrides = Record<string, StaffProfileUpdate>;

export type StaffProfileCreation = StaffProfileUpdate & {
  slug: string;
  categorySlug: ServiceCategorySlug;
  photoUrl: string;
  calendarColor: string;
};

export type StaffProfileCreations = Record<string, StaffProfileCreation>;

const overridePath = path.join(process.cwd(), ".data", "staff-profile-overrides.json");
const creationPath = path.join(process.cwd(), ".data", "staff-profile-creations.json");
const newStaffPlaceholderPhoto = "/staff/new-staff-placeholder.svg";
const maxGalleryNotes = 8;
const maxPortfolioImages = 18;

const defaultCalendarColors: Record<ServiceCategorySlug, string> = {
  nails: "#F06BD6",
  hair: "#FFE45C",
  tattoo: "#4DDCE5",
  aesthetics: "#A95CFF",
};

type NormalizedResult = { ok: true; value: StaffProfileUpdate } | { ok: false; errors: string[] };
type NormalizedCreationResult = { ok: true; value: StaffProfileCreation } | { ok: false; errors: string[] };

export function mergeStaffProfileOverrides(staffMembers: StaffMember[], overrides: StaffProfileOverrides): StaffMember[] {
  return staffMembers.map((staff) => {
    const override = overrides[staff.slug];
    if (!override) return staff;

    const socialLinks = staff.socialLinks.filter((link) => {
      const label = link.label.toLowerCase();
      if (override.instagramUrl && label.includes("instagram")) return false;
      if (override.tiktokUrl && label.includes("tiktok")) return false;
      return label !== "instagram" && label !== "tiktok";
    });
    if (override.instagramUrl) socialLinks.push({ label: "Instagram", href: override.instagramUrl });
    if (override.tiktokUrl) socialLinks.push({ label: "TikTok", href: override.tiktokUrl });

    return {
      ...staff,
      name: override.name || staff.name,
      title: override.title || staff.title,
      bio: override.bio || staff.bio,
      socialLinks,
      gallery: override.gallery.length > 0 ? override.gallery : staff.gallery,
      portfolioImages: override.portfolioImages.length > 0 ? override.portfolioImages : staff.portfolioImages,
    };
  });
}

export function appendCreatedStaffProfiles(staffMembers: StaffMember[], creations: StaffProfileCreations): StaffMember[] {
  const existingSlugs = new Set(staffMembers.map((staff) => staff.slug));
  const createdStaff = Object.values(creations)
    .filter((profile) => !existingSlugs.has(profile.slug))
    .sort((left, right) => left.slug.localeCompare(right.slug, undefined, { numeric: true }))
    .map(buildCreatedStaffMember);

  return [...staffMembers, ...createdStaff];
}

export function applyStaffProfileStorage(staffMembers: StaffMember[], creations: StaffProfileCreations, overrides: StaffProfileOverrides): StaffMember[] {
  return mergeStaffProfileOverrides(appendCreatedStaffProfiles(staffMembers, creations), overrides);
}

export function normalizeStaffProfileCreation(input: Record<string, unknown>, existingStaffMembers: StaffMember[]): NormalizedCreationResult {
  const normalized = normalizeStaffProfileUpdate(input);
  const categorySlug = clean(input.categorySlug) as ServiceCategorySlug;
  const photoUrl = normalizePhotoUrl(input.photoUrl) || newStaffPlaceholderPhoto;
  const calendarColor = normalizeHexColor(input.calendarColor) || defaultCalendarColors[categorySlug] || defaultCalendarColors.nails;
  const errors: string[] = [];

  if (!serviceCategories.some((category) => category.slug === categorySlug)) errors.push("Choose a valid service category.");
  if (!normalized.ok) errors.push(...normalized.errors);

  if (errors.length > 0 || !normalized.ok) return { ok: false, errors };

  return {
    ok: true,
    value: {
      ...normalized.value,
      slug: nextStaffSlug(existingStaffMembers),
      categorySlug,
      photoUrl,
      calendarColor,
    },
  };
}

export function normalizeStaffProfileUpdate(input: Record<string, unknown>): NormalizedResult {
  const name = clean(input.name);
  const title = clean(input.title);
  const bio = clean(input.bio);
  const instagramUrl = normalizeOptionalUrl(input.instagramUrl);
  const tiktokUrl = normalizeOptionalUrl(input.tiktokUrl);
  const gallery = normalizeGallery(input.gallery ?? input.galleryNotes);
  const portfolioImagesResult = normalizePortfolioImages(input.portfolioImages);
  const errors: string[] = [];

  if (!name) errors.push("Profile name is required.");
  if (!title) errors.push("Profile title is required.");
  if (!bio) errors.push("Profile bio is required.");
  if (instagramUrl === null) errors.push("Instagram URL must be a valid URL or handle.");
  if (tiktokUrl === null) errors.push("TikTok URL must be a valid URL or handle.");
  if (!portfolioImagesResult.ok) errors.push(...portfolioImagesResult.errors);

  if (errors.length > 0 || !portfolioImagesResult.ok) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name,
      title,
      bio,
      instagramUrl: instagramUrl ?? "",
      tiktokUrl: tiktokUrl ?? "",
      gallery,
      portfolioImages: portfolioImagesResult.value,
    },
  };
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

export async function readStaffProfileCreations(baseStaffMembers: StaffMember[] = []): Promise<StaffProfileCreations> {
  try {
    const raw = await fs.readFile(creationPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const existing = [...baseStaffMembers];
    const entries: Array<[string, StaffProfileCreation]> = [];

    for (const [slug, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== "object") continue;
      const normalized = normalizeStoredStaffProfileCreation(slug, value as Record<string, unknown>, existing);
      if (!normalized.ok) continue;
      entries.push([normalized.value.slug, normalized.value]);
      existing.push(buildCreatedStaffMember(normalized.value));
    }

    return Object.fromEntries(entries);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return {};
    throw error;
  }
}

export async function readStoredStaffMembers(baseStaffMembers: StaffMember[]): Promise<StaffMember[]> {
  const [creations, overrides] = await Promise.all([readStaffProfileCreations(baseStaffMembers), readStaffProfileOverrides()]);
  return applyStaffProfileStorage(baseStaffMembers, creations, overrides);
}

export async function writeStaffProfileOverride(staffSlug: string, update: StaffProfileUpdate) {
  const current = await readStaffProfileOverrides();
  const next = { ...current, [staffSlug]: update };
  await fs.mkdir(path.dirname(overridePath), { recursive: true });
  await fs.writeFile(overridePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

export async function writeStaffProfileCreation(creation: StaffProfileCreation) {
  const current = await readStaffProfileCreations();
  const next = { ...current, [creation.slug]: creation };
  await fs.mkdir(path.dirname(creationPath), { recursive: true });
  await fs.writeFile(creationPath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
}

function buildCreatedStaffMember(profile: StaffProfileCreation): StaffMember {
  const socialLinks = [
    ...(profile.instagramUrl ? [{ label: "Instagram", href: profile.instagramUrl }] : []),
    ...(profile.tiktokUrl ? [{ label: "TikTok", href: profile.tiktokUrl }] : []),
  ];

  return {
    slug: profile.slug,
    name: profile.name,
    title: profile.title,
    bio: profile.bio,
    photoUrl: profile.photoUrl,
    serviceCategorySlugs: [profile.categorySlug],
    serviceSlugs: services.filter((service) => service.categorySlug === profile.categorySlug).map((service) => service.slug),
    socialLinks: socialLinks.length > 0 ? socialLinks : [{ label: "Portfolio coming soon", href: "#" }],
    gallery: profile.gallery.length > 0 ? profile.gallery : [serviceCategories.find((category) => category.slug === profile.categorySlug)?.name ?? "Staff profile"],
    portfolioImages: profile.portfolioImages.length > 0 ? profile.portfolioImages : undefined,
    calendarColor: profile.calendarColor,
  };
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStoredStaffProfileCreation(slug: string, input: Record<string, unknown>, existingStaffMembers: StaffMember[]): NormalizedCreationResult {
  const normalized = normalizeStaffProfileCreation(input, existingStaffMembers);
  if (!normalized.ok) return normalized;
  const storedSlug = normalizeStaffSlug(slug || input.slug);
  if (!storedSlug || existingStaffMembers.some((staff) => staff.slug === storedSlug)) return { ok: false, errors: ["Stored staff slug is not available."] };
  return { ok: true, value: { ...normalized.value, slug: storedSlug } };
}

function nextStaffSlug(staffMembers: StaffMember[]) {
  const maxIndex = staffMembers.reduce((max, staff) => {
    const match = staff.slug.match(/^team-member-(\d+)$/);
    return match ? Math.max(max, Number.parseInt(match[1] ?? "0", 10)) : max;
  }, 0);
  return `team-member-${String(maxIndex + 1).padStart(2, "0")}`;
}

function normalizeStaffSlug(value: unknown) {
  const slug = clean(value);
  return /^team-member-\d{2,3}$/.test(slug) ? slug : "";
}

function normalizePhotoUrl(value: unknown) {
  const raw = clean(value);
  if (!raw) return "";
  if (raw.startsWith("/")) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      return new URL(raw).toString();
    } catch {
      return "";
    }
  }
  return "";
}

function normalizeHexColor(value: unknown) {
  const raw = clean(value);
  return /^#[0-9A-Fa-f]{6}$/.test(raw) ? raw.toUpperCase() : "";
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

function normalizeGallery(value: unknown) {
  const lines = Array.isArray(value) ? value : clean(value).split(/\r?\n/);
  return lines
    .map((item) => clean(item))
    .filter(Boolean)
    .slice(0, maxGalleryNotes);
}

function normalizePortfolioImages(value: unknown): { ok: true; value: PortfolioImage[] } | { ok: false; errors: string[] } {
  if (!Array.isArray(value)) return { ok: true, value: [] };

  const errors: string[] = [];
  const images = value
    .map((item): PortfolioImage | null => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const src = normalizePortfolioSrc(record.src);
      const label = clean(record.label);
      const alt = clean(record.alt);
      if (!src && !label && !alt) return null;
      if (!src) {
        errors.push("Portfolio images need an image URL or public asset path.");
        return null;
      }
      if (!label) {
        errors.push("Portfolio images need a short label.");
        return null;
      }
      return {
        src,
        label: label.slice(0, 80),
        alt: (alt || `${label} by Mild 2 Wild staff.`).slice(0, 180),
      };
    })
    .filter((item): item is PortfolioImage => Boolean(item))
    .slice(0, maxPortfolioImages);

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: images };
}

function normalizePortfolioSrc(value: unknown) {
  const raw = clean(value);
  if (!raw) return "";
  if (raw.startsWith("/")) return raw;
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    try {
      return new URL(raw).toString();
    } catch {
      return "";
    }
  }
  return "";
}
