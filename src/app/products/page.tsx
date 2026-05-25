import { PageShell, SectionEyebrow } from "@/components/site";
import { productHighlights } from "@/lib/studio-data";

export default function ProductsPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#FF7A1A">Retail wall</SectionEyebrow>
        <h1 className="brand-display max-w-4xl text-5xl font-black uppercase md:text-7xl">Products that keep the appointment glow going.</h1>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {productHighlights.map((product, index) => (
            <article key={product} className="neon-card rounded-[2rem] p-6">
              <div className="flex aspect-square items-center justify-center rounded-[1.5rem] text-6xl" style={{ background: ["#FF7A1A", "#F06BD6", "#79D94D", "#4DDCE5", "#FFE45C"][index % 5] }}>
                ✦
              </div>
              <h2 className="brand-display mt-5 text-2xl font-black uppercase">{product}</h2>
              <p className="mt-3 text-white/62">Placeholder product card. Add real image, price, inventory, and checkout/message-to-buy flow.</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
