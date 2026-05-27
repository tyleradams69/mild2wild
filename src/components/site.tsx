import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { ServiceCategory, StaffMember } from "@/lib/studio-data";
import { serviceCategories } from "@/lib/studio-data";


type PaintSplatProps = {
  color: string;
  accent?: string;
  variant?: "window" | "long" | "drip" | "bubble";
  className?: string;
  style?: CSSProperties;
};

export function PaintSplat({
  color,
  accent = "rgba(255,255,255,0.34)",
  variant = "window",
  className = "",
  style,
}: PaintSplatProps) {
  const common = {
    fill: color,
    stroke: "#27211d",
    strokeWidth: 10,
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };

  return (
    <svg aria-hidden="true" focusable="false" className={`paint-splat-svg ${className}`} style={style} viewBox="0 0 240 210">
      <g className="splat-shadow" transform="translate(9 10)">
        {variant === "long" ? (
          <>
            <path d="M24 132 C54 116 68 84 94 92 C113 98 103 122 125 126 C153 132 164 96 188 100 C214 104 204 132 223 139 C201 143 192 158 172 153 C153 149 151 132 134 139 C114 147 102 184 76 179 C55 175 60 151 24 132Z" />
            <path d="M96 91 C102 60 119 39 139 29" />
          </>
        ) : variant === "drip" ? (
          <>
            <path d="M42 104 C56 49 128 26 174 55 C220 84 211 144 168 159 C129 173 102 147 77 163 C53 179 29 151 42 104Z" />
            <path d="M121 154 C113 174 116 194 106 202" />
            <path d="M161 150 C154 172 164 187 154 202" />
            <path d="M73 151 C63 168 68 187 57 198" />
          </>
        ) : variant === "bubble" ? (
          <>
            <path d="M57 130 C37 95 63 52 108 55 C137 57 140 82 159 87 C181 93 213 74 225 101 C238 130 206 143 188 135 C166 126 158 145 139 157 C108 178 73 158 57 130Z" />
            <ellipse cx="54" cy="72" rx="20" ry="15" />
            <ellipse cx="92" cy="39" rx="14" ry="12" />
            <ellipse cx="141" cy="42" rx="10" ry="9" />
          </>
        ) : (
          <>
            <path d="M42 103 C45 75 72 57 99 63 C113 29 151 29 162 59 C191 51 215 72 210 101 C235 111 226 143 199 145 C198 174 165 180 148 156 C124 184 87 174 86 142 C54 149 32 128 42 103Z" />
            <ellipse cx="32" cy="83" rx="18" ry="11" transform="rotate(-38 32 83)" />
            <ellipse cx="58" cy="42" rx="18" ry="13" transform="rotate(26 58 42)" />
            <ellipse cx="188" cy="42" rx="18" ry="12" transform="rotate(-21 188 42)" />
            <ellipse cx="221" cy="126" rx="13" ry="17" transform="rotate(30 221 126)" />
            <ellipse cx="72" cy="172" rx="14" ry="20" transform="rotate(34 72 172)" />
            <circle cx="204" cy="172" r="13" />
          </>
        )}
      </g>

      <g {...common}>
        {variant === "long" ? (
          <>
            <path d="M24 132 C54 116 68 84 94 92 C113 98 103 122 125 126 C153 132 164 96 188 100 C214 104 204 132 223 139 C201 143 192 158 172 153 C153 149 151 132 134 139 C114 147 102 184 76 179 C55 175 60 151 24 132Z" />
            <path d="M96 91 C102 60 119 39 139 29" fill="none" />
          </>
        ) : variant === "drip" ? (
          <>
            <path d="M42 104 C56 49 128 26 174 55 C220 84 211 144 168 159 C129 173 102 147 77 163 C53 179 29 151 42 104Z" />
            <path d="M121 154 C113 174 116 194 106 202" fill="none" />
            <path d="M161 150 C154 172 164 187 154 202" fill="none" />
            <path d="M73 151 C63 168 68 187 57 198" fill="none" />
          </>
        ) : variant === "bubble" ? (
          <>
            <path d="M57 130 C37 95 63 52 108 55 C137 57 140 82 159 87 C181 93 213 74 225 101 C238 130 206 143 188 135 C166 126 158 145 139 157 C108 178 73 158 57 130Z" />
            <ellipse cx="54" cy="72" rx="20" ry="15" />
            <ellipse cx="92" cy="39" rx="14" ry="12" />
            <ellipse cx="141" cy="42" rx="10" ry="9" />
          </>
        ) : (
          <>
            <path d="M42 103 C45 75 72 57 99 63 C113 29 151 29 162 59 C191 51 215 72 210 101 C235 111 226 143 199 145 C198 174 165 180 148 156 C124 184 87 174 86 142 C54 149 32 128 42 103Z" />
            <ellipse cx="32" cy="83" rx="18" ry="11" transform="rotate(-38 32 83)" />
            <ellipse cx="58" cy="42" rx="18" ry="13" transform="rotate(26 58 42)" />
            <ellipse cx="188" cy="42" rx="18" ry="12" transform="rotate(-21 188 42)" />
            <ellipse cx="221" cy="126" rx="13" ry="17" transform="rotate(30 221 126)" />
            <ellipse cx="72" cy="172" rx="14" ry="20" transform="rotate(34 72 172)" />
            <circle cx="204" cy="172" r="13" />
          </>
        )}
      </g>
      <path d="M72 79 C96 58 125 54 151 65" fill="none" stroke={accent} strokeLinecap="round" strokeWidth="7" opacity="0.75" />
      <path d="M91 150 C112 166 141 164 160 150" fill="none" stroke="rgba(39,33,29,0.18)" strokeLinecap="round" strokeWidth="6" />
    </svg>
  );
}

export function SiteHeader() {
  const links = [
    ["Services", "/#services"],
    ["Staff", "/staff"],
    ["Tour", "/tour"],
    ["Products", "/products"],
    ["Book", "/book"],
    ["Login", "/login"],
  ];

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-black bg-[#fff7e8]/92 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <Link href="/" className="brand-display shrink-0 text-2xl uppercase tracking-[0.08em] text-black sm:text-3xl">
          Mild<span className="text-pink-500">2</span>Wild
        </Link>
        <div className="hidden items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-black/72 md:flex">
          {links.map(([label, href], index) => (
            <Link
              key={href}
              href={href}
              className="rounded-full border-2 border-black bg-white/70 px-3 py-2 shadow-[3px_4px_0_#17130f] transition hover:-translate-y-0.5 hover:text-black"
              style={{ background: ["#ffcae6", "#c7f2ff", "#fff0a3", "#d5c4ff", "#caff9b", "#ffffff"][index] }}
            >
              {label}
            </Link>
          ))}
        </div>
        <Link
          href="/book"
          className="shop-tag shrink-0 bg-pink-200 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] transition hover:-translate-y-0.5 hover:bg-yellow-200 sm:text-sm sm:tracking-[0.18em]"
        >
          Book Now
        </Link>
      </nav>
      <div className="border-t-2 border-black/15 md:hidden">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-black/75">
          {links.filter(([label]) => label !== "Login").map(([label, href]) => (
            <Link key={href} href={href} className="shrink-0 rounded-full border-2 border-black bg-white/70 px-3 py-2 shadow-[3px_4px_0_#17130f] transition hover:bg-pink-200 hover:text-black">
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
    ["Policies", "/legal"],
  ];

  return (
    <footer className="footer-mural relative overflow-hidden border-t-[4px] border-black px-5 py-12 text-center text-sm">
      <PaintSplat color="#39aeea" accent="#91dcff" variant="window" className="absolute -right-16 top-2 w-56 rotate-12 opacity-75" />
      <PaintSplat color="#f1c535" accent="#ffe781" variant="bubble" className="absolute -left-14 bottom-0 w-52 -rotate-12 opacity-75" />
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
          className="service-sticker rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.22em]"
          style={{ background: category.accent }}
        >
          {category.name}
        </span>
        <PaintSplat color={category.accent} variant="window" className="absolute -right-12 -top-14 w-36 rotate-12 opacity-85 transition group-hover:rotate-[20deg]" />
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
    <p className="marker-script mb-4 inline-flex rotate-[-1deg] rounded-full border-[3px] border-black bg-white px-4 py-2 text-sm uppercase tracking-[0.08em] text-black shadow-[4px_5px_0_#17130f]" style={{ background: color }}>
      {children}
    </p>
  );
}
