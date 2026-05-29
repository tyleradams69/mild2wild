import { BookingRequestForm } from "@/components/booking-request-form";
import { PageShell, PaintSplat, SectionEyebrow } from "@/components/site";
import { buildBookingServiceGroups } from "@/lib/booking-foundation";
import { serviceCategories, services, staffMembers } from "@/lib/studio-data";

const bookingNotes = [
  "One request can include inspiration and notes.",
  "Staff choices update based on the selected service.",
  "Timing is reviewed before the appointment is confirmed.",
];

const helpCards = [
  ["Pick the service", "Choose a service first to see matching team members.", "#ffcae6"],
  ["Describe the vibe", "If you are unsure, describe the look or experience you want in the notes.", "#c7f2ff"],
  ["We match it up", "The shop can recommend the best fit when confirming your request.", "#d9ffb8"],
];

export default function BookPage() {
  const bookingGroups = buildBookingServiceGroups({ serviceCategories, services, staffMembers });

  return (
    <PageShell>
      <section className="mx-auto w-full max-w-7xl overflow-hidden px-4 py-12 sm:px-5 md:py-16">
        <SectionEyebrow color="#79D94D">Request an appointment</SectionEyebrow>
        <h1 className="brand-display max-w-5xl break-words text-[2.35rem] font-black uppercase leading-[0.92] min-[390px]:text-4xl sm:text-5xl md:text-7xl">Choose a service, select your preferred team member, and request a booking.</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">
          Pick the appointment type you want and we&apos;ll show the artists, stylists, and specialists available for that service. The shop will follow up to confirm timing, pricing, and any deposit details.
        </p>
        <div className="mt-8 grid min-w-0 gap-3 md:grid-cols-3">
          {bookingNotes.map((item, index) => (
            <div
              key={item}
              className="min-w-0 rounded-2xl border-2 border-black p-4 text-sm font-black text-black/72 shadow-[4px_5px_0_#17130f]"
              style={{ background: ["#ffcae6", "#c7f2ff", "#fff0a3"][index] }}
            >
              ✦ {item}
            </div>
          ))}
        </div>

        <div className="mt-10 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <BookingRequestForm groups={bookingGroups} />

          <div className="grid min-w-0 gap-6">
            <div className="neon-card relative min-w-0 overflow-hidden rounded-[2rem] p-6">
              <PaintSplat color="#F06BD6" variant="bubble" className="absolute -right-16 -top-16 w-44 rotate-12 opacity-35" />
              <div className="relative z-10">
                <h2 className="brand-display text-3xl font-black uppercase">What happens next</h2>
                <p className="mt-4 text-black/65">
                  After you send a request, Mild 2 Wild reviews the details and contacts you to confirm availability. Some tattoo, color, and specialty services may require a consultation before the appointment is finalized.
                </p>
                <div className="service-sticker mt-6 rounded-2xl bg-lime-200 p-4 font-black text-black/72">
                  Tip: include inspiration, placement, size, preferred timing, and whether you have a favorite team member.
                </div>
              </div>
            </div>

            <div className="neon-card relative min-w-0 overflow-hidden rounded-[2rem] p-6">
              <PaintSplat color="#4DDCE5" variant="window" className="absolute -bottom-14 -left-14 w-44 -rotate-12 opacity-30" />
              <div className="relative z-10">
                <h2 className="brand-display text-3xl font-black uppercase">Need help choosing?</h2>
                <div className="mt-5 grid gap-3">
                  {helpCards.map(([label, copy, color]) => (
                    <div key={label} className="rounded-2xl border-2 border-black p-4 shadow-[4px_5px_0_#17130f]" style={{ background: color }}>
                      <p className="marker-script text-lg uppercase tracking-[0.04em] text-black">{label}</p>
                      <p className="mt-1 text-sm font-bold leading-6 text-black/72">{copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid min-w-0 gap-5 md:grid-cols-4">
          {bookingGroups.map((group, groupIndex) => (
            <section
              key={group.slug}
              className="neon-card min-w-0 overflow-hidden rounded-[2rem] p-5"
              style={{ boxShadow: `7px 8px 0 #17130f, 0 0 0 7px ${group.accent}33, 0 24px 54px rgba(40, 26, 20, 0.18)` }}
            >
              <div className="mb-4">
                <h3 className="brand-display text-2xl font-black uppercase text-black">
                  {group.name}
                </h3>
              </div>
              <ul className="space-y-2.5 text-sm">
                {group.services.flatMap((service, serviceIndex) =>
                  service.compatibleStaff.map((staff, staffIndex) => (
                    <li
                      key={`${service.slug}-${staff.slug}`}
                      className="rounded-2xl border-2 border-black bg-white/70 px-3 py-2 font-bold text-black/72 shadow-[3px_4px_0_#17130f]"
                    >
                      <span className="marker-script mr-1 text-base uppercase text-black" style={{ color: group.accent }}>
                        {["✦", "✧", "★", "✸"][(groupIndex + serviceIndex + staffIndex) % 4]}
                      </span>
                      <span className="font-black text-black">{staff.name}</span>
                      <span className="text-black/58"> / {service.name}</span>
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
