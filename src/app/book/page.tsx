import { BookingRequestForm } from "@/components/booking-request-form";
import { PageShell, SectionEyebrow } from "@/components/site";
import { buildBookingServiceGroups } from "@/lib/booking-foundation";
import { serviceCategories, services, staffMembers } from "@/lib/studio-data";

export default function BookPage() {
  const bookingGroups = buildBookingServiceGroups({ serviceCategories, services, staffMembers });

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#79D94D">Booking foundation</SectionEyebrow>
        <h1 className="brand-display max-w-5xl text-5xl font-black uppercase md:text-7xl">Pick a service, pick relevant staff, then book their own calendar.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
          The public booking flow now follows the same staff-service mapping as the service pages: tattoo requests only show tattoo artists, hair requests only show stylists, nail requests only show nail artists, and the shop dog stays non-bookable.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <BookingRequestForm groups={bookingGroups} />

          <div className="grid gap-6">
            <div className="neon-card rounded-[2rem] p-6">
              <h2 className="brand-display text-3xl font-black uppercase">AI call agent intake</h2>
              <p className="mt-4 text-white/65">
                The worker agent should gather name, phone, service requested, preferred staff, date/time preferences, and notes. Then it transfers the call with a concise summary.
              </p>
              <div className="mt-6 rounded-2xl border border-lime-300/30 bg-lime-300/10 p-4 text-lime-100">
                Example handoff: “This is Maya, interested in custom nail art with Team Member 01 next Friday afternoon. First-time client, wants pink chrome flames.”
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
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-4">
          {bookingGroups.map((group) => (
            <section key={group.slug} className="neon-card rounded-[2rem] p-5">
              <h3 className="brand-display text-2xl font-black uppercase" style={{ color: group.accent }}>
                {group.name}
              </h3>
              <ul className="mt-4 space-y-2 text-sm text-white/65">
                {group.services.flatMap((service) =>
                  service.compatibleStaff.map((staff) => (
                    <li key={`${service.slug}-${staff.slug}`}>
                      ✦ {staff.name} <span className="text-white/35">/ {service.name}</span>
                    </li>
                  )),
                )}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
