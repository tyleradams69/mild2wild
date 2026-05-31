import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, SectionEyebrow, StaffCard } from "@/components/site";
import { serviceCategories, staffMembers } from "@/lib/studio-data";
import { readStoredStaffMembers } from "@/lib/staff-profile-overrides";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meet the Team",
  description: "Meet the Mild 2 Wild artists, stylists, nail techs, tattoo artists, aesthetics specialists, and shop mascot before requesting an appointment.",
  alternates: { canonical: "/staff" },
  openGraph: {
    title: "Meet the Team | Mild 2 Wild",
    description: "Explore Mild 2 Wild staff profiles by service category and request an appointment with the right team member.",
    url: "/staff",
  },
};

export default async function StaffIndexPage() {
  const mergedStaffMembers = await readStoredStaffMembers(staffMembers);
  const employeeProfiles = mergedStaffMembers.filter((staff) => !staff.isMascot);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-5 md:py-16">
        <SectionEyebrow color="#F06BD6">Meet the crew</SectionEyebrow>
        <h1 className="brand-display max-w-4xl text-3xl font-black uppercase sm:text-5xl md:text-7xl">Meet the artists, stylists, and specialists.</h1>
        <p className="mt-6 max-w-3xl text-lg text-white/65">
          Explore the team by service category, view individual profiles, and choose who feels like the right fit for your next appointment.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          {serviceCategories.map((category) => {
            const count = mergedStaffMembers.filter((staff) => staff.serviceCategorySlugs.includes(category.slug)).length;
            return (
              <Link
                key={category.slug}
                href={`/services/${category.slug}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-2 text-[0.68rem] font-black uppercase tracking-[0.14em] text-white/70 transition hover:text-black sm:px-4 sm:text-xs sm:tracking-[0.18em]"
                style={{ borderColor: `${category.accent}55` }}
              >
                <span style={{ color: category.accent }}>{count}</span>
                <span>{category.staffLabel}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {employeeProfiles.map((staff) => <StaffCard key={staff.slug} staff={staff} />)}
        </div>
      </section>
    </PageShell>
  );
}
