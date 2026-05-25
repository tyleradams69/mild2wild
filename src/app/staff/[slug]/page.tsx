import Link from "next/link";
import { PageShell, SectionEyebrow } from "@/components/site";
import { getStaffBySlug, serviceCategories, staffMembers } from "@/lib/studio-data";

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

  return (
    <PageShell>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="neon-card rounded-[3rem] p-6">
          <div
            className="flex aspect-[4/5] items-center justify-center rounded-[2rem] text-7xl font-black text-black"
            style={{ background: `linear-gradient(135deg, ${staff.calendarColor}, #ffffff)` }}
          >
            {staff.name
              .split(" ")
              .map((part) => part[0])
              .join("")}
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
          <SectionEyebrow color={staff.calendarColor}>Meet me</SectionEyebrow>
          <h1 className="brand-display text-5xl font-black uppercase md:text-7xl">{staff.name}</h1>
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
              <h2 className="brand-display text-2xl font-black uppercase">Gallery</h2>
              <div className="mt-5 grid gap-3">
                {staff.gallery.map((item) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/68">
                    ✦ {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="neon-card rounded-[2rem] p-6">
              <h2 className="brand-display text-2xl font-black uppercase">Personal calendar</h2>
              <p className="mt-3 text-white/62">
                This booking block will connect to {staff.name}&apos;s own Supabase-backed calendar. Other employees cannot move this calendar.
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
