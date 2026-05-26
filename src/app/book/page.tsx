import { BookingRequestForm } from "@/components/booking-request-form";
import { PageShell, SectionEyebrow } from "@/components/site";
import { buildBookingServiceGroups } from "@/lib/booking-foundation";
import { serviceCategories, services, staffMembers } from "@/lib/studio-data";

export default function BookPage() {
  const bookingGroups = buildBookingServiceGroups({ serviceCategories, services, staffMembers });

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#79D94D">Request an appointment</SectionEyebrow>
        <h1 className="brand-display max-w-5xl text-5xl font-black uppercase md:text-7xl">Choose a service, select your preferred team member, and request a booking.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
          Pick the appointment type you want and we&apos;ll show the artists, stylists, and specialists available for that service. The shop will follow up to confirm timing, pricing, and any deposit details.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <BookingRequestForm groups={bookingGroups} />

          <div className="grid gap-6">
            <div className="neon-card rounded-[2rem] p-6">
              <h2 className="brand-display text-3xl font-black uppercase">What happens next</h2>
              <p className="mt-4 text-white/65">
                After you send a request, Mild 2 Wild reviews the details and contacts you to confirm availability. Some tattoo, color, and specialty services may require a consultation before the appointment is finalized.
              </p>
              <div className="mt-6 rounded-2xl border border-lime-300/30 bg-lime-300/10 p-4 text-lime-100">
                Tip: include inspiration, placement, size, preferred timing, and whether you have a favorite team member.
              </div>
            </div>

            <div className="neon-card rounded-[2rem] p-6">
              <h2 className="brand-display text-3xl font-black uppercase">Need help choosing?</h2>
              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">Choose a service first to see matching team members.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">If you are unsure, describe the look or experience you want in the notes.</div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">The shop can recommend the best fit when confirming your request.</div>
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
