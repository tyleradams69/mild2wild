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

export type PortfolioImage = {
  src: string;
  alt: string;
  label: string;
};

export type StaffProfileTemplateId =
  | "recommended"
  | "tattoo-flash-wall"
  | "black-bone"
  | "crimson-ink"
  | "neon-street"
  | "pastel-pop"
  | "glossy-salon"
  | "spa-glow"
  | "rainbow-nails"
  | "dark-comic"
  | "clean-minimal"
  | "gold-luxe"
  | "lavender-aura";

export type StaffProfileColorSlot = "primary" | "secondary" | "accent" | "blush" | "soft" | "deep" | "shadow" | "glow" | "ink";

export type StaffProfileDecorId =
  | "classic-sparkles"
  | "skull-flash"
  | "ember-nebula"
  | "cherry-bomb"
  | "cosmic-aura"
  | "butterfly-glow"
  | "chrome-stars"
  | "botanical-vines"
  | "lightning-pop"
  | "moon-magic"
  | "drip-graffiti"
  | "halo-bubbles"
  | "ribbon-hearts"
  | "flash-daggers";

export type StaffProfilePortfolioStyleId =
  | "default-service"
  | "rainbow-outline"
  | "clean-cream"
  | "black-bone"
  | "tattoo-flash"
  | "glossy-salon"
  | "spa-glow"
  | "ghost-glow"
  | "bone-yard"
  | "moonlit-aura"
  | "chrome-pop";

export type StaffProfileTheme = {
  template: StaffProfileTemplateId;
  decor?: StaffProfileDecorId;
  portfolioStyle?: StaffProfilePortfolioStyleId;
  colors?: Partial<Record<StaffProfileColorSlot, string>>;
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
  portfolioImages?: PortfolioImage[];
  profileTheme?: StaffProfileTheme;
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
    "This nail artist offers color-forward sets, detailed nail art, and appointment options for guests who want a look that fits their style.",
  hair:
    "This stylist helps guests plan cuts, color, transformations, and finishing details that match their look and routine.",
  tattoo:
    "This tattoo artist is available for consultation-first projects, flash ideas, placement planning, and portfolio review.",
  aesthetics:
    "This beauty specialist supports spa, skincare, brow, lash, and self-care services with a calm client-first approach.",
};

const categoryGallery: Record<ServiceCategorySlug, string[]> = {
  nails: ["Custom sets", "Chrome details", "Hand-painted art"],
  hair: ["Color work", "Cuts & styling", "Event-ready finishes"],
  tattoo: ["Custom concepts", "Flash designs", "Consultation planning"],
  aesthetics: ["Skincare", "Brows & lashes", "Relaxing treatments"],
};

const publicStaffNames: Record<number, string> = {
  1: "Luna Lacquer",
  2: "Juny",
  3: "Raven Ink",
  4: "Iris Aura",
  5: "Poppy Polish",
  6: "Serenity",
  7: "Ace Needle",
  8: "Sol Strands",
  9: "Sunny Shears",
  10: "Surge",
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
  "Schwebels is the Mild 2 Wild shop dog and official mascot — part of the studio personality, welcome energy, and brand moments without appearing as a bookable service provider.";

const serenityBio =
  "Hi! My name is Serenity, and I’m a nail tech at Mild2Wild. I attended the spa tech program at LCJVS during high school, and I’ve been licensed for about a year now. I absolutely love doing nail art — it’s definitely my favorite part of the job. I also really enjoy getting to know my clients and creating a fun, comfortable experience while they’re in my chair. My favorite colors are pink and burgundy, and outside of work I love spending time outdoors, enjoying the sunshine, and hanging out with my friends and family. I’m also obsessed with my dog, Twink, who’s a very spoiled chiweenie and basically my baby.";

const junyBio =
  "Hi I’m Juny! I was recently licensed in February and just graduated. I am an 18-year-old nail tech who is just in the beginning stages but a fast learner. I enjoy doing nails and hair, as those are my specialty skills and what I love to do. I plan on getting licensed for cosmetology to further my education in the beauty industry.";

const surgeBio =
  "I’m Surge, I’ve been an artist for as long as I can remember, and I’ve always loved bringing people’s ideas to life. Realism and capturing the small details others overlook have always been my passion. Throughout my life, people constantly told me I should do something with my art, but I never knew what that would be. I spent years working in factories and warehouses until a serious work injury changed everything. A herniated disc left me unable to do the heavy lifting and physical work I relied on to provide for my family. It was devastating, and I felt lost. While working as a waiter, several coworkers encouraged me to apply for a tattoo apprenticeship. Looking back, it felt like life was pushing me toward the path I was meant to take. Art had always been there — I just needed the push to pursue it. Today, tattooing allows me to combine my love for art with my passion for helping people. Whether it’s creating meaningful memorial pieces, covering scars, designing something unique, or simply helping someone feel more confident, I take pride in making every tattoo personal. For me, tattooing isn’t just artwork — it’s a way to connect with people and make a positive impact in their lives.";

const serenityPortfolioImages: PortfolioImage[] = [
  {
    src: "/staff/serenity/serenity-nails-01.jpg",
    alt: "Serenity nail art with pink flowers, blue accents, and gold details.",
    label: "Floral color set",
  },
  {
    src: "/staff/serenity/serenity-nails-02.jpg",
    alt: "Serenity nail art with burgundy abstract French tips and gold accents.",
    label: "Burgundy abstract tips",
  },
  {
    src: "/staff/serenity/serenity-nails-03.jpg",
    alt: "Serenity nail art with a black-and-white horror accent nail and red splatter details.",
    label: "Horror accent set",
  },
  {
    src: "/staff/serenity/serenity-nails-04.jpg",
    alt: "Serenity nail art with white sculpted tips, gold charms, and rhinestone accents.",
    label: "White and gold charms",
  },
  {
    src: "/staff/serenity/serenity-nails-05.jpg",
    alt: "Serenity nail art with bright pink and orange swirl tips.",
    label: "Pink orange swirls",
  },
  {
    src: "/staff/serenity/serenity-nails-06.jpg",
    alt: "Serenity nail art with burgundy French tips, glitter, and gold accents.",
    label: "Burgundy glitter French",
  },
  {
    src: "/staff/serenity/serenity-nails-07.jpg",
    alt: "Serenity nail art with black and nude nails, gold chrome frames, and star charms.",
    label: "Gold chrome accents",
  },
  {
    src: "/staff/serenity/serenity-nails-08.jpg",
    alt: "Serenity nail art with white French tips, blue dots, and colorful painted flowers.",
    label: "Blue daisy French",
  },
  {
    src: "/staff/serenity/serenity-nails-09.jpg",
    alt: "Serenity nail art with red floral details, white tips, and gold star accents.",
    label: "Red flower set",
  },
  {
    src: "/staff/serenity/serenity-nails-10.jpg",
    alt: "Serenity nail art with turquoise French tips, white florals, and gold bead accents.",
    label: "Turquoise floral tips",
  },
  {
    src: "/staff/serenity/serenity-nails-11.jpg",
    alt: "Serenity nail art with royal blue charms, rhinestones, and long sculpted tips.",
    label: "Royal blue charms",
  },
];

const staffSeed: Array<{ index: number; categorySlug?: ServiceCategorySlug; isMascot?: boolean }> = [
  { index: 1, categorySlug: "nails" },
  { index: 2, categorySlug: "nails" },
  { index: 3, categorySlug: "tattoo" },
  { index: 4, categorySlug: "aesthetics" },
  { index: 5, categorySlug: "nails" },
  { index: 6, categorySlug: "nails" },
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
  const isJuny = index === 2;
  const isSerenity = index === 6;
  const isSurge = index === 10;

  return {
    slug: `team-member-${paddedIndex}`,
    name: isMascot ? "Schwebels" : (publicStaffNames[index] ?? `${categoryTitles[categorySlug as ServiceCategorySlug]} ${paddedIndex}`),
    title: isMascot ? "Mascot" : categoryTitles[categorySlug as ServiceCategorySlug],
    bio: isMascot ? mascotBio : isJuny ? junyBio : isSerenity ? serenityBio : isSurge ? surgeBio : categoryBio[categorySlug as ServiceCategorySlug],
    photoUrl: `/staff/team-member-${paddedIndex}.jpg`,
    serviceCategorySlugs: categorySlug ? [categorySlug] : [],
    serviceSlugs: categorySlug ? serviceSlugsByCategory[categorySlug] : [],
    socialLinks: isMascot
      ? [
          { label: "Friendship APL", href: "https://friendshipapl.org" },
          { label: "View portfolio", href: "#portfolio" },
        ]
      : [
          { label: "Instagram coming soon", href: "#" },
          { label: "View portfolio", href: "#portfolio" },
        ],
    gallery: isMascot
      ? ["Shop dog mascot", "Schwebels story", "Tour-page cameo"]
      : isJuny
        ? ["Nail care", "Hair creativity", "Fast-learning beauty skills"]
      : isSerenity
        ? ["Nail art", "Pink and burgundy tones", "Comfortable client experience"]
      : isSurge
        ? ["Realism", "Fine details", "Personal meaningful pieces"]
        : categoryGallery[categorySlug as ServiceCategorySlug],
    portfolioImages: isSerenity ? serenityPortfolioImages : undefined,
    calendarColor: isJuny ? "#FF3131" : isSurge ? "#E23B16" : colors[categoryIndex % colors.length],
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
