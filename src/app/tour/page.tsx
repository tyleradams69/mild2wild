import { PageShell, SectionEyebrow } from "@/components/site";

export default function TourPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#4DDCE5">Shop video</SectionEyebrow>
        <h1 className="brand-display max-w-5xl text-5xl font-black uppercase md:text-7xl">Tour the shop, tell the story, show the charity mission.</h1>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="neon-card flex aspect-video items-center justify-center rounded-[3rem] border-cyan-300/30 p-8 text-center">
            <div>
              <p className="brand-display text-5xl font-black uppercase text-cyan-200">Video Tour</p>
              <p className="mt-4 text-white/60">Embed YouTube/Vimeo or host a walkthrough video here.</p>
            </div>
          </div>
          <div className="space-y-5">
            {[
              ["About the shop", "A welcoming multi-service beauty and tattoo space with bold style and personal connections."],
              ["Charity", "A dedicated section for causes they support, events, donation drives, and community give-back."],
              ["Different by design", "Clients can explore artists, match to services, book the right calendar, and arrive already understood."],
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
