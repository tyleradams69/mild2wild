import Link from "next/link";
import { PageShell, SectionEyebrow } from "@/components/site";

const policies = [
  {
    title: "Booking requests are not final confirmations",
    body:
      "Online requests and AI call-agent leads hold the details the team needs to follow up. Appointment times, staff assignments, final pricing, deposits, and required consultations are confirmed directly by Mild 2 Wild before the appointment is considered booked.",
  },
  {
    title: "Tattoo consultations, age, ID, and consent",
    body:
      "Tattoo services may require a consultation, valid government-issued photo ID, signed consent forms, and artist approval before scheduling. Minor tattoo policies, if any, must follow Ohio law and shop policy. The shop may decline or reschedule work that cannot be performed safely or legally.",
  },
  {
    title: "Deposits, cancellations, and no-shows",
    body:
      "Some services may require a deposit to reserve time. Deposits, cancellation windows, rescheduling limits, late arrivals, and no-show rules should be confirmed by the shop before payment. Any final deposit/refund terms should be reviewed and approved by the owner before publishing publicly.",
  },
  {
    title: "Health, safety, and service suitability",
    body:
      "Clients should disclose allergies, sensitivities, medications, skin conditions, recent procedures, injuries, pregnancy considerations, or other health details that may affect nails, hair, spa, aesthetics, or tattoo services. Staff may recommend a different service, patch test, consultation, or medical clearance when appropriate.",
  },
  {
    title: "Pricing and service scope",
    body:
      "Published prices may be starting prices or estimates. Final pricing can vary by design complexity, hair length/density, product usage, tattoo size/placement/detail, add-ons, and staff recommendation. The shop should confirm final pricing before service begins.",
  },
  {
    title: "Product sales and aftercare",
    body:
      "Product availability, ingredients, and aftercare recommendations may change. Clients should follow staff-provided aftercare instructions and contact the shop with service-specific questions. Product information on the website should not replace professional advice from the service provider.",
  },
  {
    title: "Privacy and communications",
    body:
      "The site and call agent may collect names, phone numbers, emails, requested services, preferred staff, timing preferences, and notes so the business can follow up. Client details should be used for scheduling, customer support, service records, and related business communication only.",
  },
  {
    title: "AI call-agent handoff",
    body:
      "The worker agent should collect the caller's important booking details, transfer the call to the business owner, and send a text summary after the call. The owner or staff should still verify details with the client before confirming an appointment.",
  },
];

export default function LegalPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-16">
        <SectionEyebrow color="#FFE45C">Legal & policies</SectionEyebrow>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="neon-card rounded-[2rem] p-7">
            <h1 className="brand-display text-5xl font-black uppercase md:text-7xl">Shop policies, consent, and privacy basics.</h1>
            <p className="mt-6 text-lg leading-8 text-white/65">
              Draft policy language for Mild 2 Wild&apos;s multi-service site. The owner should review these rules before launch, especially tattoo consent, deposit/refund terms, and privacy language.
            </p>
            <div className="mt-8 rounded-3xl border border-pink-300/30 bg-pink-500/10 p-5 text-sm leading-6 text-pink-50">
              <strong className="block font-black uppercase tracking-[0.2em]">Launch note</strong>
              This page is client-facing policy copy, not legal advice. Have Caitlin approve the final public version before publishing.
            </div>
            <Link
              href="/book"
              className="mt-8 inline-block rounded-full bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-black transition hover:bg-pink-300"
            >
              Back to booking
            </Link>
          </div>

          <div className="grid gap-5">
            {policies.map((policy, index) => (
              <article key={policy.title} className="neon-card rounded-[2rem] p-6">
                <p className="text-xs font-black uppercase tracking-[0.28em] text-white/35">Policy {String(index + 1).padStart(2, "0")}</p>
                <h2 className="brand-display mt-3 text-3xl font-black uppercase text-white">{policy.title}</h2>
                <p className="mt-4 leading-7 text-white/65">{policy.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
