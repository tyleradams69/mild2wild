import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageShell, SectionEyebrow } from "@/components/site";
import { services, staffMembers, type StaffProfileDecorId } from "@/lib/studio-data";
import { getDefaultPortraitPalette, resolveStaffProfileTheme, type ProfilePalette } from "@/lib/staff-profile-themes";
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

  const staffServices = services.filter((service) => staff.serviceSlugs.includes(service.slug));
  const isMascot = !!staff.isMascot;
  const theme = resolveStaffProfileTheme(staff);
  const portraitPalette = theme.palette;
  const bioPalette = hasSurgeName(staff.name) ? getDefaultPortraitPalette(staff.name, staff.calendarColor) : portraitPalette;
  const panelStyle = getProfilePanelStyle(portraitPalette);
  const innerPanelStyle = getProfileInnerPanelStyle(portraitPalette);
  const bioIntro = staff.bio.match(/^(.+?[.!?])\s+/)?.[1] ?? "";
  const bioBody = bioIntro ? staff.bio.slice(bioIntro.length).trim() : staff.bio;
  const portfolioTheme = getPortfolioTheme(staff.serviceCategorySlugs[0] ?? "nails", portraitPalette);

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
          <div className="relative mt-6 max-w-full overflow-hidden rounded-[2rem] border-[3px] p-5 md:max-w-3xl" style={getBioPanelStyle(bioPalette)}>
            <BioPanelDecoration decorId={theme.decor.id} palette={bioPalette} />
            <p className="relative break-words text-[1.06rem] font-semibold leading-8 tracking-[0.01em] text-[#4d4543] md:text-lg">
              {bioIntro ? <span className="marker-script mr-1 text-[1.35em] font-black leading-none" style={{ color: bioPalette.deep }}>{bioIntro}</span> : null}
              {bioBody}
            </p>
          </div>

          {isMascot ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full bg-lime-300 px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-black">
                Non-bookable mascot
              </span>
            </div>
          ) : null}

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
                <div className="mt-5 grid max-h-[18.5rem] gap-3 overflow-y-auto overscroll-contain pr-1">
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

            <section className="neon-card scroll-mt-28 rounded-[2rem] p-6" style={panelStyle}>
              <h3 className="brand-display text-2xl font-black uppercase">3 things about me</h3>
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

        {!isMascot ? (
          <section id="portfolio" className="neon-card max-w-full scroll-mt-28 overflow-hidden rounded-[2rem] p-4 lg:col-span-2 md:p-6" style={panelStyle}>
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em]" style={{ color: portfolioTheme.accent }}>{portfolioTheme.eyebrow}</p>
                <h3 className="brand-display mt-2 text-2xl font-black uppercase md:text-3xl">{portfolioTheme.heading}</h3>
              </div>
              <p className="max-w-full break-words text-sm font-medium leading-6 text-[#625a54] md:max-w-xl">
                {portfolioTheme.description(staff.name)}
              </p>
            </div>
            {staff.portfolioImages?.length ? (
              <div className="mt-6 grid max-h-[94rem] gap-4 overflow-y-auto overscroll-contain pr-1 sm:max-h-[82rem] sm:grid-cols-2 lg:max-h-[80rem] lg:grid-cols-4">
                {staff.portfolioImages.map((image) => (
                  <figure key={image.src} className="group flex max-w-full flex-col overflow-hidden rounded-[1.6rem] border-[3px]" style={portfolioTheme.cardStyle}>
                    <div className="relative aspect-[4/5] overflow-hidden" style={{ background: portfolioTheme.imageBackground }}>
                      <Image
                        src={image.src}
                        alt={image.alt}
                        fill
                        sizes="(min-width: 1024px) 20vw, (min-width: 640px) 45vw, 100vw"
                        className={portfolioTheme.imageClassName}
                      />
                      {portfolioTheme.overlay}
                    </div>
                    <figcaption className="grow border-t-[3px] px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-black" style={portfolioTheme.captionStyle}>
                      {image.label}
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.8rem] border-[3px] p-6" style={portfolioTheme.emptyStyle}>
                <p className="brand-display text-2xl font-black uppercase text-black">Portfolio ready for uploads</p>
                <p className="mt-2 max-w-2xl text-sm font-bold leading-6 text-[#5f5650]">
                  {staff.name} can log in from a phone, open the profile editor, and add photos from the camera roll whenever their work examples are ready.
                </p>
                <Link href={`/login?staff=${staff.slug}&next=${encodeURIComponent(`/dashboard/staff/${staff.slug}/edit`)}`} className="mt-4 inline-flex rounded-full border-[3px] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:-translate-y-0.5" style={{ background: portfolioTheme.accent, borderColor: portfolioTheme.ink, boxShadow: `4px 5px 0 ${portfolioTheme.shadow}` }}>
                  Edit portfolio
                </Link>
              </div>
            )}
          </section>
        ) : null}
      </section>
    </PageShell>
  );
}

function hasSurgeName(name: string) {
  return name.toLowerCase() === "surge";
}

function getProfilePanelStyle(palette: ProfilePalette) {
  return {
    borderColor: palette.ink,
    background: `radial-gradient(circle at 18% 0%, ${palette.blush} 0, transparent 14rem), radial-gradient(circle at 96% 18%, ${palette.secondary}22 0, transparent 12rem), linear-gradient(145deg, #fffdf5 0%, ${palette.soft} 68%, ${palette.blush} 100%)`,
    boxShadow: `8px 9px 0 ${palette.shadow}, 0 26px 70px ${palette.primary}30`,
  };
}

function getProfileInnerPanelStyle(palette: ProfilePalette) {
  return {
    borderColor: `${palette.primary}45`,
    background: `linear-gradient(135deg, rgba(255, 253, 245, 0.94), ${palette.blush}88)`,
    boxShadow: `inset 0 0 0 1px rgba(255,255,255,0.5), 0 10px 24px ${palette.primary}14`,
  };
}

function getBioPanelStyle(palette: ProfilePalette) {
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

function getPortfolioTheme(categorySlug: string, palette: ProfilePalette) {
  if (categorySlug === "tattoo") {
    return {
      eyebrow: "Flash + fine line work",
      heading: "Tattoo portfolio",
      accent: palette.accent,
      ink: palette.ink,
      shadow: palette.shadow,
      imageBackground: palette.ink,
      imageClassName: "object-cover grayscale contrast-110 transition duration-500 group-hover:scale-105 group-hover:grayscale-0",
      description: (name: string) => `A moody flash-wall showcase for ${name}'s tattoo concepts, linework, shading, and finished pieces.`,
      cardStyle: {
        borderColor: palette.ink,
        background: `linear-gradient(145deg, ${palette.ink}, ${palette.deep} 62%, ${palette.accent} 140%)`,
        boxShadow: `6px 7px 0 ${palette.accent}, 10px 11px 0 ${palette.shadow}, 0 24px 54px ${palette.primary}30`,
      },
      captionStyle: {
        borderColor: palette.ink,
        background: `linear-gradient(135deg, ${palette.accent}, ${palette.secondary})`,
      },
      emptyStyle: {
        borderColor: palette.ink,
        background: `radial-gradient(circle at 10% 0%, ${palette.accent}44, transparent 12rem), linear-gradient(135deg, ${palette.soft}, ${palette.blush})`,
        boxShadow: `6px 7px 0 ${palette.shadow}`,
      },
      overlay: <span aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(circle at 18% 14%, ${palette.accent}33, transparent 9rem), linear-gradient(145deg, transparent, rgba(0,0,0,0.22))` }} />,
    };
  }

  if (categorySlug === "hair") {
    return {
      eyebrow: "Color, shape + shine",
      heading: "Hair portfolio",
      accent: palette.accent,
      ink: palette.ink,
      shadow: palette.shadow,
      imageBackground: palette.blush,
      imageClassName: "object-cover saturate-125 transition duration-500 group-hover:scale-105 group-hover:saturate-150",
      description: (name: string) => `A glossy salon lookbook for ${name}'s color work, cuts, styling, and finished hair moments.`,
      cardStyle: {
        borderColor: palette.ink,
        background: `linear-gradient(145deg, ${palette.soft}, ${palette.accent} 70%, ${palette.secondary} 130%)`,
        boxShadow: `5px 6px 0 ${palette.accent}, 9px 10px 0 ${palette.shadow}, 0 24px 54px ${palette.primary}2E`,
      },
      captionStyle: {
        borderColor: palette.ink,
        background: `linear-gradient(135deg, ${palette.accent}, ${palette.primary} 74%, ${palette.secondary})`,
      },
      emptyStyle: {
        borderColor: palette.ink,
        background: `radial-gradient(circle at 85% 5%, ${palette.accent}66, transparent 11rem), linear-gradient(135deg, ${palette.soft}, ${palette.blush})`,
        boxShadow: `6px 7px 0 ${palette.shadow}`,
      },
      overlay: <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-1/2" style={{ background: `linear-gradient(110deg, rgba(255,255,255,0.24), transparent 40%, ${palette.glow}2E)` }} />,
    };
  }

  if (categorySlug === "aesthetics") {
    return {
      eyebrow: "Soft glow + self-care",
      heading: "Spa portfolio",
      accent: palette.accent,
      ink: palette.ink,
      shadow: palette.shadow,
      imageBackground: palette.blush,
      imageClassName: "object-cover contrast-105 transition duration-500 group-hover:scale-105",
      description: (name: string) => `A calm glow-board for ${name}'s skincare, brows, lashes, spa details, and self-care results.`,
      cardStyle: {
        borderColor: palette.ink,
        background: `linear-gradient(145deg, ${palette.soft}, ${palette.blush} 62%, ${palette.secondary} 125%)`,
        boxShadow: `5px 6px 0 ${palette.primary}, 9px 10px 0 ${palette.shadow}, 0 24px 54px ${palette.primary}2E`,
      },
      captionStyle: {
        borderColor: palette.ink,
        background: `linear-gradient(135deg, ${palette.blush}, ${palette.accent})`,
      },
      emptyStyle: {
        borderColor: palette.ink,
        background: `radial-gradient(circle at 12% 12%, ${palette.primary}33, transparent 10rem), radial-gradient(circle at 88% 0%, ${palette.secondary}44, transparent 10rem), linear-gradient(135deg, ${palette.soft}, ${palette.blush})`,
        boxShadow: `6px 7px 0 ${palette.shadow}`,
      },
      overlay: <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/25 blur-xl" />,
    };
  }

  return {
    eyebrow: "Recent work",
    heading: "Nail portfolio",
    accent: palette.primary,
    ink: palette.ink,
    shadow: palette.shadow,
    imageBackground: "#fff7e8",
    imageClassName: "object-cover transition duration-500 group-hover:scale-105",
    description: (name: string) => `A few examples of ${name}'s nail art, color, and detail work.`,
    cardStyle: {
      borderColor: palette.ink,
      background: "#fff7e8",
      boxShadow: getRainbowPortfolioShadow(),
    },
    captionStyle: {
      borderColor: palette.ink,
      background: `linear-gradient(135deg, ${palette.blush}, #fff7e8 72%)`,
    },
    emptyStyle: {
      borderColor: palette.ink,
      background: `linear-gradient(135deg, ${palette.blush}, #fff7e8 72%)`,
      boxShadow: `6px 7px 0 ${palette.shadow}`,
    },
    overlay: null,
  };
}

function BioPanelDecoration({ decorId, palette }: { decorId: StaffProfileDecorId; palette: ProfilePalette }) {
  switch (decorId) {
    case "skull-flash":
      return (
        <>
          <SkullSplash className="-right-5 top-3 h-24 w-24 opacity-[0.18]" palette={palette} rotate={12} />
          <SkullSplash className="-bottom-4 left-4 h-20 w-20 opacity-[0.14]" palette={palette} rotate={-18} />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-7 right-9 h-14 w-24 rounded-[60%_40%_65%_35%] border-[3px] opacity-15" style={{ borderColor: palette.primary, transform: "rotate(-12deg)" }} />
        </>
      );
    case "ember-nebula":
      return (
        <>
          <EmberNebula className="-right-10 -top-8 h-40 w-40 opacity-[0.28]" palette={palette} rotate={10} />
          <EmberNebula className="-bottom-10 left-2 h-36 w-36 opacity-[0.22]" palette={palette} rotate={-16} />
          <span aria-hidden="true" className="pointer-events-none absolute right-10 top-8 h-2 w-2 rounded-full opacity-70" style={{ background: palette.glow, boxShadow: `0 0 16px ${palette.glow}, 28px 22px 0 -1px ${palette.accent}, -42px 80px 0 -1px ${palette.primary}` }} />
        </>
      );
    case "cherry-bomb":
      return (
        <>
          <CherryBomb className="-right-3 top-4 h-24 w-24 opacity-20" palette={palette} rotate={8} />
          <CherryBomb className="-bottom-6 left-2 h-20 w-20 opacity-[0.14]" palette={palette} rotate={-18} />
          <span aria-hidden="true" className="pointer-events-none absolute left-12 top-8 h-3 w-3 rounded-full opacity-50" style={{ background: palette.accent, boxShadow: `25px 70px 0 ${palette.primary}, 56px 12px 0 ${palette.glow}` }} />
        </>
      );
    case "cosmic-aura":
      return (
        <>
          <OrbitAura className="-right-8 -top-4 h-36 w-36 opacity-20" palette={palette} rotate={12} />
          <OrbitAura className="-bottom-10 left-0 h-32 w-32 opacity-[0.14]" palette={palette} rotate={-20} />
          <DecorText className="right-16 bottom-7 text-5xl opacity-15" color={palette.secondary}>✶</DecorText>
        </>
      );
    case "butterfly-glow":
      return (
        <>
          <ButterflyGlow className="-right-4 top-4 h-24 w-24 opacity-20" palette={palette} rotate={12} />
          <ButterflyGlow className="bottom-0 left-5 h-20 w-20 opacity-[0.14]" palette={palette} rotate={-16} />
          <DecorText className="right-20 bottom-8 text-4xl opacity-15" color={palette.glow}>✦</DecorText>
        </>
      );
    case "chrome-stars":
      return (
        <>
          <SparkBurst className="-right-5 top-2 h-28 w-28 opacity-22" palette={palette} rotate={8} />
          <SparkBurst className="-bottom-7 left-3 h-24 w-24 opacity-[0.16]" palette={palette} rotate={-18} />
          <DecorText className="right-28 bottom-10 text-5xl opacity-15" color={palette.secondary}>✧</DecorText>
        </>
      );
    case "botanical-vines":
      return (
        <>
          <BotanicalVine className="-right-8 top-0 h-36 w-36 opacity-18" palette={palette} rotate={8} />
          <BotanicalVine className="-bottom-10 left-0 h-32 w-32 opacity-[0.14]" palette={palette} rotate={-18} />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-8 right-10 h-16 w-24 rounded-[70%_30%_70%_30%] border-[3px] opacity-15" style={{ borderColor: palette.secondary, transform: "rotate(-16deg)" }} />
        </>
      );
    case "lightning-pop":
      return (
        <>
          <LightningBolt className="-right-4 top-3 h-24 w-24 opacity-20" palette={palette} rotate={12} />
          <LightningBolt className="-bottom-5 left-6 h-20 w-20 opacity-[0.16]" palette={palette} rotate={-14} />
          <DecorText className="right-20 bottom-7 text-5xl opacity-15" color={palette.primary}>!</DecorText>
        </>
      );
    case "moon-magic":
      return (
        <>
          <MoonMagic className="-right-5 top-2 h-28 w-28 opacity-20" palette={palette} rotate={14} />
          <DecorText className="left-8 bottom-0 text-6xl opacity-[0.14]" color={palette.secondary}>☾</DecorText>
          <DecorText className="right-24 bottom-9 text-4xl opacity-15" color={palette.glow}>✦</DecorText>
        </>
      );
    case "drip-graffiti":
      return (
        <>
          <GraffitiDrip className="-right-4 top-0 h-28 w-28 opacity-20" palette={palette} rotate={8} />
          <GraffitiDrip className="-bottom-8 left-0 h-24 w-24 opacity-[0.15]" palette={palette} rotate={-16} />
          <span aria-hidden="true" className="pointer-events-none absolute right-24 top-9 h-3 w-3 rounded-full opacity-45" style={{ background: palette.ink, boxShadow: `18px 14px 0 ${palette.primary}, -36px 58px 0 ${palette.accent}` }} />
        </>
      );
    case "halo-bubbles":
      return (
        <>
          <BubbleHalo className="-right-8 top-1 h-32 w-32 opacity-22" palette={palette} rotate={10} />
          <BubbleHalo className="-bottom-8 left-2 h-28 w-28 opacity-[0.16]" palette={palette} rotate={-14} />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-10 right-20 h-9 w-9 rounded-full border-[3px] opacity-20" style={{ borderColor: palette.secondary }} />
        </>
      );
    case "ribbon-hearts":
      return (
        <>
          <RibbonHeart className="-right-4 top-3 h-28 w-28 opacity-20" palette={palette} rotate={10} />
          <RibbonHeart className="-bottom-8 left-4 h-24 w-24 opacity-[0.14]" palette={palette} rotate={-18} />
          <DecorText className="right-20 bottom-9 text-5xl opacity-15" color={palette.primary}>♡</DecorText>
        </>
      );
    case "flash-daggers":
      return (
        <>
          <FlashDagger className="-right-3 top-3 h-24 w-24 opacity-20" palette={palette} rotate={18} />
          <FlashDagger className="-bottom-8 left-5 h-24 w-24 opacity-[0.15]" palette={palette} rotate={-22} />
          <DecorText className="right-24 bottom-8 text-4xl opacity-15" color={palette.accent}>✦</DecorText>
        </>
      );
    case "classic-sparkles":
    default:
      return (
        <>
          <DecorText className="-right-4 top-4 text-6xl opacity-20" color={palette.accent}>✦</DecorText>
          <span aria-hidden="true" className="pointer-events-none absolute bottom-5 right-7 h-14 w-20 rounded-[60%_40%_65%_35%] border-[3px] opacity-20" style={{ borderColor: palette.primary, transform: "rotate(-18deg)" }} />
          <DecorText className="-bottom-3 left-6 text-5xl opacity-15" color={palette.secondary}>♡</DecorText>
        </>
      );
  }
}

function DecorText({ className, color, children }: { className: string; color: string; children: string }) {
  return <span aria-hidden="true" className={`pointer-events-none absolute font-black leading-none ${className}`} style={{ color }}>{children}</span>;
}

function SkullSplash({ className, palette, rotate }: { className: string; palette: ProfilePalette; rotate: number }) {
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

function EmberNebula({ className, palette, rotate }: { className: string; palette: ProfilePalette; rotate: number }) {
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

function CherryBomb({ className, palette, rotate }: { className: string; palette: ProfilePalette; rotate: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 96 96" className={`pointer-events-none absolute ${className}`} style={{ transform: `rotate(${rotate}deg)` }} fill="none">
      <path d="M48 28c5-16 15-21 29-17" stroke={palette.ink} strokeWidth="5" strokeLinecap="round" />
      <circle cx="36" cy="54" r="20" fill={palette.primary} />
      <circle cx="60" cy="58" r="18" fill={palette.accent} />
      <path d="M29 44c5-6 14-8 22-3M54 49c5-5 12-5 18-1" stroke={palette.glow} strokeWidth="4" strokeLinecap="round" opacity="0.75" />
      <path d="M51 30c-5-10-14-14-26-14 4 11 13 17 26 14Z" fill={palette.secondary} />
    </svg>
  );
}

function OrbitAura({ className, palette, rotate }: { className: string; palette: ProfilePalette; rotate: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 112 112" className={`pointer-events-none absolute ${className}`} style={{ transform: `rotate(${rotate}deg)` }} fill="none">
      <circle cx="56" cy="56" r="16" fill={palette.accent} opacity="0.55" />
      <ellipse cx="56" cy="56" rx="45" ry="18" stroke={palette.primary} strokeWidth="5" />
      <ellipse cx="56" cy="56" rx="38" ry="14" stroke={palette.secondary} strokeWidth="3" transform="rotate(62 56 56)" />
      <circle cx="25" cy="42" r="4" fill={palette.glow} />
      <circle cx="86" cy="68" r="5" fill={palette.primary} />
      <path d="M20 78l4 8 9 1-7 5 1 9-7-5-8 4 3-9-7-6 9-1 3-6Z" fill={palette.glow} opacity="0.7" />
    </svg>
  );
}

function ButterflyGlow({ className, palette, rotate }: { className: string; palette: ProfilePalette; rotate: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 96 96" className={`pointer-events-none absolute ${className}`} style={{ transform: `rotate(${rotate}deg)` }} fill="none">
      <path d="M45 48C20 23 10 36 16 52c5 14 21 14 29-4Zm6 0c25-25 35-12 29 4-5 14-21 14-29-4Z" fill={palette.secondary} opacity="0.9" />
      <path d="M44 54C19 54 20 75 35 79c11 3 17-9 9-25Zm8 0c25 0 24 21 9 25-11 3-17-9-9-25Z" fill={palette.accent} opacity="0.72" />
      <path d="M48 42v31M39 36c5 2 8 5 9 10m9-10c-5 2-8 5-9 10" stroke={palette.ink} strokeWidth="4" strokeLinecap="round" opacity="0.72" />
    </svg>
  );
}

function SparkBurst({ className, palette, rotate }: { className: string; palette: ProfilePalette; rotate: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 96 96" className={`pointer-events-none absolute ${className}`} style={{ transform: `rotate(${rotate}deg)` }} fill="none">
      <path d="M48 7l9 27 28-5-23 17 21 19-27-2-8 26-8-26-27 2 21-19-23-17 28 5 9-27Z" fill={palette.glow} opacity="0.82" />
      <path d="M48 20l6 21 22-3-18 12 15 15-20-2-5 19-5-19-20 2 15-15-18-12 22 3 6-21Z" fill={palette.primary} opacity="0.72" />
      <path d="M20 18l7 7m49-2-8 9M15 74l10-5m53 10-9-7" stroke={palette.ink} strokeWidth="4" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function BotanicalVine({ className, palette, rotate }: { className: string; palette: ProfilePalette; rotate: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 112 112" className={`pointer-events-none absolute ${className}`} style={{ transform: `rotate(${rotate}deg)` }} fill="none">
      <path d="M25 98C20 66 36 34 83 15" stroke={palette.primary} strokeWidth="5" strokeLinecap="round" />
      <path d="M39 72c-17-5-23 2-23 2s8 10 23-2Zm12-24c-18-2-22 7-22 7s10 8 22-7Zm18-16c-3-17 6-23 6-23s9 9-6 23Zm-24 53c11 12 22 8 22 8s-1-13-22-8Z" fill={palette.secondary} opacity="0.78" />
      <circle cx="72" cy="28" r="5" fill={palette.accent} opacity="0.75" />
    </svg>
  );
}

function LightningBolt({ className, palette, rotate }: { className: string; palette: ProfilePalette; rotate: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 96 96" className={`pointer-events-none absolute ${className}`} style={{ transform: `rotate(${rotate}deg)` }} fill="none">
      <path d="M54 5 19 53h25L36 91l41-52H51L54 5Z" fill={palette.accent} />
      <path d="M54 5 19 53h25L36 91l41-52H51L54 5Z" stroke={palette.ink} strokeWidth="5" strokeLinejoin="round" />
      <path d="M18 20l9 8M73 68l10 8M12 77l15-5" stroke={palette.primary} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function MoonMagic({ className, palette, rotate }: { className: string; palette: ProfilePalette; rotate: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 96 96" className={`pointer-events-none absolute ${className}`} style={{ transform: `rotate(${rotate}deg)` }} fill="none">
      <path d="M62 13c-20 7-31 30-21 50 7 14 21 22 36 20-19 13-45 6-57-15C6 43 18 12 45 4c7-2 14-2 21 0-2 3-3 6-4 9Z" fill={palette.secondary} opacity="0.82" />
      <path d="m25 24 4 8 9 1-7 5 1 9-7-5-8 4 3-9-7-6 9-1 3-6Zm51 26 3 6 7 1-5 4 1 7-6-4-6 3 2-7-5-5 7-1 2-4Z" fill={palette.glow} />
    </svg>
  );
}

function GraffitiDrip({ className, palette, rotate }: { className: string; palette: ProfilePalette; rotate: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 96 96" className={`pointer-events-none absolute ${className}`} style={{ transform: `rotate(${rotate}deg)` }} fill="none">
      <path d="M15 28c20-18 44-21 66-7 4 3 4 12-2 16-7 4-14-3-20 3-6 7-2 17-10 19-8 3-10-9-18-6-8 2-11 12-19 8-8-5-5-25 3-33Z" fill={palette.primary} opacity="0.76" />
      <path d="M28 57v21m22-20v13m18-35v28" stroke={palette.primary} strokeWidth="8" strokeLinecap="round" opacity="0.72" />
      <path d="M22 31c13-9 30-12 47-4" stroke={palette.glow} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function BubbleHalo({ className, palette, rotate }: { className: string; palette: ProfilePalette; rotate: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 112 112" className={`pointer-events-none absolute ${className}`} style={{ transform: `rotate(${rotate}deg)` }} fill="none">
      <circle cx="36" cy="44" r="20" fill={palette.blush} stroke={palette.secondary} strokeWidth="5" opacity="0.75" />
      <circle cx="72" cy="58" r="24" fill={palette.glow} stroke={palette.primary} strokeWidth="5" opacity="0.36" />
      <circle cx="48" cy="82" r="10" fill={palette.accent} opacity="0.35" />
      <circle cx="80" cy="24" r="8" stroke={palette.ink} strokeWidth="4" opacity="0.45" />
    </svg>
  );
}

function RibbonHeart({ className, palette, rotate }: { className: string; palette: ProfilePalette; rotate: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 112 112" className={`pointer-events-none absolute ${className}`} style={{ transform: `rotate(${rotate}deg)` }} fill="none">
      <path d="M20 70c24-47 69-48 72-15 2 22-21 32-42 8-13-15-6-32 8-33 15-1 23 14 12 29" stroke={palette.primary} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.72" />
      <path d="M57 84c-21-14-32-25-30-38 1-10 15-15 24-2 8-13 23-8 24 2 2 13-7 24-18 38Z" fill={palette.accent} opacity="0.48" />
    </svg>
  );
}

function FlashDagger({ className, palette, rotate }: { className: string; palette: ProfilePalette; rotate: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 96 96" className={`pointer-events-none absolute ${className}`} style={{ transform: `rotate(${rotate}deg)` }} fill="none">
      <path d="M54 10 42 57l10 10 28-40L54 10Z" fill={palette.soft} stroke={palette.ink} strokeWidth="5" strokeLinejoin="round" />
      <path d="m37 58 15 15-9 9-15-15 9-9Z" fill={palette.primary} stroke={palette.ink} strokeWidth="5" />
      <path d="M26 60 13 73m45-6 13 13M41 18l-8-9m42 20 12-5" stroke={palette.accent} strokeWidth="5" strokeLinecap="round" opacity="0.7" />
      <path d="M54 25 49 50" stroke={palette.secondary} strokeWidth="4" strokeLinecap="round" />
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
