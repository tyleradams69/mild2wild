"use client";

import { useState } from "react";
import type { BookingServiceGroup } from "@/lib/booking-foundation";

type SubmissionState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

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
          message: payload.errors?.join(" ") ?? "Could not send that booking request yet.",
        });
        return;
      }

      setSubmission({ status: "success", message: "Booking request sent. The shop can confirm it from the dashboard." });
    } catch {
      setSubmission({ status: "error", message: "Could not reach the booking endpoint. Please try again." });
    }
  }

  return (
    <div className="neon-card rounded-[2rem] p-6" style={{ boxShadow: `0 0 70px ${selectedService?.accent ?? "#79D94D"}22` }}>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h2 className="brand-display text-3xl font-black uppercase">Request a booking</h2>
          <p className="mt-3 text-sm leading-6 text-white/62">
            Select a service to see matching team members. Submitting this form does not confirm an appointment; the shop will contact you to finalize availability, pricing, and any deposit requirements.
          </p>
        </div>
        {selectedService ? (
          <span className="rounded-full px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-black" style={{ background: selectedService.accent }}>
            {selectedService.categoryName}
          </span>
        ) : null}
      </div>

      <form action={submitBooking} className="mt-7 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 rounded-2xl border border-white/10 bg-black/45 p-4 text-sm font-bold text-white/75">
            Service
            <select
              className="rounded-xl border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-pink-300"
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

          <label className="grid gap-2 rounded-2xl border border-white/10 bg-black/45 p-4 text-sm font-bold text-white/75">
            Staff member
            <select
              className="rounded-xl border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-cyan-300"
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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
            <p className="font-black uppercase tracking-[0.18em] text-white">{selectedService.name}</p>
            <p className="mt-2">{selectedService.description}</p>
            <p className="mt-2 text-white/45">
              {selectedService.durationMinutes} minutes • {selectedService.priceLabel} • {compatibleStaff.length} matching team members
            </p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Input name="customerName" label="Your name" required />
          <Input name="customerPhone" label="Phone" />
          <Input name="customerEmail" label="Email" type="email" />
          <Input name="startsAt" label="Preferred date/time" type="datetime-local" required />
        </div>

        <label className="grid gap-2 rounded-2xl border border-white/10 bg-black/45 p-4 text-sm font-bold text-white/75">
          Notes
          <textarea name="notes" className="min-h-28 rounded-xl border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-lime-300" placeholder="Tell us the idea, placement, design, inspiration, or anything the staff should know." />
        </label>

        <button className="rounded-full bg-white px-6 py-4 text-sm font-black uppercase tracking-[0.22em] text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-50" disabled={submission.status === "submitting"} type="submit">
          {submission.status === "submitting" ? "Sending..." : "Send booking request"}
        </button>

        {submission.status === "success" || submission.status === "error" ? (
          <p className={`rounded-2xl border p-4 text-sm font-bold ${submission.status === "success" ? "border-lime-300/40 bg-lime-300/10 text-lime-100" : "border-pink-300/40 bg-pink-300/10 text-pink-100"}`}>
            {submission.message}
          </p>
        ) : null}
      </form>
    </div>
  );
}

function Input({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return (
    <label className="grid gap-2 rounded-2xl border border-white/10 bg-black/45 p-4 text-sm font-bold text-white/75">
      {label}
      <input name={name} type={type} required={required} className="rounded-xl border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-lime-300" />
    </label>
  );
}
