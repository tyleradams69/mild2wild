import Link from "next/link";
import { PageShell, PaintSplat, SectionEyebrow, ServiceCategoryCard, StaffCard } from "@/components/site";
import { productHighlights, serviceCategories, staffMembers } from "@/lib/studio-data";

export default function Home() {
  const featuredStaff = staffMembers.filter((staff) => !staff.isMascot).slice(0, 6);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-14 md:py-20">
        <div className="scrollwork neon-card group overflow-hidden rounded-[3rem] border-pink-300/40 p-7 md:p-14">
          <PaintSplat color="#f1c535" accent="#ffe781" variant="bubble" className="absolute -left-24 top-20 hidden w-60 -rotate-12 opacity-82 lg:block" />
          <PaintSplat color="#68b844" accent="#a9ef7a" variant="window" className="absolute -bottom-8 -right-10 hidden w-56 rotate-12 opacity-82 lg:block" />
          <PaintSplat color="#e786c5" accent="#ffc5e7" variant="long" className="absolute right-4 top-2 hidden w-44 rotate-[22deg] opacity-68 xl:block" />
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <SectionEyebrow color="#ffcae6">Tattoos • Salon • Spa • Rainbow Studio</SectionEyebrow>
              <h1 className="brand-display paint-outline max-w-4xl text-7xl uppercase leading-none text-[#ff8bc8] md:text-9xl">
                Mild<span className="text-[#ffe26f]">2</span><span className="text-[#79dfff]">Wild</span>
              </h1>
              <p className="marker-script mt-3 text-2xl text-black/80 md:text-3xl">
                Pastel paint splashes, tattoo flash, wild color, real artists.
              </p>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-black/68 md:text-xl">
                A hand-painted home for nails, tattoos, hair, aesthetics, spa services, retail favorites, and a team that helps every guest find the right appointment lane.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/book" className="rounded-full border-[3px] border-black bg-pink-300 px-7 py-4 text-center font-black uppercase tracking-[0.2em] text-black shadow-[6px_7px_0_#17130f] transition hover:-translate-y-1 hover:bg-yellow-200">
                  Book Now
                </Link>
                <Link href="/tour" className="rounded-full border-[3px] border-black bg-cyan-200 px-7 py-4 text-center font-black uppercase tracking-[0.2em] text-black shadow-[6px_7px_0_#17130f] transition hover:-translate-y-1 hover:bg-lime-200">
                  Tour the Shop
                </Link>
              </div>
              <div className="mt-8 grid gap-3 text-sm font-black uppercase tracking-[0.08em] text-black/72 sm:grid-cols-3">
                {["Tattoo parlor included", "Pastel service lanes", "Request-first booking"].map((item, index) => (
                  <div key={item} className="rounded-2xl border-[3px] border-black px-4 py-3 shadow-[4px_5px_0_#17130f]" style={{ background: ["#d5c4ff", "#c7f2ff", "#caff9b"][index] }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {serviceCategories.map((category, index) => (
                <Link
                  key={category.slug}
                  href={`/services/${category.slug}`}
                  className="group/service relative overflow-hidden rounded-[2rem] border-[3px] border-black bg-white/80 p-5 shadow-[6px_7px_0_#17130f] transition hover:-translate-y-1"
                  style={{ transform: `rotate(${[-2, 2, 1, -1][index]}deg)` }}
                >
                  <PaintSplat color={category.accent} variant={index % 2 === 0 ? "window" : "bubble"} className="absolute -right-10 -top-10 w-36 rotate-12 opacity-80" />
                  <p className="brand-display relative z-10 mt-14 text-4xl uppercase text-black">{category.name}</p>
                  <p className="relative z-10 mt-4 text-xs font-black uppercase tracking-[0.18em] text-black/58">{category.staffLabel}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="wavy-divider text-pink-300" />

      <section id="services" className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow>Choose your lane</SectionEyebrow>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <h2 className="brand-display max-w-3xl text-5xl uppercase text-black md:text-7xl">Four color-coded worlds. One shop.</h2>
          <p className="max-w-md text-lg leading-8 text-black/62">Nails, hair, tattoo, and aesthetics each keep their own pastel lane so guests can scan fast without losing the hand-painted shop personality.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {serviceCategories.map((category) => (
            <ServiceCategoryCard key={category.slug} category={category} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#FFE45C">Meet-me profiles</SectionEyebrow>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <h2 className="brand-display max-w-3xl text-5xl uppercase text-black md:text-7xl">Artist cards like a wall of custom portraits.</h2>
          <Link href="/staff" className="rounded-full border-[3px] border-black bg-yellow-200 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.18em] text-black shadow-[5px_6px_0_#17130f] transition hover:-translate-y-1 hover:bg-pink-200">
            View all staff
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {featuredStaff.map((staff) => (
            <StaffCard key={staff.slug} staff={staff} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#95df68">How requests work</SectionEyebrow>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["Pick the service", "Guests choose the appointment lane first so staff choices stay relevant to nails, hair, tattoo, aesthetics, or spa."],
            ["Match the right person", "The site shows only team members connected to that service, then stores the request for follow-up."],
            ["Confirm details", "The shop confirms timing, pricing, deposits, consultations, and any service-specific prep before anything is final."],
          ].map(([title, copy], index) => (
            <article key={title} className="neon-card rounded-[2rem] p-6" style={{ transform: `rotate(${[-1, 1, -0.5][index]}deg)` }}>
              <p className="brand-display paint-outline text-6xl uppercase" style={{ color: ["#ff8bc8", "#79dfff", "#95df68"][index] }}>0{index + 1}</p>
              <h3 className="brand-display mt-5 text-3xl uppercase text-black">{title}</h3>
              <p className="mt-3 leading-7 text-black/64">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="neon-card rounded-[2rem] p-7 lg:col-span-2">
            <SectionEyebrow color="#B99CFF">Tour the mural energy</SectionEyebrow>
            <h2 className="brand-display text-5xl uppercase text-black md:text-6xl">Shop walls, window splashes, tattoo flash, and community color.</h2>
            <p className="mt-4 leading-8 text-black/65">The site now mirrors the actual salon language: chunky black outlines, paint-splash shapes on glass, custom character art, colorful portrait grids, and a friendly tattoo-parlor edge.</p>
          </div>
          <div className="neon-card rounded-[2rem] p-7">
            <SectionEyebrow color="#FFB347">Products</SectionEyebrow>
            <ul className="space-y-3 text-black/70">
              {productHighlights.map((product) => (
                <li key={product} className="font-bold">✦ {product}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
