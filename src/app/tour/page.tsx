import { PageShell, SectionEyebrow } from "@/components/site";

export default function TourPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#4DDCE5">Shop video</SectionEyebrow>
        <h1 className="brand-display max-w-5xl text-5xl font-black uppercase md:text-7xl">Tour the shop, meet the vibe, and see what makes Mild 2 Wild different.</h1>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="neon-card flex aspect-video items-center justify-center rounded-[3rem] border-cyan-300/30 p-8 text-center">
            <div>
              <p className="brand-display text-5xl font-black uppercase text-cyan-200">Video Tour Coming Soon</p>
              <p className="mt-4 text-white/60">A walk-through video will live here once the final shop footage is ready.</p>
            </div>
          </div>
          <div className="space-y-5">
            {[
              ["About the shop", "A welcoming multi-service beauty and tattoo space with bold style and personal connections."],
              ["Community", "A home for causes, events, donation drives, and community give-back details as the shop shares them."],
              ["Different by design", "Guests can explore artists, match to services, request the right appointment, and arrive already understood."],
            ].map(([title, copy]) => (
              <article key={title} className="neon-card rounded-[2rem] p-6">
                <h2 className="brand-display text-2xl font-black uppercase">{title}</h2>
                <p className="mt-3 text-white/62">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
