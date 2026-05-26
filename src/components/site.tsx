import Image from "next/image";
import Link from "next/link";
import type { ServiceCategory, StaffMember } from "@/lib/studio-data";
import { serviceCategories } from "@/lib/studio-data";

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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="brand-display text-xl font-black uppercase tracking-[0.22em]">
          Mild<span className="text-pink-400">2</span>Wild
        </Link>
        <div className="hidden items-center gap-5 text-sm font-bold uppercase tracking-[0.22em] text-white/70 md:flex">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="transition hover:text-white">
              {label}
            </Link>
          ))}
        </div>
        <Link
          href="/book"
          className="rounded-full bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-pink-300"
        >
          Book Now
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 px-5 py-12 text-center text-sm text-white/55">
      <p className="brand-display text-lg uppercase text-white">Mild 2 Wild</p>
      <p className="mt-2">Tattoos • Nails • Hair • Aesthetics • Spa • Products</p>
      <p className="mt-4">Built for staff-owned calendars, owner admin visibility, and AI-assisted call intake.</p>
      <Link href="/legal" className="mt-5 inline-block font-black uppercase tracking-[0.22em] text-pink-300 transition hover:text-white">
        Legal & Policies
      </Link>
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
      className="neon-card group rounded-[2rem] p-6 transition duration-300 hover:-translate-y-1"
      style={{ boxShadow: `0 0 45px ${category.accent}22` }}
    >
      <div className="mb-8 flex items-center justify-between">
        <span
          className="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-black"
          style={{ background: category.accent }}
        >
          {category.name}
        </span>
        <span className="text-3xl transition group-hover:rotate-12">✦</span>
      </div>
      <h3 className="brand-display text-3xl font-black uppercase">{category.name}</h3>
      <p className="mt-4 text-white/68">{category.description}</p>
      <p className="mt-6 text-sm font-black uppercase tracking-[0.2em]" style={{ color: category.accent }}>
        Meet {category.staffLabel} →
      </p>
    </Link>
  );
}

export function StaffCard({ staff }: { staff: StaffMember }) {
  const primary = serviceCategories.find((category) => category.slug === staff.serviceCategorySlugs[0]);
  return (
    <Link
      href={`/staff/${staff.slug}`}
      className="neon-card group block overflow-hidden rounded-[2rem] p-4 transition duration-300 hover:-translate-y-1"
      style={{ boxShadow: `0 0 45px ${staff.calendarColor}18` }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.4rem] border border-white/10 bg-black">
        <Image
          src={staff.photoUrl}
          alt={`${staff.name} profile photo`}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div
          className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/45 to-transparent"
          style={{ boxShadow: `inset 0 -45px 70px ${staff.calendarColor}18` }}
        />
        <span
          className="absolute left-4 top-4 rounded-full px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.18em] text-black"
          style={{ background: primary?.accent ?? staff.calendarColor }}
        >
          {primary?.name ?? "Staff"}
        </span>
      </div>
      <div className="mt-5">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-white/45">{staff.title}</p>
        <h3 className="brand-display mt-2 text-2xl font-black uppercase group-hover:text-pink-300">{staff.name}</h3>
        <p className="mt-3 line-clamp-3 text-sm text-white/65">{staff.bio}</p>
      </div>
    </Link>
  );
}

export function SectionEyebrow({ children, color = "#4DDCE5" }: { children: React.ReactNode; color?: string }) {
  return (
    <p className="mb-4 text-sm font-black uppercase tracking-[0.32em]" style={{ color }}>
      {children}
    </p>
  );
}
