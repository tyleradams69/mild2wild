import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageShell, SectionEyebrow, StaffCard } from "@/components/site";
import { serviceCategories, staffMembers, type StaffMember } from "@/lib/studio-data";
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
  const mascotProfiles = mergedStaffMembers.filter((staff) => staff.isMascot);
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

        {mascotProfiles.length > 0 ? (
          <div className="mt-10 max-w-4xl rounded-[2rem] border-[3px] border-black bg-[#fff8ea]/92 p-4 shadow-[6px_7px_0_#f3b4da]">
            <div className="grid gap-4 sm:grid-cols-[10rem_1fr] sm:items-center">
              {mascotProfiles.map((staff) => (
                <MascotStaffFeature key={staff.slug} staff={staff} />
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {employeeProfiles.map((staff) => <StaffCard key={staff.slug} staff={staff} />)}
        </div>
      </section>
    </PageShell>
  );
}

function MascotStaffFeature({ staff }: { staff: StaffMember }) {
  return (
    <>
      <Link href={`/staff/${staff.slug}`} className="group relative aspect-square overflow-hidden rounded-[1.5rem] border-[3px] border-black bg-black shadow-[4px_5px_0_#17130f]">
        <Image
          src={staff.photoUrl}
          alt={`${staff.name} profile photo`}
          fill
          sizes="10rem"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full border-2 border-black bg-[#F06BD6] px-3 py-1 text-[0.62rem] font-black uppercase tracking-[0.16em] text-black shadow-[2px_3px_0_#17130f]">
          Mascot
        </span>
      </Link>
      <div className="min-w-0 py-1">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#9BDC3A]">Mascot</p>
        <h2 className="brand-display mt-1 text-3xl font-black uppercase text-black sm:text-4xl">Meet {staff.name}</h2>
        <p className="mt-2 line-clamp-2 max-w-2xl text-sm font-semibold leading-6 text-black/62 sm:text-base">
          {staff.bio}
        </p>
        <Link href={`/staff/${staff.slug}`} className="mt-4 inline-flex rounded-full border-[3px] border-black bg-[#F06BD6] px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black shadow-[3px_4px_0_#17130f] transition hover:-translate-y-0.5">
          View profile →
        </Link>
      </div>
    </>
  );
}
