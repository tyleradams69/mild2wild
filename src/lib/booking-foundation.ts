import type { StaffMember, StudioService } from "./studio-data";

export type BookingRequestInput = {
  customerName?: unknown;
  customerPhone?: unknown;
  customerEmail?: unknown;
  serviceSlug?: unknown;
  staffSlug?: unknown;
  startsAt?: unknown;
  notes?: unknown;
};

export type ValidatedBookingRequest = {
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  serviceSlug: string;
  staffSlug: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  notes: string | null;
};

export type CallAgentLeadInput = {
  customerName?: unknown;
  customerPhone?: unknown;
  requestedService?: unknown;
  preferredStaffSlug?: unknown;
  preferredTime?: unknown;
  summary?: unknown;
  transferredTo?: unknown;
};

export type ValidatedCallAgentLead = {
  customerName: string;
  customerPhone: string | null;
  requestedService: string;
  preferredStaffSlug: string | null;
  preferredTime: string | null;
  summary: string;
  transferredTo: string | null;
};

type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };

type BookingDataset = {
  services: Pick<StudioService, "slug" | "durationMinutes">[];
  staffMembers: Pick<StaffMember, "slug" | "serviceSlugs">[];
};

type IdMaps = {
  staffIdsBySlug: Map<string, string>;
  serviceIdsBySlug: Map<string, string>;
};

function asTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function nullableString(value: unknown) {
  const text = asTrimmedString(value);
  return text || null;
}

function addMinutes(isoDate: string, minutes: number) {
  const date = new Date(isoDate);
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  return date.toISOString();
}

export function validateBookingRequest(input: BookingRequestInput, dataset: BookingDataset): ValidationResult<ValidatedBookingRequest> {
  const errors: string[] = [];
  const customerName = asTrimmedString(input.customerName);
  const customerPhone = nullableString(input.customerPhone);
  const customerEmail = nullableString(input.customerEmail);
  const serviceSlug = asTrimmedString(input.serviceSlug);
  const staffSlug = asTrimmedString(input.staffSlug);
  const notes = nullableString(input.notes);
  const startsAtRaw = asTrimmedString(input.startsAt);

  if (!customerName) errors.push("Customer name is required.");
  if (!customerPhone && !customerEmail) errors.push("Customer phone or email is required.");

  const service = dataset.services.find((item) => item.slug === serviceSlug);
  if (!service) errors.push("Selected service is not available.");

  const staff = dataset.staffMembers.find((item) => item.slug === staffSlug);
  if (!staff) errors.push("Selected staff member is not available.");

  const startsAtDate = new Date(startsAtRaw);
  if (!startsAtRaw || Number.isNaN(startsAtDate.getTime())) {
    errors.push("Valid appointment start time is required.");
  }

  if (service && staff && !staff.serviceSlugs.includes(service.slug)) {
    errors.push("Selected staff member does not offer that service.");
  }

  if (errors.length > 0 || !service) {
    return { ok: false, errors };
  }

  const startsAt = startsAtDate.toISOString();

  return {
    ok: true,
    value: {
      customerName,
      customerPhone,
      customerEmail,
      serviceSlug,
      staffSlug,
      startsAt,
      endsAt: addMinutes(startsAt, service.durationMinutes),
      durationMinutes: service.durationMinutes,
      notes,
    },
  };
}

export function buildAppointmentInsert(request: ValidatedBookingRequest, maps: IdMaps) {
  const staffId = maps.staffIdsBySlug.get(request.staffSlug);
  const serviceId = maps.serviceIdsBySlug.get(request.serviceSlug);

  if (!staffId) throw new Error(`Missing database staff id for ${request.staffSlug}`);
  if (!serviceId) throw new Error(`Missing database service id for ${request.serviceSlug}`);

  return {
    staff_id: staffId,
    service_id: serviceId,
    customer_name: request.customerName,
    customer_phone: request.customerPhone,
    customer_email: request.customerEmail,
    starts_at: request.startsAt,
    ends_at: request.endsAt,
    status: "requested" as const,
    notes: request.notes,
  };
}

export function validateCallAgentLead(input: CallAgentLeadInput): ValidationResult<ValidatedCallAgentLead> {
  const errors: string[] = [];
  const customerName = asTrimmedString(input.customerName);
  const customerPhone = nullableString(input.customerPhone);
  const requestedService = asTrimmedString(input.requestedService);
  const preferredStaffSlug = nullableString(input.preferredStaffSlug);
  const preferredTime = nullableString(input.preferredTime);
  const summary = asTrimmedString(input.summary);
  const transferredTo = nullableString(input.transferredTo);

  if (!customerName) errors.push("Customer name is required.");
  if (!requestedService) errors.push("Requested service is required.");
  if (!summary) errors.push("Transfer summary is required.");

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      customerName,
      customerPhone,
      requestedService,
      preferredStaffSlug,
      preferredTime,
      summary,
      transferredTo,
    },
  };
}

export function buildCallAgentLeadInsert(lead: ValidatedCallAgentLead) {
  return {
    customer_name: lead.customerName,
    customer_phone: lead.customerPhone,
    requested_service: lead.requestedService,
    preferred_staff_slug: lead.preferredStaffSlug,
    preferred_time: lead.preferredTime,
    summary: lead.summary,
    transferred_to: lead.transferredTo,
  };
}
