import Link from "next/link";
import { PageShell, SectionEyebrow, StaffCard } from "@/components/site";
import { serviceCategories, staffMembers } from "@/lib/studio-data";

export default function StaffIndexPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#F06BD6">Meet the crew</SectionEyebrow>
        <h1 className="brand-display max-w-4xl text-5xl font-black uppercase md:text-7xl">Every employee gets a personal meet-me page.</h1>
        <p className="mt-6 max-w-3xl text-lg text-white/65">
          The real names and bios can drop in later. The structure is ready now: profile photo, services, social links, portfolio notes, and a personal calendar lane for each staff member.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {serviceCategories.map((category) => {
            const count = staffMembers.filter((staff) => staff.serviceCategorySlugs.includes(category.slug)).length;
            return (
              <Link
                key={category.slug}
                href={`/services/${category.slug}`}
                className="rounded-full border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white/70 transition hover:text-black"
                style={{ borderColor: `${category.accent}55` }}
              >
                <span style={{ color: category.accent }}>{count}</span> {category.staffLabel}
              </Link>
            );
          })}
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {staffMembers.map((staff) => (
            <StaffCard key={staff.slug} staff={staff} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
