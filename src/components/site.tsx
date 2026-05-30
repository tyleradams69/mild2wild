import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { ServiceCategory, StaffMember } from "@/lib/studio-data";
import { serviceCategories } from "@/lib/studio-data";


type PaintSplatProps = {
  color: string;
  variant?: "window" | "long" | "drip" | "bubble";
  className?: string;
  style?: CSSProperties;
};

const splatAssets: Record<string, string> = {
  "#f06bd6:window": "/splats/pink-window.svg",
  "#f06bd6:bubble": "/splats/pink-window.svg",
  "#ffe45c:window": "/splats/yellow-window.svg",
  "#ffe45c:bubble": "/splats/yellow-bubble.svg",
  "#4ddce5:window": "/splats/blue-window.svg",
  "#4ddce5:bubble": "/splats/blue-window.svg",
  "#a95cff:window": "/splats/purple-bubble.svg",
  "#a95cff:bubble": "/splats/purple-bubble.svg",
  "#f1c535:bubble": "/splats/yellow-bubble.svg",
  "#f1c535:window": "/splats/yellow-window.svg",
  "#68b844:window": "/splats/green-window.svg",
  "#e786c5:long": "/splats/pink-long.svg",
  "#39aeea:window": "/splats/blue-window.svg",
};

function resolveSplatAsset(color: string, variant: PaintSplatProps["variant"] = "window") {
  const key = `${color.toLowerCase()}:${variant}`;
  return splatAssets[key] ?? splatAssets[`${color.toLowerCase()}:window`] ?? "/splats/pink-window.svg";
}

export function PaintSplat({ color, variant = "window", className = "", style }: PaintSplatProps) {
  return (
    <Image
      src={resolveSplatAsset(color, variant)}
      alt=""
      aria-hidden="true"
      width={280}
      height={240}
      className={`paint-splat-img ${className}`}
      style={style}
      unoptimized
    />
  );
}

export function SiteHeader() {
  const links = [
    ["Services", "/#services"],
    ["Staff", "/staff"],
    ["Tour", "/tour"],
    ["Products", "/products"],
    ["Dog Game", "/dog-clicker"],
    ["Login", "/login"],
  ];
  const mobileLinks = links.filter(([label]) => label !== "Login");

  return (
    <header className="sticky top-0 z-50 w-full max-w-full overflow-x-clip border-b-[3px] border-black bg-[#fff7e8]/92 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-1.5 px-3 py-4 sm:gap-4 sm:px-5">
        <Link href="/" className="brand-display min-w-0 shrink text-lg uppercase tracking-[0.04em] text-black min-[360px]:text-xl sm:text-2xl md:text-3xl">
          Mild<span className="text-pink-500">2</span>Wild
        </Link>
        <div className="hidden items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-black/72 md:flex">
          {links.map(([label, href], index) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border-2 border-black bg-white/70 px-3 py-2 shadow-[3px_4px_0_#17130f] transition hover:-translate-y-0.5 hover:text-black"
              style={{ background: ["#ffcae6", "#c7f2ff", "#fff0a3", "#d5c4ff", "#ffd7a8", "#caff9b", "#ffffff"][index] }}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 min-[360px]:gap-2">
          <Link
            href="/login"
            className="rounded-full border-2 border-black bg-lime-100 px-2 py-2 text-[0.62rem] font-black uppercase tracking-[0.06em] text-black shadow-[3px_4px_0_#17130f] transition hover:-translate-y-0.5 hover:bg-lime-200 min-[360px]:px-2.5 sm:px-3 sm:text-xs md:hidden"
          >
            Login
          </Link>
          <Link
            href="/book"
            className="shop-tag bg-pink-200 px-2 py-2 text-[0.62rem] font-black uppercase tracking-[0.06em] transition hover:-translate-y-0.5 hover:bg-yellow-200 min-[360px]:px-2.5 sm:px-4 sm:text-sm sm:tracking-[0.18em]"
          >
            Book Now
          </Link>
        </div>
      </nav>
      <div className="border-t-2 border-black/15 md:hidden">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto overscroll-x-contain px-3 py-3 text-[0.68rem] font-black uppercase tracking-[0.12em] text-black/75 sm:gap-3 sm:px-5 sm:text-xs sm:tracking-[0.16em]">
          {mobileLinks.map(([label, href]) => (
            <Link key={href} href={href} className={`shrink-0 rounded-full border-2 border-black px-3 py-2 shadow-[3px_4px_0_#17130f] transition hover:bg-pink-200 hover:text-black ${label === "Login" ? "bg-lime-100 text-black" : "bg-white/70"}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  const footerLinks = [
    ["Services", "/#services"],
    ["Staff", "/staff"],
    ["Book", "/book"],
    ["Login", "/login"],
    ["Policies", "/legal"],
  ];

  return (
    <footer className="footer-mural relative overflow-hidden border-t-[4px] border-black px-5 py-12 text-center text-sm">
      <PaintSplat color="#39aeea" variant="window" className="pointer-events-none absolute -right-12 top-4 w-48 rotate-12 opacity-70" />
      <PaintSplat color="#f1c535" variant="bubble" className="pointer-events-none absolute -left-12 bottom-0 w-44 -rotate-12 opacity-70" />
      <div className="relative z-10">
        <p className="brand-display paint-outline text-4xl uppercase text-pink-300">Mild 2 Wild</p>
        <p className="marker-script mt-3 text-lg text-yellow-100">Tattoos • Nails • Hair • Aesthetics • Spa • Products</p>
        <p className="mx-auto mt-4 max-w-2xl text-white/70">A pastel-rainbow studio home for custom ink, wild sets, vivid color, spa care, staff profiles, booking requests, policies, and retail favorites.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {footerLinks.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-full border-2 border-white/70 bg-white px-4 py-2 font-black uppercase tracking-[0.18em] text-black shadow-[4px_5px_0_#000] transition hover:-translate-y-0.5 hover:bg-pink-200">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}

export function ServiceCategoryCard({ category }: { category: ServiceCategory }) {
  return (
    <Link
      href={`/services/${category.slug}`}
      className="neon-card group block overflow-hidden rounded-[2rem] p-6 transition duration-300 hover:-translate-y-1"
      style={{ boxShadow: `8px 9px 0 #17130f, 0 0 0 8px ${category.accent}44, 0 26px 60px rgba(40, 26, 20, 0.18)` }}
    >
      <div className="relative z-10 mb-8 flex items-center justify-between">
        <span
          className="service-sticker relative z-10 max-w-[9.5rem] break-words rounded-full px-4 py-2 text-center text-xs font-black uppercase leading-tight tracking-[0.16em]"
          style={{ background: category.accent }}
        >
          {category.name}
        </span>
        <PaintSplat color={category.accent} variant="window" className="pointer-events-none absolute -right-6 -top-8 w-28 rotate-12 opacity-78 transition group-hover:rotate-[18deg]" />
      </div>
      <h3 className="brand-display relative z-10 text-4xl uppercase text-black">{category.name}</h3>
      <p className="relative z-10 mt-4 leading-7 text-black/68">{category.description}</p>
      <p className="relative z-10 mt-6 text-sm font-black uppercase tracking-[0.2em] text-black">
        Meet {category.staffLabel} →
      </p>
    </Link>
  );
}

export function StaffCard({ staff }: { staff: StaffMember }) {
  const primary = serviceCategories.find((category) => category.slug === staff.serviceCategorySlugs[0]);
  const badgeLabel = staff.isMascot ? "Mascot" : (primary?.name ?? "Staff");
  const badgeColor = staff.isMascot ? staff.calendarColor : (primary?.accent ?? staff.calendarColor);
  return (
    <Link
      href={`/staff/${staff.slug}`}
      className="neon-card group block overflow-hidden rounded-[2rem] p-4 transition duration-300 hover:-translate-y-1"
      style={{ boxShadow: `7px 8px 0 #17130f, 0 0 0 7px ${staff.calendarColor}3f, 0 24px 54px rgba(40, 26, 20, 0.18)` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] border-[3px] border-black bg-black">
        <Image
          src={staff.photoUrl}
          alt={`${staff.name} profile photo`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/45 to-transparent"
          style={{ boxShadow: `inset 0 -45px 70px ${staff.calendarColor}20` }}
        />
        <span
          className="absolute left-4 top-4 rounded-full border-2 border-black px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-black shadow-[3px_4px_0_#17130f]"
          style={{ background: badgeColor }}
        >
          {badgeLabel}
        </span>
      </div>
      <div className="relative z-10 mt-5">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-black/45">{staff.title}</p>
        <h3 className="brand-display mt-2 text-3xl uppercase text-black group-hover:text-pink-500">{staff.name}</h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/65">{staff.bio}</p>
        <p className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-black">
          View profile →
        </p>
      </div>
    </Link>
  );
}

export function SectionEyebrow({ children, color = "#4DDCE5" }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="marker-script mb-4 inline-flex max-w-full rotate-[-1deg] flex-wrap justify-center rounded-full border-[3px] border-black bg-white px-4 py-2 text-center text-sm leading-tight uppercase tracking-[0.06em] text-black shadow-[4px_5px_0_#17130f] sm:tracking-[0.08em]" style={{ background: color }}>
      {children}
    </p>
  );
}
