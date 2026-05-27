export type ServiceCategorySlug = "nails" | "hair" | "tattoo" | "aesthetics";

export type ServiceCategory = {
  slug: ServiceCategorySlug;
  name: string;
  headline: string;
  description: string;
  accent: string;
  staffLabel: string;
};

export type StudioService = {
  slug: string;
  name: string;
  categorySlug: ServiceCategorySlug;
  durationMinutes: number;
  priceLabel: string;
  description: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type StaffMember = {
  slug: string;
  name: string;
  title: string;
  bio: string;
  photoUrl: string;
  serviceCategorySlugs: ServiceCategorySlug[];
  serviceSlugs: string[];
  socialLinks: SocialLink[];
  gallery: string[];
  calendarColor: string;
  isMascot?: boolean;
};

export type DashboardScope = {
  role: "owner" | "staff";
  canManageAllCalendars: boolean;
  visibleStaffSlugs: string[];
};

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "nails",
    name: "Nails",
    headline: "Wild sets, clean care, and custom nail art.",
    description:
      "Bright acrylics, gel, fills, sculpted art, and detail-heavy sets from nail artists who live for color.",
    accent: "#F06BD6",
    staffLabel: "Nail artists",
  },
  {
    slug: "hair",
    name: "Hair",
    headline: "Color, cuts, styling, and big transformation energy.",
    description:
      "From polished salon services to bold color work, hair bookings route to stylists only.",
    accent: "#FFE45C",
    staffLabel: "Hair stylists",
  },
  {
    slug: "tattoo",
    name: "Tattoo",
    headline: "Custom ink, flash, consultations, and portfolio-driven artists.",
    description:
      "Tattoo inquiries show tattoo staff only, with portfolios and consultation-first booking flows.",
    accent: "#4DDCE5",
    staffLabel: "Tattoo artists",
  },
  {
    slug: "aesthetics",
    name: "Aesthetics & Spa",
    headline: "Spa, skincare, beauty treatments, and self-care rituals.",
    description:
      "Aesthetics and spa services connect visitors with the right licensed beauty professionals.",
    accent: "#A95CFF",
    staffLabel: "Aesthetics & spa staff",
  },
];

export const services: StudioService[] = [
  {
    slug: "custom-nail-art",
    name: "Custom Nail Art",
    categorySlug: "nails",
    durationMinutes: 90,
    priceLabel: "Starting at $65",
    description: "Hand-painted, chrome, gems, character art, and themed sets.",
  },
  {
    slug: "gel-manicure",
    name: "Gel Manicure",
    categorySlug: "nails",
    durationMinutes: 60,
    priceLabel: "Starting at $45",
    description: "Long-wear gel polish with cuticle care and glossy finish.",
  },
  {
    slug: "vivids-color",
    name: "Vivids & Color",
    categorySlug: "hair",
    durationMinutes: 180,
    priceLabel: "Consult required",
    description: "Bright color, creative placement, and transformation services.",
  },
  {
    slug: "cut-style",
    name: "Cut & Style",
    categorySlug: "hair",
    durationMinutes: 75,
    priceLabel: "Starting at $55",
    description: "Shape, polish, movement, and style for everyday or events.",
  },
  {
    slug: "tattoo-consult",
    name: "Tattoo Consultation",
    categorySlug: "tattoo",
    durationMinutes: 30,
    priceLabel: "Free / deposit after consult",
    description: "Discuss concept, placement, sizing, artist fit, and scheduling.",
  },
  {
    slug: "flash-tattoo",
    name: "Flash Tattoo",
    categorySlug: "tattoo",
    durationMinutes: 120,
    priceLabel: "Artist priced",
    description: "Pre-drawn flash pieces from the shop's artists.",
  },
  {
    slug: "facial-glow",
    name: "Glow Facial",
    categorySlug: "aesthetics",
    durationMinutes: 60,
    priceLabel: "Starting at $80",
    description: "Relaxing skincare treatment focused on glow and refresh.",
  },
  {
    slug: "brow-lash",
    name: "Brow & Lash Detail",
    categorySlug: "aesthetics",
    durationMinutes: 45,
    priceLabel: "Starting at $35",
    description: "Brow shaping, tinting, and lash-friendly detail work.",
  },
];

const serviceSlugsByCategory: Record<ServiceCategorySlug, string[]> = {
  nails: ["custom-nail-art", "gel-manicure"],
  hair: ["vivids-color", "cut-style"],
  tattoo: ["tattoo-consult", "flash-tattoo"],
  aesthetics: ["facial-glow", "brow-lash"],
};

const categoryTitles: Record<ServiceCategorySlug, string> = {
  nails: "Nail Artist",
  hair: "Hair Stylist",
  tattoo: "Tattoo Artist",
  aesthetics: "Aesthetics & Spa Specialist",
};

const categoryBio: Record<ServiceCategorySlug, string> = {
  nails:
    "Bio coming soon. This nail artist offers color-forward sets, detailed nail art, and appointment options for guests who want a look that fits their style.",
  hair:
    "Bio coming soon. This stylist helps guests plan cuts, color, transformations, and finishing details that match their look and routine.",
  tattoo:
    "Bio coming soon. This tattoo artist is available for consultation-first projects, flash ideas, placement planning, and portfolio review.",
  aesthetics:
    "Bio coming soon. This beauty specialist supports spa, skincare, brow, lash, and self-care services with a calm client-first approach.",
};

const categoryGallery: Record<ServiceCategorySlug, string[]> = {
  nails: ["Custom sets", "Chrome details", "Hand-painted art"],
  hair: ["Color work", "Cuts & styling", "Event-ready finishes"],
  tattoo: ["Custom concepts", "Flash designs", "Consultation planning"],
  aesthetics: ["Skincare", "Brows & lashes", "Relaxing treatments"],
};

const publicStaffNames: Record<number, string> = {
  1: "Luna Lacquer",
  2: "Nova Nails",
  3: "Raven Ink",
  4: "Iris Aura",
  5: "Poppy Polish",
  6: "Violet Glow",
  7: "Ace Needle",
  8: "Sol Strands",
  9: "Sunny Shears",
  10: "Echo Ink",
  11: "Ruby Rinse",
  13: "Caitlin",
  14: "Moxie Mani",
  15: "Cherry Chrome",
  16: "Pixie Polish",
  17: "Sage Spa",
};

const categoryAccentRotation: Record<ServiceCategorySlug, string[]> = {
  nails: ["#F06BD6", "#FF5AB8", "#FF8BE8", "#B73CFF", "#FF7AC8"],
  hair: ["#FFE45C", "#FFB84D", "#E9FF63", "#F8D34E"],
  tattoo: ["#4DDCE5", "#30F2FF", "#7A6CFF", "#57FFD6"],
  aesthetics: ["#A95CFF", "#C66BFF", "#79D94D", "#8A5CFF"],
};

const mascotBio =
  "The shop dog is part of the Mild 2 Wild personality and can be featured as the mascot on the staff page, tour page, and brand moments without appearing as a bookable service provider.";

const staffSeed: Array<{ index: number; categorySlug?: ServiceCategorySlug; isMascot?: boolean }> = [
  { index: 1, categorySlug: "nails" },
  { index: 2, categorySlug: "nails" },
  { index: 3, categorySlug: "tattoo" },
  { index: 4, categorySlug: "aesthetics" },
  { index: 5, categorySlug: "nails" },
  { index: 6, categorySlug: "aesthetics" },
  { index: 7, categorySlug: "tattoo" },
  { index: 8, categorySlug: "hair" },
  { index: 9, categorySlug: "hair" },
  { index: 10, categorySlug: "tattoo" },
  { index: 11, categorySlug: "hair" },
  { index: 12, isMascot: true },
  { index: 13, categorySlug: "nails" },
  { index: 14, categorySlug: "nails" },
  { index: 15, categorySlug: "nails" },
  { index: 16, categorySlug: "nails" },
  { index: 17, categorySlug: "aesthetics" },
];

export const staffMembers: StaffMember[] = staffSeed.map(({ index, categorySlug, isMascot }) => {
  const paddedIndex = String(index).padStart(2, "0");
  const categoryIndex = categorySlug
    ? staffSeed.filter((staff) => staff.categorySlug === categorySlug && staff.index <= index).length - 1
    : 0;
  const colors = categorySlug ? categoryAccentRotation[categorySlug] : ["#F06BD6"];

  return {
    slug: `team-member-${paddedIndex}`,
    name: isMascot ? "Shop Dog Mascot" : (publicStaffNames[index] ?? `${categoryTitles[categorySlug as ServiceCategorySlug]} ${paddedIndex}`),
    title: isMascot ? "Shop Mascot" : categoryTitles[categorySlug as ServiceCategorySlug],
    bio: isMascot ? mascotBio : categoryBio[categorySlug as ServiceCategorySlug],
    photoUrl: `/staff/team-member-${paddedIndex}.jpg`,
    serviceCategorySlugs: categorySlug ? [categorySlug] : [],
    serviceSlugs: categorySlug ? serviceSlugsByCategory[categorySlug] : [],
    socialLinks: [
      { label: "Instagram coming soon", href: "#" },
      { label: "Portfolio coming soon", href: "#" },
    ],
    gallery: isMascot ? ["Mascot photo slot", "Shop-dog story", "Tour-page cameo"] : categoryGallery[categorySlug as ServiceCategorySlug],
    calendarColor: colors[categoryIndex % colors.length],
    isMascot,
  };
});

export const productHighlights = [
  "Aftercare kits",
  "Cuticle oils",
  "Salon shampoos",
  "Spa skincare",
  "Gift cards",
];

export function getServiceCategoryBySlug(slug: string) {
  return serviceCategories.find((category) => category.slug === slug);
}

export function getServicesForCategory(slug: ServiceCategorySlug) {
  return services.filter((service) => service.categorySlug === slug);
}

export function getFeaturedStaffForCategory(slug: ServiceCategorySlug) {
  return staffMembers.filter((staff) => staff.serviceCategorySlugs.includes(slug));
}

export function getStaffForService(serviceSlug: string) {
  return staffMembers.filter((staff) => staff.serviceSlugs.includes(serviceSlug));
}

export function getStaffBySlug(slug: string) {
  return staffMembers.find((staff) => staff.slug === slug);
}

export function getStaffDashboardScope(role: "owner" | "staff", staffSlug?: string): DashboardScope {
  if (role === "owner") {
    return {
      role,
      canManageAllCalendars: true,
      visibleStaffSlugs: staffMembers.map((staff) => staff.slug),
    };
  }

  return {
    role,
    canManageAllCalendars: false,
    visibleStaffSlugs: staffSlug ? [staffSlug] : [],
  };
}
