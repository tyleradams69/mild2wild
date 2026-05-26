import Link from "next/link";
import { PageShell, SectionEyebrow, StaffCard } from "@/components/site";
import { serviceCategories, staffMembers } from "@/lib/studio-data";

export default function StaffIndexPage() {
  const mascotProfiles = staffMembers.filter((staff) => staff.isMascot);
  const employeeProfiles = staffMembers.filter((staff) => !staff.isMascot);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#F06BD6">Meet the crew</SectionEyebrow>
        <h1 className="brand-display max-w-4xl text-5xl font-black uppercase md:text-7xl">Meet the artists, stylists, and specialists.</h1>
        <p className="mt-6 max-w-3xl text-lg text-white/65">
          Explore the team by service category, view individual profiles, and choose who feels like the right fit for your next appointment.
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

        {mascotProfiles.length > 0 ? (
          <div className="mt-10 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-lime-300">Shop mascot</p>
                <h2 className="brand-display mt-2 text-3xl font-black uppercase">Meet the shop mascot</h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-white/55">
                The shop dog is part of the Mild 2 Wild personality, but this profile is for brand fun only and cannot be booked for appointments.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {mascotProfiles.map((staff) => (
                <StaffCard key={staff.slug} staff={staff} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {employeeProfiles.map((staff) => (
            <StaffCard key={staff.slug} staff={staff} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
