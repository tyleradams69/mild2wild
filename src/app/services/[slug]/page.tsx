import Link from "next/link";
import { PageShell, SectionEyebrow, StaffCard } from "@/components/site";
import {
  getFeaturedStaffForCategory,
  getServiceCategoryBySlug,
  getServicesForCategory,
  serviceCategories,
  type ServiceCategorySlug,
} from "@/lib/studio-data";

export function generateStaticParams() {
  return serviceCategories.map((category) => ({ slug: category.slug }));
}

export default async function ServiceCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getServiceCategoryBySlug(slug);

  if (!category) {
    return (
      <PageShell>
        <section className="mx-auto max-w-4xl px-5 py-24">
          <h1 className="brand-display text-5xl font-black uppercase">Service not found</h1>
          <Link href="/" className="mt-8 inline-block rounded-full bg-white px-6 py-3 font-black uppercase text-black">
            Back home
          </Link>
        </section>
      </PageShell>
    );
  }

  const services = getServicesForCategory(category.slug as ServiceCategorySlug);
  const staff = getFeaturedStaffForCategory(category.slug as ServiceCategorySlug);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="neon-card rounded-[3rem] p-8 md:p-12" style={{ boxShadow: `0 0 80px ${category.accent}22` }}>
          <SectionEyebrow color={category.accent}>{category.name}</SectionEyebrow>
          <h1 className="brand-display max-w-5xl text-5xl font-black uppercase md:text-7xl">{category.headline}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/68">{category.description}</p>
          <Link
            href="/book"
            className="mt-8 inline-block rounded-full px-7 py-4 font-black uppercase tracking-[0.2em] text-black"
            style={{ background: category.accent }}
          >
            Book {category.name}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionEyebrow color={category.accent}>Services</SectionEyebrow>
          <div className="space-y-4">
            {services.map((service) => (
              <article key={service.slug} className="neon-card rounded-[1.6rem] p-6">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <h2 className="brand-display text-2xl font-black uppercase">{service.name}</h2>
                    <p className="mt-2 text-white/62">{service.description}</p>
                  </div>
                  <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-white/70">{service.durationMinutes}m</span>
                </div>
                <p className="mt-4 font-black" style={{ color: category.accent }}>{service.priceLabel}</p>
              </article>
            ))}
          </div>
        </div>

        <div>
          <SectionEyebrow color={category.accent}>{category.staffLabel}</SectionEyebrow>
          <div className="grid gap-5 md:grid-cols-2">
            {staff.map((member) => (
              <StaffCard key={member.slug} staff={member} />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
