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

export const staffMembers: StaffMember[] = [
  {
    slug: "luna-lacquer",
    name: "Luna Lacquer",
    title: "Lead Nail Artist",
    bio: "Luna specializes in hand-painted details, chrome, gems, and statement sets that match the Mild 2 Wild energy.",
    photoUrl: "/staff/luna-lacquer.svg",
    serviceCategorySlugs: ["nails"],
    serviceSlugs: ["custom-nail-art", "gel-manicure"],
    socialLinks: [{ label: "Instagram", href: "https://instagram.com/" }],
    gallery: ["Chrome flames", "Pink aura set", "Gemstone claws"],
    calendarColor: "#F06BD6",
  },
  {
    slug: "nova-nails",
    name: "Nova Nails",
    title: "Gel & Sculpted Set Specialist",
    bio: "Nova keeps nail appointments crisp, colorful, and wearable with sculpted structure and clean finishes.",
    photoUrl: "/staff/nova-nails.svg",
    serviceCategorySlugs: ["nails"],
    serviceSlugs: ["gel-manicure", "custom-nail-art"],
    socialLinks: [{ label: "TikTok", href: "https://tiktok.com/" }],
    gallery: ["French remix", "Lime jelly set", "Short glam gel"],
    calendarColor: "#79D94D",
  },
  {
    slug: "raven-ink",
    name: "Raven Ink",
    title: "Tattoo Artist",
    bio: "Raven creates bold illustrative tattoos, crisp linework, and custom pieces built around client stories.",
    photoUrl: "/staff/raven-ink.svg",
    serviceCategorySlugs: ["tattoo"],
    serviceSlugs: ["tattoo-consult", "flash-tattoo"],
    socialLinks: [{ label: "Instagram", href: "https://instagram.com/" }],
    gallery: ["Fine-line florals", "Traditional flash", "Custom shoulder piece"],
    calendarColor: "#4DDCE5",
  },
  {
    slug: "ace-needle",
    name: "Ace Needle",
    title: "Flash & Custom Tattoo Artist",
    bio: "Ace focuses on punchy flash, clean blackwork, and approachable consultation-first tattoo experiences.",
    photoUrl: "/staff/ace-needle.svg",
    serviceCategorySlugs: ["tattoo"],
    serviceSlugs: ["tattoo-consult", "flash-tattoo"],
    socialLinks: [{ label: "Portfolio", href: "https://example.com/" }],
    gallery: ["Blackwork moth", "Tiny symbols", "Bold dagger flash"],
    calendarColor: "#FF3434",
  },
  {
    slug: "sol-strands",
    name: "Sol Strands",
    title: "Colorist & Stylist",
    bio: "Sol brings color theory, smooth styling, and transformation appointments for guests who want a new look.",
    photoUrl: "/staff/sol-strands.svg",
    serviceCategorySlugs: ["hair"],
    serviceSlugs: ["vivids-color", "cut-style"],
    socialLinks: [{ label: "Instagram", href: "https://instagram.com/" }],
    gallery: ["Copper melt", "Neon peekaboo", "Layered blowout"],
    calendarColor: "#FFE45C",
  },
  {
    slug: "iris-aura",
    name: "Iris Aura",
    title: "Aesthetics & Spa Specialist",
    bio: "Iris handles relaxing skincare, brows, and spa services with a calm touch inside the high-energy shop.",
    photoUrl: "/staff/iris-aura.svg",
    serviceCategorySlugs: ["aesthetics"],
    serviceSlugs: ["facial-glow", "brow-lash"],
    socialLinks: [{ label: "Instagram", href: "https://instagram.com/" }],
    gallery: ["Glow facial", "Soft brows", "Spa detail"],
    calendarColor: "#A95CFF",
  },
];

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
