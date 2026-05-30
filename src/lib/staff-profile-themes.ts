import type { StaffMember, StaffProfileColorSlot, StaffProfileDecorId, StaffProfileTemplateId, StaffProfileTheme } from "./studio-data";

export type ProfilePalette = {
  primary: string;
  secondary: string;
  accent: string;
  blush: string;
  soft: string;
  deep: string;
  shadow: string;
  glow: string;
  ink: string;
};

type StaffProfileTemplate = {
  id: StaffProfileTemplateId;
  name: string;
  description: string;
  palette: ProfilePalette;
};

type StaffProfileDecorTemplate = {
  id: StaffProfileDecorId;
  name: string;
  description: string;
};

export const staffProfileColorSlots: Array<{ key: StaffProfileColorSlot; label: string; description: string }> = [
  { key: "primary", label: "Primary", description: "Main outline/accent color." },
  { key: "secondary", label: "Secondary", description: "Supporting accent and soft glow color." },
  { key: "accent", label: "CTA accent", description: "Buttons, small badges, and highlight fills." },
  { key: "blush", label: "Background wash", description: "Soft panel tint behind the cream cards." },
  { key: "soft", label: "Card fill", description: "Main warm card surface." },
  { key: "deep", label: "Deep text", description: "Script/accent text color." },
  { key: "shadow", label: "Sticker shadow", description: "Offset comic-card shadow color." },
  { key: "glow", label: "Glow", description: "Small sparkle and ambient glow color." },
  { key: "ink", label: "Ink / outline", description: "Comic outline and hard border color." },
];

export const staffProfileDecorTemplates: StaffProfileDecorTemplate[] = [
  { id: "classic-sparkles", name: "Classic Sparkles", description: "The default Mild2Wild twinkles, soft heart, and hand-drawn bubble loop." },
  { id: "skull-flash", name: "Skull Flash", description: "Juny-style cute punk skulls with flash-sheet energy behind the bio card." },
  { id: "ember-nebula", name: "Ember Nebula", description: "Warm smoky art-clouds, glowing dots, and hand-drawn starbursts." },
  { id: "cherry-bomb", name: "Cherry Bomb", description: "Playful cherries, round pop shapes, and candy-red salon attitude." },
  { id: "cosmic-aura", name: "Cosmic Aura", description: "Orbit rings, small planets, and dreamy cosmic specks for a mystic vibe." },
  { id: "butterfly-glow", name: "Butterfly Glow", description: "Soft butterfly silhouettes and airy glow marks for a sweet beauty feel." },
  { id: "chrome-stars", name: "Chrome Stars", description: "Sharp glossy starbursts and shine strokes like fresh chrome nail art." },
  { id: "botanical-vines", name: "Botanical Vines", description: "Leafy hand-drawn vines and garden accents for earthy profiles." },
  { id: "lightning-pop", name: "Lightning Pop", description: "Comic bolts and high-energy shapes for bold color personalities." },
  { id: "moon-magic", name: "Moon Magic", description: "Crescent moons, tiny stars, and dreamy night-salon softness." },
  { id: "drip-graffiti", name: "Drip Graffiti", description: "Paint drips, street-art dots, and sticker-like edge energy." },
  { id: "halo-bubbles", name: "Halo Bubbles", description: "Floating spa bubbles, halos, and calming rounded glow shapes." },
  { id: "ribbon-hearts", name: "Ribbon Hearts", description: "Ribbon loops and sweet hearts for cute nail or hair profiles." },
  { id: "flash-daggers", name: "Flash Daggers", description: "Tiny tattoo-flash daggers and sparks with a sharper shop-wall vibe." },
];

export const staffProfileTemplates: StaffProfileTemplate[] = [
  {
    id: "recommended",
    name: "Recommended",
    description: "Uses the profile's service/portrait colors with Mild2Wild's cream comic-card style.",
    palette: {
      primary: "#F06BD6",
      secondary: "#7A6CFF",
      accent: "#F06BD6",
      blush: "#FFEAF7",
      soft: "#FFF7E8",
      deep: "#17130F",
      shadow: "#F06BD6",
      glow: "#FFD35A",
      ink: "#241F1A",
    },
  },
  {
    id: "tattoo-flash-wall",
    name: "Tattoo Flash Wall",
    description: "Moody tattoo shop energy: bone cards, teal flash, charcoal ink, controlled contrast.",
    palette: {
      primary: "#12343B",
      secondary: "#14B8A6",
      accent: "#38E8D6",
      blush: "#E6FFFA",
      soft: "#FFF7EA",
      deep: "#0E262B",
      shadow: "#18353B",
      glow: "#A7FFF4",
      ink: "#15151F",
    },
  },
  {
    id: "black-bone",
    name: "Black + Bone",
    description: "Minimal tattoo flash palette with creamy panels, black outlines, and muted shadows.",
    palette: {
      primary: "#1D1A18",
      secondary: "#B7A58A",
      accent: "#F6E7C8",
      blush: "#F3E7D3",
      soft: "#FFF8EA",
      deep: "#1D1412",
      shadow: "#5B5145",
      glow: "#F7DFA8",
      ink: "#17120F",
    },
  },
  {
    id: "crimson-ink",
    name: "Crimson Ink",
    description: "Tattoo-friendly crimson, black, and parchment without the bright orange cast.",
    palette: {
      primary: "#7F1D1D",
      secondary: "#111827",
      accent: "#B91C1C",
      blush: "#F9E4D5",
      soft: "#FFF7EA",
      deep: "#4A0E0E",
      shadow: "#3B0A0A",
      glow: "#E7C478",
      ink: "#1D1412",
    },
  },
  {
    id: "neon-street",
    name: "Neon Street",
    description: "Bright cyan/purple street-art accents for artists who want a louder profile.",
    palette: {
      primary: "#30F2FF",
      secondary: "#7A6CFF",
      accent: "#57FFD6",
      blush: "#E4FBFF",
      soft: "#FFF8EA",
      deep: "#161421",
      shadow: "#7A6CFF",
      glow: "#B8FFF8",
      ink: "#15151F",
    },
  },
  {
    id: "pastel-pop",
    name: "Pastel Pop",
    description: "Classic Mild2Wild candy colors with playful pink/purple energy.",
    palette: {
      primary: "#F06BD6",
      secondary: "#8A5CFF",
      accent: "#FF8BE8",
      blush: "#FFE0EF",
      soft: "#FFF3E4",
      deep: "#6F1F63",
      shadow: "#D935A4",
      glow: "#FFD35A",
      ink: "#241F1A",
    },
  },
  {
    id: "glossy-salon",
    name: "Glossy Salon",
    description: "Gold, amber, and shine-forward styling for hair profiles.",
    palette: {
      primary: "#FFE45C",
      secondary: "#FF9E3D",
      accent: "#FFD166",
      blush: "#FFF1B8",
      soft: "#FFF8D8",
      deep: "#5B3208",
      shadow: "#C46A18",
      glow: "#FFF2A8",
      ink: "#2A1712",
    },
  },
  {
    id: "spa-glow",
    name: "Spa Glow",
    description: "Soft lavender and fresh green glow for aesthetics/spa profiles.",
    palette: {
      primary: "#A95CFF",
      secondary: "#79D94D",
      accent: "#DDF8C8",
      blush: "#F4E7FF",
      soft: "#F8EEFF",
      deep: "#4E267A",
      shadow: "#79D94D",
      glow: "#E8FFB8",
      ink: "#241F1A",
    },
  },
  {
    id: "rainbow-nails",
    name: "Rainbow Nails",
    description: "Rainbow-outline nail-card energy with pink, burgundy, aqua, and cream.",
    palette: {
      primary: "#E92374",
      secondary: "#13B8E8",
      accent: "#FF65C8",
      blush: "#FFE0EF",
      soft: "#FFF3E4",
      deep: "#6F1F63",
      shadow: "#D935A4",
      glow: "#FFD35A",
      ink: "#241F1A",
    },
  },
  {
    id: "dark-comic",
    name: "Dark Comic",
    description: "High-contrast comic style with deep violet and hot accents.",
    palette: {
      primary: "#7C3AED",
      secondary: "#111827",
      accent: "#FF4FB8",
      blush: "#F0E7FF",
      soft: "#FFF7EA",
      deep: "#2E1065",
      shadow: "#1E1B4B",
      glow: "#FFB8EA",
      ink: "#15151F",
    },
  },
  {
    id: "clean-minimal",
    name: "Clean Minimal",
    description: "Quiet cream panels with restrained outlines for a less loud profile.",
    palette: {
      primary: "#6B625B",
      secondary: "#CBBBA7",
      accent: "#F7E6C7",
      blush: "#F7EFE4",
      soft: "#FFFDF5",
      deep: "#3F3732",
      shadow: "#9D8F82",
      glow: "#F4DFAE",
      ink: "#241F1A",
    },
  },
  {
    id: "gold-luxe",
    name: "Gold Luxe",
    description: "Rich gold and warm caramel for polished, premium profile cards.",
    palette: {
      primary: "#D99A19",
      secondary: "#7C3F13",
      accent: "#FFD166",
      blush: "#FFEBC2",
      soft: "#FFF8E4",
      deep: "#5A2D0A",
      shadow: "#B76516",
      glow: "#FFE998",
      ink: "#2A1712",
    },
  },
  {
    id: "lavender-aura",
    name: "Lavender Aura",
    description: "Lavender, violet, and mint aura styling for softer beauty profiles.",
    palette: {
      primary: "#B47CFF",
      secondary: "#87E8D5",
      accent: "#C9A8FF",
      blush: "#F0E5FF",
      soft: "#FFF7EA",
      deep: "#5B2A86",
      shadow: "#8A5CFF",
      glow: "#D6FFF6",
      ink: "#241F1A",
    },
  },
];

const templatesById = new Map(staffProfileTemplates.map((template) => [template.id, template]));
const decorTemplatesById = new Map(staffProfileDecorTemplates.map((template) => [template.id, template]));

export function getStaffProfileTemplate(templateId: string | undefined) {
  return templatesById.get(templateId as StaffProfileTemplateId) ?? templatesById.get("recommended")!;
}

export function getStaffProfileDecorTemplate(decorId: string | undefined) {
  return decorTemplatesById.get(decorId as StaffProfileDecorId) ?? decorTemplatesById.get("classic-sparkles")!;
}

export function getDefaultProfileTemplateId(staff: Pick<StaffMember, "name" | "serviceCategorySlugs">): StaffProfileTemplateId {
  if (staff.name.toLowerCase() === "surge") return "crimson-ink";
  const categorySlug = staff.serviceCategorySlugs[0];
  if (categorySlug === "tattoo") return "tattoo-flash-wall";
  if (categorySlug === "hair") return "glossy-salon";
  if (categorySlug === "aesthetics") return "spa-glow";
  return "rainbow-nails";
}

export function getDefaultProfileDecorId(staff: Pick<StaffMember, "name" | "serviceCategorySlugs">): StaffProfileDecorId {
  const name = staff.name.toLowerCase();
  if (name === "juny") return "skull-flash";
  if (name === "surge") return "ember-nebula";
  const categorySlug = staff.serviceCategorySlugs[0];
  if (categorySlug === "tattoo") return "flash-daggers";
  if (categorySlug === "hair") return "chrome-stars";
  if (categorySlug === "aesthetics") return "halo-bubbles";
  return "classic-sparkles";
}

export function getDefaultPortraitPalette(name: string, fallback: string): ProfilePalette {
  if (name.toLowerCase() === "surge") {
    return {
      primary: "#E23B16",
      secondary: "#8B1515",
      accent: "#FF7A1A",
      blush: "#FFE4D0",
      soft: "#FFF4DF",
      deep: "#6C120C",
      shadow: "#9F1717",
      glow: "#FFD05A",
      ink: "#2A1712",
    };
  }

  if (name.toLowerCase() === "juny") {
    return {
      primary: "#FF3131",
      secondary: "#111111",
      accent: "#FF4A4A",
      blush: "#FFE1DA",
      soft: "#FFF5E8",
      deep: "#7A0808",
      shadow: "#B81212",
      glow: "#FFB35A",
      ink: "#D32222",
    };
  }

  if (name.toLowerCase() === "serenity") {
    return {
      primary: "#E92374",
      secondary: "#13B8E8",
      accent: "#FF65C8",
      blush: "#FFE0EF",
      soft: "#FFF3E4",
      deep: "#6F1F63",
      shadow: "#D935A4",
      glow: "#FFD35A",
      ink: "#241F1A",
    };
  }

  return {
    primary: fallback,
    secondary: "#7A6CFF",
    accent: fallback,
    blush: "#FFEAF7",
    soft: "#FFF7E8",
    deep: "#17130F",
    shadow: fallback,
    glow: "#FFD35A",
    ink: "#241F1A",
  };
}

export function resolveStaffProfileTheme(staff: StaffMember) {
  const defaultPalette = getDefaultPortraitPalette(staff.name, staff.calendarColor);
  const templateId = staff.profileTheme?.template ?? getDefaultProfileTemplateId(staff);
  const template = getStaffProfileTemplate(templateId);
  const decor = getStaffProfileDecorTemplate(staff.profileTheme?.decor ?? getDefaultProfileDecorId(staff));
  const basePalette = template.id === "recommended" ? defaultPalette : template.palette;
  return {
    template,
    decor,
    palette: {
      ...basePalette,
      ...(staff.profileTheme?.colors ?? {}),
    },
  };
}

export function normalizeStaffProfileTheme(value: unknown, fallbackTemplate: StaffProfileTemplateId = "recommended"): StaffProfileTheme {
  if (!value || typeof value !== "object") return { template: fallbackTemplate, colors: {} };
  const record = value as Record<string, unknown>;
  const template = templatesById.has(record.template as StaffProfileTemplateId) ? (record.template as StaffProfileTemplateId) : fallbackTemplate;
  const decor = decorTemplatesById.has(record.decor as StaffProfileDecorId) ? (record.decor as StaffProfileDecorId) : undefined;
  const colorRecord = record.colors && typeof record.colors === "object" && !Array.isArray(record.colors) ? (record.colors as Record<string, unknown>) : record;
  const colors = Object.fromEntries(
    staffProfileColorSlots.flatMap(({ key }) => {
      const color = normalizeHexColor(colorRecord[key]);
      return color ? [[key, color]] : [];
    }),
  ) as StaffProfileTheme["colors"];
  return { template, ...(decor ? { decor } : {}), colors };
}

function normalizeHexColor(value: unknown) {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value.trim()) ? value.trim().toUpperCase() : "";
}
