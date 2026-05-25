import Image from "next/image";
import Link from "next/link";
import { PageShell, SectionEyebrow } from "@/components/site";
import { getStaffBySlug, serviceCategories, services, staffMembers } from "@/lib/studio-data";

export function generateStaticParams() {
  return staffMembers.map((staff) => ({ slug: staff.slug }));
}

export default async function StaffProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const staff = getStaffBySlug(slug);

  if (!staff) {
    return (
      <PageShell>
        <section className="mx-auto max-w-4xl px-5 py-24">
          <h1 className="brand-display text-5xl font-black uppercase">Staff member not found</h1>
        </section>
      </PageShell>
    );
  }

  const categories = serviceCategories.filter((category) => staff.serviceCategorySlugs.includes(category.slug));
  const staffServices = services.filter((service) => staff.serviceSlugs.includes(service.slug));

  return (
    <PageShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="neon-card rounded-[3rem] p-5" style={{ boxShadow: `0 0 80px ${staff.calendarColor}22` }}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.3rem] border border-white/10 bg-black">
            <Image
              src={staff.photoUrl}
              alt={`${staff.name} profile photo`}
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/35 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-white/60">Meet me</p>
              <h1 className="brand-display mt-2 text-4xl font-black uppercase text-white md:text-5xl">{staff.name}</h1>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {staff.socialLinks.map((link) => (
              <a key={link.label} href={link.href} className="rounded-full border border-white/15 px-4 py-2 text-sm font-bold text-white/70 hover:text-white">
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <SectionEyebrow color={staff.calendarColor}>Personal profile</SectionEyebrow>
          <h2 className="brand-display text-5xl font-black uppercase md:text-7xl">{staff.name}</h2>
          <p className="mt-3 text-xl font-bold text-white/70">{staff.title}</p>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/68">{staff.bio}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/services/${category.slug}`}
                className="rounded-full px-4 py-2 text-sm font-black uppercase tracking-[0.18em] text-black"
                style={{ background: category.accent }}
              >
                {category.name}
              </Link>
            ))}
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <section className="neon-card rounded-[2rem] p-6">
              <h3 className="brand-display text-2xl font-black uppercase">Services offered</h3>
              <div className="mt-5 grid gap-3">
                {staffServices.map((service) => {
                  const category = serviceCategories.find((item) => item.slug === service.categorySlug);
                  return (
                    <Link
                      href={`/services/${service.categorySlug}`}
                      key={service.slug}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/72 transition hover:bg-white/10"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-black">{service.name}</span>
                        <span className="text-xs font-black" style={{ color: category?.accent ?? staff.calendarColor }}>
                          {service.durationMinutes}m
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-white/50">{service.priceLabel}</p>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section className="neon-card rounded-[2rem] p-6">
              <h3 className="brand-display text-2xl font-black uppercase">Portfolio notes</h3>
              <div className="mt-5 grid gap-3">
                {staff.gallery.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/68">
                    ✦ {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="neon-card rounded-[2rem] p-6 md:col-span-2">
              <h3 className="brand-display text-2xl font-black uppercase">Personal calendar</h3>
              <p className="mt-3 max-w-3xl text-white/62">
                This booking block is reserved for {staff.name}&apos;s own calendar. When employee logins are added, this staff member will only manage their own schedule, while the owner/admin can see and manage every calendar.
              </p>
              <Link href="/book" className="mt-6 inline-block rounded-full bg-white px-5 py-3 font-black uppercase tracking-[0.18em] text-black">
                Book with me
              </Link>
            </section>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
