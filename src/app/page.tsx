import Image from "next/image";
import Link from "next/link";
import { PageShell, PaintSplat, SectionEyebrow, ServiceCategoryCard, StaffCard } from "@/components/site";
import { getDogClickerMascot } from "@/lib/dog-clicker";
import { productHighlights, serviceCategories, staffMembers } from "@/lib/studio-data";

export default function Home() {
  const featuredStaff = staffMembers.filter((staff) => !staff.isMascot).slice(0, 6);
  const mascot = getDogClickerMascot();

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-14 md:py-20">
        <div className="scrollwork neon-card group overflow-hidden rounded-[3rem] border-pink-300/40 p-7 md:p-14">
          <div className="grid gap-12 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
            <div>
              <SectionEyebrow color="#ffcae6">Tattoos • Salon • Spa • Rainbow Studio</SectionEyebrow>
              <h1 className="brand-display paint-outline max-w-4xl text-7xl uppercase leading-none text-[#ff8bc8] md:text-9xl">
                Mild<span className="text-[#ffe26f]">2</span><span className="text-[#79dfff]">Wild</span>
              </h1>
              <p className="marker-script mt-3 text-2xl text-black/80 md:text-3xl">
                Pastel window art, tattoo flash, real artists, and one very feedable shop dog.
              </p>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-black/68 md:text-xl">
                A hand-painted salon/parlor world where every service lane feels intentional: nails, tattoos, hair, aesthetics, spa care, retail favorites, and request-first booking without losing the mural-wall personality.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/book" className="rounded-full border-[3px] border-black bg-pink-300 px-7 py-4 text-center font-black uppercase tracking-[0.2em] text-black shadow-[6px_7px_0_#17130f] transition hover:-translate-y-1 hover:bg-yellow-200">
                  Book Now
                </Link>
                <Link href="/dog-clicker" className="rounded-full border-[3px] border-black bg-white/70 px-7 py-4 text-center font-black uppercase tracking-[0.2em] text-black shadow-[5px_6px_0_#17130f] transition hover:-translate-y-1 hover:bg-yellow-100">
                  Play Dog Game
                </Link>
              </div>
              <div className="mt-8 grid gap-3 text-sm font-black uppercase tracking-[0.08em] text-black/72 sm:grid-cols-3">
                {["Tattoo parlor included", "Pastel service lanes", "Dog treat game"].map((item, index) => (
                  <div key={item} className="rounded-2xl border-[3px] border-black px-4 py-3 shadow-[4px_5px_0_#17130f]" style={{ background: ["#d5c4ff", "#c7f2ff", "#caff9b"][index] }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[2.8rem] border-[5px] border-black bg-[#d7eef2] p-5 shadow-[10px_12px_0_#17130f]">
                <div className="absolute left-0 right-0 top-0 z-10 h-10 border-b-[4px] border-black bg-[#f6f0e4]">
                  <div className="mx-auto mt-3 h-2 w-28 rounded-full bg-black/18" />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,.12)_2px,transparent_2px),linear-gradient(rgba(0,0,0,.08)_2px,transparent_2px)] bg-[length:50%_50%] opacity-30" aria-hidden="true" />

                <PaintSplat color="#f1c535" variant="window" className="absolute left-3 top-14 w-40 -rotate-12 opacity-95" />
                <PaintSplat color="#e786c5" variant="long" className="absolute right-0 top-12 w-44 rotate-[18deg] opacity-95" />
                <PaintSplat color="#39aeea" variant="window" className="absolute bottom-16 right-4 w-44 rotate-12 opacity-95" />
                <PaintSplat color="#68b844" variant="window" className="absolute bottom-8 left-7 w-36 -rotate-6 opacity-95" />

                <Link href="/dog-clicker" className="group relative z-20 mx-auto mt-8 block max-w-sm rounded-[2rem] border-[4px] border-black bg-pink-200 p-4 shadow-[8px_9px_0_#17130f] transition hover:-translate-y-1 hover:bg-yellow-100">
                  <div className="relative aspect-square overflow-hidden rounded-[1.5rem] border-[4px] border-black bg-white">
                    <Image src={mascot.image} alt={mascot.name} fill sizes="(min-width: 1024px) 30vw, 90vw" className="object-cover transition duration-500 group-hover:scale-105" priority />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-black/55">New tab</p>
                      <p className="brand-display text-3xl uppercase text-black">Dog Treat Clicker</p>
                    </div>
                    <span className="rounded-full border-[3px] border-black bg-cyan-200 px-4 py-2 text-2xl shadow-[4px_5px_0_#17130f]">🦴</span>
                  </div>
                </Link>

                <div className="relative z-20 mt-5 grid grid-cols-2 gap-3">
                  {serviceCategories.map((category) => (
                    <Link key={category.slug} href={`/services/${category.slug}`} className="rounded-2xl border-[3px] border-black bg-white/88 px-4 py-3 shadow-[4px_5px_0_#17130f] transition hover:-translate-y-1" style={{ background: category.accent }}>
                      <p className="brand-display text-2xl uppercase text-black">{category.name}</p>
                      <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-black/65">{category.staffLabel}</p>
                    </Link>
                  ))}
                </div>
              </div>
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
            <p className="mt-4 leading-8 text-black/65">Step into a bright, welcoming studio with chunky black outlines, paint-splash energy, custom character art, colorful portrait grids, and a friendly tattoo-parlor edge.</p>
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
