import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageShell, SectionEyebrow } from "@/components/site";
import { serviceCategories, services, staffMembers } from "@/lib/studio-data";
import { readStoredStaffMembers } from "@/lib/staff-profile-overrides";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return staffMembers.map((staff) => ({ slug: staff.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const staff = (await readStoredStaffMembers(staffMembers)).find((item) => item.slug === slug);
  if (!staff) return { title: "Staff Member Not Found", robots: { index: false, follow: false } };

  const description = staff.isMascot
    ? `${staff.name} is the Mild 2 Wild shop dog and mascot.`
    : `Meet ${staff.name}, ${staff.title} at Mild 2 Wild, and request an appointment online.`;

  return {
    title: staff.isMascot ? `${staff.name} | Shop Mascot` : `${staff.name} | ${staff.title}`,
    description,
    alternates: { canonical: `/staff/${staff.slug}` },
    openGraph: {
      title: `${staff.name} | Mild 2 Wild`,
      description,
      url: `/staff/${staff.slug}`,
      images: [{ url: staff.photoUrl, alt: `${staff.name} profile image` }],
    },
  };
}

export default async function StaffProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const staff = (await readStoredStaffMembers(staffMembers)).find((item) => item.slug === slug);

  if (!staff) {
    return (
      <PageShell>
        <section className="mx-auto max-w-4xl px-5 py-24">
          <h1 className="brand-display text-5xl font-black uppercase">Staff member not found</h1>
        </section>
      </PageShell>
    );
  }

  const categories = serviceCategories.filter((category) => staff.serviceCategorySlugs.includes(category.slug));
  const staffServices = services.filter((service) => staff.serviceSlugs.includes(service.slug));
  const isMascot = !!staff.isMascot;
  const portraitPalette = getPortraitPalette(staff.name, staff.calendarColor);
  const panelStyle = getProfilePanelStyle(portraitPalette);
  const innerPanelStyle = getProfileInnerPanelStyle(portraitPalette);
  const bioIntro = staff.bio.match(/^(.+?[.!?])\s+/)?.[1] ?? "";
  const bioBody = bioIntro ? staff.bio.slice(bioIntro.length).trim() : staff.bio;
  const hasSkullBio = staff.name.toLowerCase() === "juny";
  const hasEmberBio = staff.name.toLowerCase() === "surge";

  return (
    <PageShell>
      <section className="mx-auto grid w-full max-w-full gap-8 overflow-hidden px-4 py-16 sm:px-5 lg:max-w-7xl lg:grid-cols-[0.82fr_1.18fr]">
        <div className="neon-card w-full max-w-[22rem] min-w-0 self-start overflow-hidden rounded-[3rem] p-5 lg:max-w-none" style={panelStyle}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.3rem] border border-white/10 bg-black">
            <Image
              src={staff.photoUrl}
              alt={`${staff.name} profile photo`}
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/35 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-white/60">{isMascot ? "Mascot profile" : "Meet me"}</p>
              <h1 className="brand-display mt-2 text-4xl font-black uppercase text-white md:text-5xl">{staff.name}</h1>
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {staff.socialLinks.map((link) => {
              const socialText = formatSocialLinkText(link.label);
              return (
                <a
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  aria-label={link.label}
                  className="inline-flex min-h-12 max-w-full items-center justify-center gap-3 rounded-full border border-white/15 px-5 py-3 text-center text-sm font-black text-white/70 transition hover:border-white/35 hover:bg-white/10 hover:text-white"
                >
                  <SocialLinkIcon label={link.label} />
                  {socialText ? <span>{socialText}</span> : null}
                </a>
              );
            })}
            {!isMascot ? (
              <>
                <Link
                  href={`/book?staff=${staff.slug}`}
                  className="inline-flex min-h-12 max-w-full items-center justify-center rounded-full border-[3px] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-black transition hover:-translate-y-0.5"
                  style={{ background: portraitPalette.accent, borderColor: portraitPalette.ink, boxShadow: `4px 5px 0 ${portraitPalette.shadow}` }}
                >
                  Book with me
                </Link>
                <Link
                  href={`/login?staff=${staff.slug}&next=${encodeURIComponent(`/dashboard/staff/${staff.slug}/edit`)}`}
                  className="inline-flex min-h-12 max-w-full items-center justify-center rounded-full border-[3px] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.16em] text-black transition hover:-translate-y-0.5"
                  style={{ background: portraitPalette.blush, borderColor: portraitPalette.ink, boxShadow: `4px 5px 0 ${portraitPalette.secondary}` }}
                >
                  Staff login
                </Link>
              </>
            ) : null}
          </div>
        </div>

        <div className="w-full max-w-[22rem] min-w-0 overflow-hidden lg:max-w-none">
          <SectionEyebrow color={portraitPalette.primary}>{isMascot ? "Mascot profile" : "Personal profile"}</SectionEyebrow>
          <h2 className="brand-display text-5xl font-black uppercase md:text-7xl">{staff.name}</h2>
          <p className="mt-3 text-xl font-bold text-white/70">{staff.title}</p>
          <div className="relative mt-6 max-w-full overflow-hidden rounded-[2rem] border-[3px] p-5 md:max-w-3xl" style={getBioPanelStyle(portraitPalette)}>
            {hasSkullBio ? (
              <>
                <SkullSplash className="-right-5 top-3 h-24 w-24 opacity-[0.18]" palette={portraitPalette} rotate={12} />
                <SkullSplash className="-bottom-4 left-4 h-20 w-20 opacity-[0.14]" palette={portraitPalette} rotate={-18} />
                <span aria-hidden="true" className="pointer-events-none absolute bottom-7 right-9 h-14 w-24 rounded-[60%_40%_65%_35%] border-[3px] opacity-15" style={{ borderColor: portraitPalette.primary, transform: "rotate(-12deg)" }} />
              </>
            ) : hasEmberBio ? (
              <>
                <EmberNebula className="-right-10 -top-8 h-40 w-40 opacity-[0.28]" palette={portraitPalette} rotate={10} />
                <EmberNebula className="-bottom-10 left-2 h-36 w-36 opacity-[0.22]" palette={portraitPalette} rotate={-16} />
                <span aria-hidden="true" className="pointer-events-none absolute right-10 top-8 h-2 w-2 rounded-full opacity-70" style={{ background: portraitPalette.glow, boxShadow: `0 0 16px ${portraitPalette.glow}, 28px 22px 0 -1px ${portraitPalette.accent}, -42px 80px 0 -1px ${portraitPalette.primary}` }} />
              </>
            ) : (
              <>
                <span aria-hidden="true" className="pointer-events-none absolute -right-4 top-4 text-6xl font-black leading-none opacity-20" style={{ color: portraitPalette.accent }}>✦</span>
                <span aria-hidden="true" className="pointer-events-none absolute bottom-5 right-7 h-14 w-20 rounded-[60%_40%_65%_35%] border-[3px] opacity-20" style={{ borderColor: portraitPalette.primary, transform: "rotate(-18deg)" }} />
                <span aria-hidden="true" className="pointer-events-none absolute -bottom-3 left-6 text-5xl font-black leading-none opacity-15" style={{ color: portraitPalette.secondary }}>♡</span>
              </>
            )}
            <p className="relative break-words text-[1.06rem] font-semibold leading-8 tracking-[0.01em] text-[#4d4543] md:text-lg">
              {bioIntro ? <span className="marker-script mr-1 text-[1.35em] font-black leading-none" style={{ color: portraitPalette.deep }}>{bioIntro}</span> : null}
              {bioBody}
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {isMascot ? (
              <span className="rounded-full bg-lime-300 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-black">
                Non-bookable mascot
              </span>
            ) : null}
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/services/${category.slug}`}
                className="rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-black"
                style={{ background: category.accent }}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="mt-10 grid max-w-full gap-5 overflow-hidden md:grid-cols-2">
            {isMascot ? (
              <section className="neon-card rounded-[2rem] p-6">
                <h3 className="brand-display text-2xl font-black uppercase">Mascot role</h3>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-lime-300/25 bg-lime-300/10 p-4 text-lime-50">
                    ✦ Featured on the staff page, tour page, and brand moments.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/68">
                    ✦ Not available for appointments or service selection.
                  </div>
                </div>
              </section>
            ) : (
              <section className="neon-card rounded-[2rem] p-6" style={panelStyle}>
                <h3 className="brand-display text-2xl font-black uppercase">Services offered</h3>
                <div className="mt-5 grid gap-3">
                  {staffServices.map((service) => {
                    return (
                      <Link
                        href={`/services/${service.categorySlug}`}
                        key={service.slug}
                        className="rounded-2xl border-[2px] p-4 text-[#4d4543] transition hover:-translate-y-0.5"
                        style={innerPanelStyle}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="font-black">{service.name}</span>
                          <span className="rounded-full px-2 py-1 text-xs font-black" style={{ color: portraitPalette.primary, background: portraitPalette.blush }}>
                            {service.durationMinutes}m
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-[#6b625b]">{service.priceLabel}</p>
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            <section className="neon-card rounded-[2rem] p-6" style={panelStyle}>
              <h3 className="brand-display text-2xl font-black uppercase">Portfolio notes</h3>
              <div className="mt-5 grid gap-3">
                {staff.gallery.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border-[2px] p-4 text-[#4d4543]" style={innerPanelStyle}>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-black text-sm font-black" style={{ background: portraitPalette.accent }}>
                      ✦
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {staff.portfolioImages?.length ? (
              <section className="neon-card max-w-full overflow-hidden rounded-[2rem] p-4 md:col-span-2 md:p-6" style={panelStyle}>
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: portraitPalette.primary }}>Recent work</p>
                    <h3 className="brand-display mt-2 text-2xl font-black uppercase md:text-3xl">Nail portfolio</h3>
                  </div>
                  <p className="max-w-full break-words text-sm font-medium leading-6 text-[#625a54] md:max-w-xl">
                    A few examples of {staff.name}&apos;s nail art, color, and detail work.
                  </p>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {staff.portfolioImages.map((image) => (
                    <figure key={image.src} className="group flex max-w-full flex-col overflow-hidden rounded-[1.6rem] border-[3px] bg-[#fff7e8]" style={{ borderColor: portraitPalette.ink, boxShadow: getRainbowPortfolioShadow() }}>
                      <div className="relative aspect-[4/5] overflow-hidden bg-[#fff7e8]">
                        <Image
                          src={image.src}
                          alt={image.alt}
                          fill
                          sizes="(min-width: 1024px) 20vw, (min-width: 640px) 45vw, 100vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      </div>
                      <figcaption className="grow border-t-[3px] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-black" style={{ borderColor: portraitPalette.ink, background: `linear-gradient(135deg, ${portraitPalette.blush}, #fff7e8 72%)` }}>
                        {image.label}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </section>
            ) : null}

            {isMascot ? (
              <section className="neon-card rounded-[2rem] p-6 md:col-span-2">
                <h3 className="brand-display text-2xl font-black uppercase">Brand mascot only</h3>
                <p className="mt-3 max-w-3xl text-white/62">
                  {staff.name} is here for brand personality only. Guests can enjoy the mascot profile, but the shop dog cannot be booked for appointments or selected as a service provider.
                </p>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function getPortraitPalette(name: string, fallback: string) {
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
      ink: "#241f1a",
    };
  }

  return {
    primary: fallback,
    secondary: "#7A6CFF",
    accent: fallback,
    blush: "#FFEAF7",
    soft: "#FFF7E8",
    deep: "#17130f",
    shadow: fallback,
    glow: "#FFD35A",
    ink: "#241f1a",
  };
}

function getProfilePanelStyle(palette: ReturnType<typeof getPortraitPalette>) {
  return {
    borderColor: palette.ink,
    background: `radial-gradient(circle at 18% 0%, ${palette.blush} 0, transparent 14rem), radial-gradient(circle at 96% 18%, ${palette.secondary}22 0, transparent 12rem), linear-gradient(145deg, #fffdf5 0%, ${palette.soft} 68%, ${palette.blush} 100%)`,
    boxShadow: `8px 9px 0 ${palette.shadow}, 0 26px 70px ${palette.primary}30`,
  };
}

function getProfileInnerPanelStyle(palette: ReturnType<typeof getPortraitPalette>) {
  return {
    borderColor: `${palette.primary}45`,
    background: `linear-gradient(135deg, rgba(255, 253, 245, 0.94), ${palette.blush}88)`,
    boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.5), 0 10px 24px ${palette.primary}14`,
  };
}

function getBioPanelStyle(palette: ReturnType<typeof getPortraitPalette>) {
  if (palette.primary === "#E23B16") {
    return {
      borderColor: palette.ink,
      background: `radial-gradient(circle at 88% 14%, ${palette.glow}40, transparent 8rem), radial-gradient(circle at 12% 85%, ${palette.primary}30, transparent 10rem), linear-gradient(135deg, rgba(255,247,232,0.96), ${palette.blush} 54%, #ffd3a1 100%)`,
      boxShadow: `6px 7px 0 ${palette.shadow}, 0 0 0 5px ${palette.accent}26, inset 0 0 0 1px rgba(255,255,255,0.55)`,
    };
  }

  return {
    borderColor: palette.ink,
    background: `linear-gradient(135deg, rgba(255,253,245,0.9), ${palette.blush} 74%), radial-gradient(circle at 92% 20%, ${palette.secondary}20, transparent 12rem)`,
    boxShadow: `6px 7px 0 ${palette.shadow}, inset 0 0 0 1px rgba(255,255,255,0.48)`,
  };
}

function getRainbowPortfolioShadow() {
  return [
    "3px 4px 0 #FF4FB8",
    "5px 6px 0 #FF7A45",
    "7px 8px 0 #FFD54A",
    "9px 10px 0 #4DDF7C",
    "11px 12px 0 #30C8FF",
    "13px 14px 0 #8A5CFF",
    "0 22px 50px rgba(233, 35, 116, 0.18)",
  ].join(", ");
}

function SkullSplash({ className, palette, rotate }: { className: string; palette: ReturnType<typeof getPortraitPalette>; rotate: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 96 96"
      className={`pointer-events-none absolute ${className}`}
      style={{ color: palette.secondary, transform: `rotate(${rotate}deg)` }}
      fill="none"
    >
      <path
        d="M19 45c0-20 13-34 30-34s30 14 30 34c0 10-3 18-10 23v8c0 5-3 8-8 8H37c-5 0-8-3-8-8v-8c-7-5-10-13-10-23Z"
        fill="currentColor"
      />
      <path
        d="M29 45c5-8 16-7 18 1-5 8-16 8-18-1Zm22 1c2-8 13-9 18-1-2 9-13 9-18 1Zm-10 15 7-8 7 8H41Z"
        fill={palette.blush}
      />
      <path d="M38 78v-9m8 9v-9m8 9v-9m8 8v-8" stroke={palette.blush} strokeWidth="4" strokeLinecap="round" />
      <path d="M13 25c7 1 10 4 13 10M81 24c-8 2-12 5-15 12M17 76c5-1 9-4 12-8" stroke={palette.primary} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

function EmberNebula({ className, palette, rotate }: { className: string; palette: ReturnType<typeof getPortraitPalette>; rotate: number }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 128 128"
      className={`pointer-events-none absolute ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      fill="none"
    >
      <path
        d="M18 72c16-34 43-48 76-39 18 5 25 19 16 33-8 12-25 12-36 24-12 13-22 26-41 20-17-6-22-22-15-38Z"
        fill={palette.primary}
        opacity="0.42"
      />
      <path
        d="M34 78c11-22 31-31 55-24 13 4 18 13 11 23-6 8-18 8-27 17-8 9-16 17-29 13-12-4-15-17-10-29Z"
        fill={palette.accent}
        opacity="0.36"
      />
      <path d="M22 35l5 11 12 2-10 7 2 12-9-7-11 6 4-12-9-8 12-1 4-10Zm79 47 4 8 9 1-7 5 1 9-7-5-8 4 3-9-7-6 9-1 3-6Z" fill={palette.glow} opacity="0.72" />
      <circle cx="91" cy="25" r="3" fill={palette.glow} opacity="0.8" />
      <circle cx="48" cy="38" r="2" fill={palette.glow} opacity="0.7" />
      <circle cx="108" cy="102" r="2.5" fill={palette.accent} opacity="0.55" />
    </svg>
  );
}

function formatSocialLinkText(label: string) {
  const normalized = label.toLowerCase();
  if (normalized === "instagram" || normalized === "tiktok") return "";
  if (normalized === "instagram coming soon" || normalized === "tiktok coming soon") return "Coming soon";
  return label;
}

function SocialLinkIcon({ label }: { label: string }) {
  const normalized = label.toLowerCase();
  if (normalized.includes("instagram")) return <InstagramLogo />;
  if (normalized.includes("tiktok")) return <TikTokLogo />;
  return null;
}

function InstagramLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5.5" stroke="#FF4FB8" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="4.1" stroke="#FFD35A" strokeWidth="2.2" />
      <circle cx="17.2" cy="6.8" r="1.35" fill="#8A5CFF" />
    </svg>
  );
}

function TikTokLogo() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6 shrink-0" fill="none">
      <path d="M14.7 3v11.2a4.35 4.35 0 1 1-4.35-4.35c.35 0 .69.04 1.02.12v3.1a1.48 1.48 0 1 0 1.05 1.42V3h2.28Z" stroke="#25F4EE" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.7 3c.43 2.55 1.95 4.16 4.5 4.48v3.07c-1.65-.04-3.12-.55-4.5-1.55" stroke="#FE2C55" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.7 3v11.2a4.35 4.35 0 1 1-4.35-4.35c.35 0 .69.04 1.02.12v3.1a1.48 1.48 0 1 0 1.05 1.42V3h2.28Z" stroke="white" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
