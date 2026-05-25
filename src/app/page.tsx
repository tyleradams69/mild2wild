import Link from "next/link";
import { PageShell, SectionEyebrow, ServiceCategoryCard, StaffCard } from "@/components/site";
import { productHighlights, serviceCategories, staffMembers } from "@/lib/studio-data";

export default function Home() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16 md:py-24">
        <div className="scrollwork neon-card overflow-hidden rounded-[3rem] border-pink-400/40 p-8 md:p-14">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <SectionEyebrow color="#F06BD6">Tattoos • Salon • Spa</SectionEyebrow>
              <h1 className="brand-display text-5xl font-black uppercase leading-none tracking-[0.08em] md:text-8xl">
                Mild<span className="text-pink-400">2</span>Wild
              </h1>
              <p className="mt-7 max-w-2xl text-xl leading-8 text-white/72">
                A bright blacklight-style home for nails, tattoos, hair, aesthetics, spa services, products, staff meet-me pages,
                protected calendars, and an AI call agent that gathers details before the handoff.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/book" className="rounded-full bg-pink-400 px-7 py-4 text-center font-black uppercase tracking-[0.2em] text-black hover:bg-white">
                  Book Now
                </Link>
                <Link href="/tour" className="rounded-full border border-cyan-300 px-7 py-4 text-center font-black uppercase tracking-[0.2em] text-cyan-200 hover:bg-cyan-300 hover:text-black">
                  Tour the Shop
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {serviceCategories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/services/${category.slug}`}
                  className="rounded-[2rem] border border-white/10 bg-black/40 p-5 transition hover:-translate-y-1"
                  style={{ boxShadow: `0 0 38px ${category.accent}33` }}
                >
                  <div className="text-4xl" style={{ color: category.accent }}>
                    ✦
                  </div>
                  <p className="brand-display mt-8 text-2xl font-black uppercase">{category.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="wavy-divider text-pink-400" />

      <section id="services" className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow>Choose your lane</SectionEyebrow>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <h2 className="brand-display max-w-3xl text-4xl font-black uppercase md:text-6xl">Service pages connect clients to the right staff.</h2>
          <p className="max-w-md text-white/60">No nail staff on tattoo pages. No tattoo artists on spa pages. Every category has its own relevant team.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {serviceCategories.map((category) => (
            <ServiceCategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#FFE45C">Meet-me profiles</SectionEyebrow>
        <div className="grid gap-5 md:grid-cols-3">
          {staffMembers.slice(0, 6).map((staff) => (
            <StaffCard key={staff.slug} staff={staff} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="neon-card rounded-[2rem] p-7 lg:col-span-2">
            <SectionEyebrow color="#A95CFF">Video page</SectionEyebrow>
            <h2 className="brand-display text-4xl font-black uppercase">Tour, charity, and what makes them different.</h2>
            <p className="mt-4 text-white/65">The tour page is ready for a shop walk-through video, owner story, charity mission, and differentiators that make Mild 2 Wild more than a standard salon.</p>
          </div>
          <div className="neon-card rounded-[2rem] p-7">
            <SectionEyebrow color="#FF7A1A">Products</SectionEyebrow>
            <ul className="space-y-3 text-white/70">
              {productHighlights.map((product) => (
                <li key={product}>✦ {product}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
