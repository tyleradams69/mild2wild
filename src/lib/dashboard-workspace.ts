import type { DashboardAuthSession } from "./auth-session";
import { buildLeadWorkflowSummary, type LeadWorkflowStatus } from "./lead-workflow";
import type { StaffMember, StudioService } from "./studio-data";

export type ProfileEditorModel = {
  canManageAllProfiles: boolean;
  editableProfiles: Array<{
    slug: string;
    name: string;
    title: string;
    photoUrl: string;
    serviceNames: string[];
    bio: string;
    socialLinks: StaffMember["socialLinks"];
  }>;
};

export type DashboardAppointmentRow = {
  id: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  service_slug?: string | null;
  service_name?: string | null;
  staff_slug?: string | null;
  staff_name?: string | null;
  starts_at?: string | null;
  status?: string | null;
  lead_status?: string | null;
  internal_notes?: string | null;
  notes?: string | null;
};

export type DashboardInboxItem = {
  id: string;
  source: "Booking form";
  customerName: string;
  contact: string;
  serviceLabel: string;
  routedStaffSlug: string | null;
  routedStaffName: string;
  requestedFor: string;
  summary: string;
  statusLabel: string;
  workflowStatus: LeadWorkflowStatus;
  workflowStatusLabel: string;
  workflowTone: string;
  nextAction: string;
  internalNote: string;
  ownerAlertLabel: string | null;
  sortTime: string;
};

export function buildProfileEditorModel(session: DashboardAuthSession, staffMembers: StaffMember[], services: StudioService[] = []): ProfileEditorModel {
  const editableStaff = session.role === "owner" ? staffMembers : [];

  return {
    canManageAllProfiles: session.role === "owner",
    editableProfiles: editableStaff.map((staff) => ({
      slug: staff.slug,
      name: staff.name,
      title: staff.title,
      photoUrl: staff.photoUrl,
      bio: staff.bio,
      socialLinks: staff.socialLinks,
      serviceNames: staff.serviceSlugs.map((slug) => services.find((service) => service.slug === slug)?.name ?? humanizeSlug(slug)),
    })),
  };
}

export function buildDashboardLeadInbox({
  session,
  staffMembers,
  services,
  appointments,
}: {
  session: DashboardAuthSession;
  staffMembers: StaffMember[];
  services: StudioService[];
  appointments: DashboardAppointmentRow[];
}): DashboardInboxItem[] {
  const canSeeLead = (staffSlug: string | null) => session.role === "owner" || (!!staffSlug && staffSlug === session.staffSlug);

  const appointmentItems = appointments
    .map((row): DashboardInboxItem => {
      const routedStaffSlug = row.staff_slug ?? null;
      const staff = routedStaffSlug ? staffMembers.find((item) => item.slug === routedStaffSlug) : undefined;
      const service = row.service_slug ? services.find((item) => item.slug === row.service_slug) : undefined;
      const requestedFor = row.starts_at ? formatLeadDate(row.starts_at) : "Time TBD";
      const workflow = buildLeadWorkflowSummary(row.lead_status, row.internal_notes);
      return {
        id: row.id,
        source: "Booking form",
        customerName: clean(row.customer_name) || "New client",
        contact: clean(row.customer_phone) || clean(row.customer_email) || "Contact missing",
        serviceLabel: clean(row.service_name) || service?.name || humanizeSlug(row.service_slug ?? "service TBD"),
        routedStaffSlug,
        routedStaffName: clean(row.staff_name) || staff?.name || "Unassigned",
        requestedFor,
        summary: clean(row.notes) || `Booking request for ${requestedFor}.`,
        statusLabel: clean(row.status) || "requested",
        workflowStatus: workflow.status,
        workflowStatusLabel: workflow.label,
        workflowTone: workflow.tone,
        nextAction: workflow.nextAction,
        internalNote: workflow.notePreview,
        ownerAlertLabel: null,
        sortTime: row.starts_at ?? "",
      };
    })
    .filter((item) => canSeeLead(item.routedStaffSlug));

  return appointmentItems.sort((a, b) => b.sortTime.localeCompare(a.sortTime));
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function humanizeSlug(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatLeadDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
