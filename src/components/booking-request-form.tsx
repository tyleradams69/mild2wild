"use client";

import { useState } from "react";
import type { BookingServiceGroup } from "@/lib/booking-foundation";

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

const fieldShells = [
  "bg-pink-100/85 focus-within:bg-pink-100",
  "bg-cyan-100/85 focus-within:bg-cyan-100",
  "bg-yellow-100/85 focus-within:bg-yellow-100",
  "bg-lime-100/85 focus-within:bg-lime-100",
  "bg-purple-100/85 focus-within:bg-purple-100",
];

const fieldShellBase = "grid min-w-0 gap-2 rounded-[1.35rem] border-2 border-black p-4 text-sm font-black uppercase tracking-[0.08em] text-black/65 shadow-[4px_5px_0_#17130f] transition";
const controlBase = "w-full min-w-0 max-w-full rounded-2xl border-2 border-black bg-[#fffaf0] px-3 py-3 font-bold normal-case tracking-normal text-black shadow-[3px_4px_0_#17130f] outline-none placeholder:text-black/55 focus:bg-white";

export function BookingRequestForm({ groups }: { groups: BookingServiceGroup[] }) {
  const serviceOptions = groups.flatMap((group) => group.services.map((service) => ({ ...service, categoryName: group.name, accent: group.accent })));
  const [selectedServiceSlug, setSelectedServiceSlug] = useState(serviceOptions[0]?.slug ?? "");
  const selectedService = serviceOptions.find((service) => service.slug === selectedServiceSlug) ?? serviceOptions[0];
  const compatibleStaff = selectedService?.compatibleStaff ?? [];
  const [selectedStaffSlug, setSelectedStaffSlug] = useState(compatibleStaff[0]?.slug ?? "");
  const [submission, setSubmission] = useState<SubmissionState>({ status: "idle" });

  function handleServiceChange(serviceSlug: string) {
    const nextService = serviceOptions.find((service) => service.slug === serviceSlug);
    setSelectedServiceSlug(serviceSlug);
    setSelectedStaffSlug(nextService?.compatibleStaff[0]?.slug ?? "");
  }

  async function submitBooking(formData: FormData) {
    setSubmission({ status: "submitting" });

    const startsAtValue = formData.get("startsAt")?.toString() ?? "";
    const startsAt = startsAtValue ? new Date(startsAtValue).toISOString() : "";

    try {
      const response = await fetch("/api/booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.get("customerName")?.toString(),
          customerPhone: formData.get("customerPhone")?.toString(),
          customerEmail: formData.get("customerEmail")?.toString(),
          serviceSlug: selectedServiceSlug,
          staffSlug: selectedStaffSlug,
          startsAt,
          notes: formData.get("notes")?.toString(),
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; errors?: string[] };

      if (!response.ok || !payload.ok) {
        setSubmission({
          status: "error",
          message: payload.errors?.join(" ") ?? "Could not send that booking request yet. Please contact the shop directly if the problem continues.",
        });
        return;
      }

      setSubmission({ status: "success", message: "Booking request sent. The shop will review the details and follow up to confirm availability." });
    } catch {
      setSubmission({ status: "error", message: "Could not reach online booking. Please try again or contact the shop directly." });
    }
  }

  return (
    <div
      className="neon-card relative w-full min-w-0 max-w-full overflow-hidden rounded-[2rem] bg-[#fff7e8] p-5 shadow-[8px_9px_0_#17130f,0_0_0_8px_#F06BD633,0_26px_60px_rgba(40,26,20,0.2)] sm:p-6"
    >
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border-[3px] border-black bg-pink-200/65 opacity-70" />
      <div className="absolute -bottom-14 -left-12 h-40 w-40 rounded-full border-[3px] border-black bg-cyan-200/60 opacity-60" />

      <div className="relative z-10 flex min-w-0 flex-col justify-between gap-4 md:flex-row md:items-start">
        <div className="min-w-0">
          <h2 className="brand-display text-3xl font-black uppercase">Request a booking</h2>
          <p className="mt-3 text-sm leading-6 text-black/65">
            Select a service to see matching team members. Submitting this form does not confirm an appointment; the shop will contact you to finalize availability, pricing, and any deposit requirements.
          </p>
        </div>
        {selectedService ? (
          <span className="service-sticker w-fit max-w-full rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black" style={{ background: selectedService.accent }}>
            {selectedService.categoryName}
          </span>
        ) : null}
      </div>

      <form action={submitBooking} className="relative z-10 mt-7 grid min-w-0 gap-4">
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          <label className={`${fieldShellBase} ${fieldShells[0]}`}>
            Service
            <select
              className={`${controlBase} focus:border-pink-500`}
              value={selectedServiceSlug}
              onChange={(event) => handleServiceChange(event.target.value)}
            >
              {groups.map((group) => (
                <optgroup key={group.slug} label={group.name}>
                  {group.services.map((service) => (
                    <option key={service.slug} value={service.slug}>
                      {service.name} — {service.priceLabel}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <label className={`${fieldShellBase} ${fieldShells[1]}`}>
            Staff member
            <select
              className={`${controlBase} focus:border-cyan-500`}
              value={selectedStaffSlug}
              onChange={(event) => setSelectedStaffSlug(event.target.value)}
            >
              {compatibleStaff.map((staff) => (
                <option key={staff.slug} value={staff.slug}>
                  {staff.name} — {staff.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedService ? (
          <div className="min-w-0 rounded-[1.35rem] border-2 border-black bg-white/75 p-4 text-sm text-black/68 shadow-[4px_5px_0_#17130f]">
            <p className="font-black uppercase tracking-[0.18em] text-black">{selectedService.name}</p>
            <p className="mt-2">{selectedService.description}</p>
            <p className="mt-2 font-bold text-black/58">
              {selectedService.durationMinutes} minutes • {selectedService.priceLabel} • {compatibleStaff.length} matching team members
            </p>
          </div>
        ) : null}

        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          <Input name="customerName" label="Your name" required tone={2} />
          <Input name="customerPhone" label="Phone" tone={3} />
          <Input name="customerEmail" label="Email" type="email" tone={4} />
          <Input name="startsAt" label="Preferred date/time" type="datetime-local" required tone={1} />
        </div>

        <label className={`${fieldShellBase} ${fieldShells[0]}`}>
          Notes
          <textarea name="notes" className={`${controlBase} min-h-28 focus:border-lime-500`} placeholder="Tell us the idea, placement, design, inspiration, or anything the staff should know." />
        </label>

        <button className="shop-tag w-full bg-lime-200 px-6 py-4 text-sm font-black uppercase tracking-[0.16em] transition hover:-translate-y-0.5 hover:bg-yellow-200 disabled:cursor-not-allowed disabled:opacity-50 sm:tracking-[0.22em]" disabled={submission.status === "submitting"} type="submit">
          {submission.status === "submitting" ? "Sending..." : "Send booking request"}
        </button>

        {submission.status === "success" || submission.status === "error" ? (
          <p className={`rounded-2xl border-2 border-black p-4 text-sm font-bold shadow-[4px_5px_0_#17130f] ${submission.status === "success" ? "bg-lime-100 text-black/75" : "bg-pink-100 text-black/75"}`}>
            {submission.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}

function Input({ label, name, type = "text", required = false, tone = 0 }: { label: string; name: string; type?: string; required?: boolean; tone?: number }) {
  return (
    <label className={`${fieldShellBase} ${fieldShells[tone % fieldShells.length]}`}>
      {label}
      <input name={name} type={type} required={required} className={`${controlBase} focus:border-lime-500`} />
    </label>
  );
}
