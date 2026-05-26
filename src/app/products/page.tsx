import { PageShell, SectionEyebrow } from "@/components/site";

const productCards = [
  {
    title: "Aftercare Kits",
    copy: "Tattoo and service aftercare favorites selected to help your appointment heal, shine, and last.",
    action: "Ask in studio",
  },
  {
    title: "Cuticle Oils",
    copy: "Nail-care essentials for keeping fresh sets flexible, glossy, and hydrated between visits.",
    action: "Available in studio",
  },
  {
    title: "Salon Shampoos",
    copy: "Hair-care recommendations for color maintenance, softness, and everyday styling support.",
    action: "Ask your stylist",
  },
  {
    title: "Spa Skincare",
    copy: "Skincare picks and post-treatment recommendations chosen for your goals and skin needs.",
    action: "Ask your specialist",
  },
  {
    title: "Gift Cards",
    copy: "A flexible way to gift tattoos, nails, hair, spa services, or retail favorites.",
    action: "Coming soon",
  },
];

export default function ProductsPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#FF7A1A">Retail wall</SectionEyebrow>
        <h1 className="brand-display max-w-4xl text-5xl font-black uppercase md:text-7xl">Products that keep the appointment glow going.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
          Browse the product categories Mild 2 Wild can recommend during appointments. Full product names, photos, pricing, and gift-card checkout will be added as the retail lineup is finalized.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {productCards.map((product, index) => (
            <article key={product.title} className="neon-card rounded-[2rem] p-6">
              <div className="flex aspect-square items-center justify-center rounded-[1.5rem] text-6xl" style={{ background: ["#FF7A1A", "#F06BD6", "#79D94D", "#4DDCE5", "#FFE45C"][index % 5] }}>
                ✦
              </div>
              <h2 className="brand-display mt-5 text-2xl font-black uppercase">{product.title}</h2>
              <p className="mt-3 text-white/62">{product.copy}</p>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.2em] text-orange-200">{product.action}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
