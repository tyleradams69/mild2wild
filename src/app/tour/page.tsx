import { PageShell, SectionEyebrow } from "@/components/site";

export default function TourPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-5 md:py-16">
        <SectionEyebrow color="#4DDCE5">Shop video</SectionEyebrow>
        <h1 className="brand-display max-w-5xl text-3xl font-black uppercase sm:text-5xl md:text-7xl">Tour the shop, meet the vibe, and see what makes Mild 2 Wild different.</h1>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="neon-card flex min-h-72 items-center justify-center overflow-hidden rounded-[2rem] border-cyan-300/30 p-5 text-center sm:aspect-video sm:rounded-[3rem] sm:p-8">
            <div className="relative z-10">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-cyan-200/40 bg-cyan-200/10 text-4xl text-cyan-100">▶</div>
              <p className="brand-display text-3xl font-black uppercase text-cyan-200 sm:text-4xl md:text-5xl">Shop Tour Preview</p>
              <p className="mt-4 text-white/60">A full video walkthrough can be added when final shop footage is ready.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/50">
                <span className="rounded-full border border-white/10 px-3 py-2">Shop walkthrough</span>
                <span className="rounded-full border border-white/10 px-3 py-2">Team story</span>
                <span className="rounded-full border border-white/10 px-3 py-2">Community focus</span>
              </div>
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
