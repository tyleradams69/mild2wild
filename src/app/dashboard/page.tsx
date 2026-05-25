import { PageShell, SectionEyebrow } from "@/components/site";
import { getStaffDashboardScope, staffMembers } from "@/lib/studio-data";

export default function DashboardPage() {
  const ownerScope = getStaffDashboardScope("owner");
  const exampleStaffScope = getStaffDashboardScope("staff", staffMembers[0]?.slug);

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#A95CFF">Admin + staff portal</SectionEyebrow>
        <h1 className="brand-display max-w-5xl text-5xl font-black uppercase md:text-7xl">Role-based calendars are the backbone.</h1>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="neon-card rounded-[2rem] p-6">
            <h2 className="brand-display text-3xl font-black uppercase">Owner admin</h2>
            <p className="mt-3 text-white/65">Can manage all calendars, staff, services, products, and call-agent leads.</p>
            <p className="mt-5 text-sm text-purple-200">Visible calendars: {ownerScope.visibleStaffSlugs.length}</p>
          </article>
          <article className="neon-card rounded-[2rem] p-6">
            <h2 className="brand-display text-3xl font-black uppercase">Employee login</h2>
            <p className="mt-3 text-white/65">Can manage their own profile, availability, and bookings only.</p>
            <p className="mt-5 text-sm text-pink-200">Example visible calendar: {exampleStaffScope.visibleStaffSlugs.join(", ")}</p>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
