import { PageShell, SectionEyebrow, StaffCard } from "@/components/site";
import { staffMembers } from "@/lib/studio-data";

export default function StaffIndexPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#F06BD6">Meet the crew</SectionEyebrow>
        <h1 className="brand-display max-w-4xl text-5xl font-black uppercase md:text-7xl">Every employee gets a personal meet-me page.</h1>
        <p className="mt-6 max-w-3xl text-lg text-white/65">
          Bios, photos, service lists, portfolios, social links, and individual booking calendars live here.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {staffMembers.map((staff) => (
            <StaffCard key={staff.slug} staff={staff} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
