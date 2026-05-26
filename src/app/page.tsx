import Link from "next/link";
import { PageShell, SectionEyebrow, ServiceCategoryCard, StaffCard } from "@/components/site";
import { productHighlights, serviceCategories, staffMembers } from "@/lib/studio-data";

export default function Home() {
  const featuredStaff = staffMembers.filter((staff) => !staff.isMascot).slice(0, 6);

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
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/72 md:text-xl">
                A bright blacklight-style home for nails, tattoos, hair, aesthetics, spa services, retail favorites, and a team that helps every guest find the right appointment.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/book" className="rounded-full bg-pink-400 px-7 py-4 text-center font-black uppercase tracking-[0.2em] text-black hover:bg-white">
                  Book Now
                </Link>
                <Link href="/tour" className="rounded-full border border-cyan-300 px-7 py-4 text-center font-black uppercase tracking-[0.2em] text-cyan-200 hover:bg-cyan-300 hover:text-black">
                  Tour the Shop
                </Link>
              </div>
              <div className="mt-8 grid gap-3 text-sm font-bold text-white/68 sm:grid-cols-3">
                {["Service-matched staff", "Owner alert handoffs", "Request-first booking"].map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    ✦ {item}
                  </div>
                ))}
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
          <h2 className="brand-display max-w-3xl text-4xl font-black uppercase md:text-6xl">Choose a service and meet the right team.</h2>
          <p className="max-w-md text-white/60">Explore each service category, compare specialties, and request the appointment that fits your look.</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {serviceCategories.map((category) => (
            <ServiceCategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#FFE45C">Meet-me profiles</SectionEyebrow>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <h2 className="brand-display max-w-3xl text-4xl font-black uppercase md:text-6xl">Every real team member gets a profile.</h2>
          <Link href="/staff" className="rounded-full border border-yellow-200/40 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-yellow-100 transition hover:bg-yellow-200 hover:text-black">
            View all staff
          </Link>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {featuredStaff.map((staff) => (
            <StaffCard key={staff.slug} staff={staff} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#79D94D">How requests work</SectionEyebrow>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["Pick the service", "Guests choose the appointment lane first so staff choices stay relevant to nails, hair, tattoo, aesthetics, or spa."],
            ["Match the right person", "The site shows only team members connected to that service, then stores the request for follow-up."],
            ["Confirm details", "The shop confirms timing, pricing, deposits, consultations, and any service-specific prep before anything is final."],
          ].map(([title, copy], index) => (
            <article key={title} className="neon-card rounded-[2rem] p-6">
              <p className="brand-display text-5xl font-black text-lime-200">0{index + 1}</p>
              <h3 className="brand-display mt-5 text-2xl font-black uppercase">{title}</h3>
              <p className="mt-3 leading-7 text-white/62">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-5 lg:grid-cols-3">
          <div className="neon-card rounded-[2rem] p-7 lg:col-span-2">
            <SectionEyebrow color="#A95CFF">Video page</SectionEyebrow>
            <h2 className="brand-display text-4xl font-black uppercase">Tour the shop, community, and what makes it different.</h2>
            <p className="mt-4 text-white/65">Get a feel for the studio, the creative energy, the community focus, and the details that make Mild 2 Wild more than a standard salon.</p>
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
