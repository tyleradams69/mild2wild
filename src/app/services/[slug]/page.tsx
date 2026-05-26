import Link from "next/link";
import { PageShell, SectionEyebrow, StaffCard } from "@/components/site";
import {
  getFeaturedStaffForCategory,
  getServiceCategoryBySlug,
  getServicesForCategory,
  getStaffForService,
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
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-block rounded-full px-7 py-4 font-black uppercase tracking-[0.2em] text-black"
              style={{ background: category.accent }}
            >
              Book {category.name}
            </Link>
            <a href="#service-staff" className="inline-block rounded-full border border-white/15 px-7 py-4 font-black uppercase tracking-[0.2em] text-white/80">
              Meet the right staff
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <SectionEyebrow color={category.accent}>Services</SectionEyebrow>
          <div className="space-y-4">
            {services.map((service) => {
              const serviceStaff = getStaffForService(service.slug);
              return (
                <article key={service.slug} className="neon-card rounded-[1.6rem] p-6">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <h2 className="brand-display text-2xl font-black uppercase">{service.name}</h2>
                      <p className="mt-2 text-white/62">{service.description}</p>
                    </div>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-white/70">{service.durationMinutes}m</span>
                  </div>
                  <p className="mt-4 font-black" style={{ color: category.accent }}>
                    {service.priceLabel}
                  </p>
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-white/42">Available with</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {serviceStaff.map((member) => (
                        <Link
                          key={member.slug}
                          href={`/staff/${member.slug}`}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/72 transition hover:bg-white/10 hover:text-white"
                        >
                          {member.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div id="service-staff">
          <SectionEyebrow color={category.accent}>{category.staffLabel}</SectionEyebrow>
          <p className="mb-5 text-white/60">
            Each profile below is connected to this service category so guests can compare style, specialties, and fit before requesting an appointment.
          </p>
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
