import { PageShell, SectionEyebrow } from "@/components/site";
import { serviceCategories, staffMembers } from "@/lib/studio-data";

export default function BookPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#79D94D">Booking foundation</SectionEyebrow>
        <h1 className="brand-display max-w-5xl text-5xl font-black uppercase md:text-7xl">Pick a service, pick relevant staff, then book their own calendar.</h1>
        <div className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="neon-card rounded-[2rem] p-6">
            <h2 className="brand-display text-3xl font-black uppercase">AI call agent intake</h2>
            <p className="mt-4 text-white/65">
              The worker agent should gather name, phone, service requested, preferred staff, date/time preferences, and notes. Then it transfers the call with a concise summary.
            </p>
            <div className="mt-6 rounded-2xl border border-lime-300/30 bg-lime-300/10 p-4 text-lime-100">
              Example handoff: “This is Maya, interested in custom nail art with Luna next Friday afternoon. First-time client, wants pink chrome flames.”
            </div>
          </div>
          <div className="neon-card rounded-[2rem] p-6">
            <h2 className="brand-display text-3xl font-black uppercase">Calendar permissions</h2>
            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Owner/admin: sees and manages all staff calendars.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Staff login: manages only their own calendar and profile.</div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Service page: only shows staff mapped to that service category.</div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {serviceCategories.map((category) => (
            <section key={category.slug} className="neon-card rounded-[2rem] p-5">
              <h3 className="brand-display text-2xl font-black uppercase" style={{ color: category.accent }}>{category.name}</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/65">
                {staffMembers
                  .filter((staff) => staff.serviceCategorySlugs.includes(category.slug))
                  .map((staff) => (
                    <li key={staff.slug}>✦ {staff.name}</li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
