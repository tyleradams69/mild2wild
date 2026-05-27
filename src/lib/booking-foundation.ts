import type { ServiceCategory, StaffMember, StudioService } from "./studio-data";

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
  serviceName: string;
  staffSlug: string;
  startsAt: string;
  endsAt: string;
  durationMinutes: number;
  notes: string | null;
};


type ValidationResult<T> = { ok: true; value: T } | { ok: false; errors: string[] };

type BookingDataset = {
  services: Pick<StudioService, "slug" | "name" | "durationMinutes">[];
  staffMembers: Pick<StaffMember, "slug" | "serviceSlugs">[];
};

export type BookingServiceGroup = {
  slug: string;
  name: string;
  accent: string;
  services: Array<{
    slug: string;
    name: string;
    priceLabel: string;
    durationMinutes: number;
    description: string;
    compatibleStaff: Array<{
      slug: string;
      name: string;
      title: string;
      calendarColor: string;
    }>;
  }>;
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
      serviceName: service.name,
      staffSlug,
      startsAt,
      endsAt: addMinutes(startsAt, service.durationMinutes),
      durationMinutes: service.durationMinutes,
      notes,
    },
  };
}

export function buildBookingServiceGroups({
  serviceCategories,
  services,
  staffMembers,
}: {
  serviceCategories: ServiceCategory[];
  services: StudioService[];
  staffMembers: StaffMember[];
}): BookingServiceGroup[] {
  const bookableStaff = staffMembers.filter((staff) => !staff.isMascot);

  return serviceCategories.map((category) => ({
    slug: category.slug,
    name: category.name,
    accent: category.accent,
    services: services
      .filter((service) => service.categorySlug === category.slug)
      .map((service) => ({
        slug: service.slug,
        name: service.name,
        priceLabel: service.priceLabel,
        durationMinutes: service.durationMinutes,
        description: service.description,
        compatibleStaff: bookableStaff
          .filter((staff) => staff.serviceSlugs.includes(service.slug))
          .map((staff) => ({
            slug: staff.slug,
            name: staff.name,
            title: staff.title,
            calendarColor: staff.calendarColor,
          })),
      })),
  }));
}

export function buildAppointmentInsert(request: ValidatedBookingRequest, maps: IdMaps) {
  const staffId = maps.staffIdsBySlug.get(request.staffSlug);
  const serviceId = maps.serviceIdsBySlug.get(request.serviceSlug);

  if (!staffId) throw new Error(`Missing database staff id for ${request.staffSlug}`);
  if (!serviceId) throw new Error(`Missing database service id for ${request.serviceSlug}`);

  return {
    staff_id: staffId,
    service_id: serviceId,
    service_name: request.serviceName,
    source: "website" as const,
    customer_name: request.customerName,
    customer_phone: request.customerPhone,
    customer_email: request.customerEmail,
    starts_at: request.startsAt,
    ends_at: request.endsAt,
    status: "requested" as const,
    notes: request.notes,
  };
}
