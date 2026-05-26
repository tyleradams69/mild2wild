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

export type DashboardCallAgentLeadRow = {
  id: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  requested_service?: string | null;
  preferred_staff_slug?: string | null;
  preferred_staff_name?: string | null;
  preferred_time?: string | null;
  summary?: string | null;
  transferred_to?: string | null;
  text_summary_recipient?: string | null;
  text_summary_status?: string | null;
  lead_status?: string | null;
  internal_notes?: string | null;
  created_at?: string | null;
};

export type DashboardInboxItem = {
  id: string;
  source: "Booking form" | "Call agent";
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
  const editableStaff = staffMembers.filter((staff) => !staff.isMascot && (session.role === "owner" || staff.slug === session.staffSlug));

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
  callAgentLeads,
}: {
  session: DashboardAuthSession;
  staffMembers: StaffMember[];
  services: StudioService[];
  appointments: DashboardAppointmentRow[];
  callAgentLeads: DashboardCallAgentLeadRow[];
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

  const callItems = callAgentLeads
    .map((row): DashboardInboxItem => {
      const routedStaffSlug = row.preferred_staff_slug ?? null;
      const staff = routedStaffSlug ? staffMembers.find((item) => item.slug === routedStaffSlug) : undefined;
      const status = buildCallAgentStatus(row);
      const workflow = buildLeadWorkflowSummary(row.lead_status, row.internal_notes);
      return {
        id: row.id,
        source: "Call agent",
        customerName: clean(row.customer_name) || "Caller",
        contact: clean(row.customer_phone) || "Phone missing",
        serviceLabel: clean(row.requested_service) || "Service TBD",
        routedStaffSlug,
        routedStaffName: clean(row.preferred_staff_name) || staff?.name || "Front desk",
        requestedFor: clean(row.preferred_time) || "Time TBD",
        summary: clean(row.summary) || "Call-agent transfer needs review.",
        statusLabel: status.statusLabel,
        workflowStatus: workflow.status,
        workflowStatusLabel: workflow.label,
        workflowTone: workflow.tone,
        nextAction: workflow.nextAction,
        internalNote: workflow.notePreview,
        ownerAlertLabel: status.ownerAlertLabel,
        sortTime: row.created_at ?? "",
      };
    })
    .filter((item) => canSeeLead(item.routedStaffSlug));

  return [...appointmentItems, ...callItems].sort((a, b) => b.sortTime.localeCompare(a.sortTime));
}

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function buildCallAgentStatus(row: DashboardCallAgentLeadRow) {
  const transfer = clean(row.transferred_to);
  const alertRecipient = clean(row.text_summary_recipient);
  const alertStatus = clean(row.text_summary_status) || "pending";
  const statusLabel = transfer ? `Transferred to ${transfer}` : "Needs follow-up";
  const ownerAlertLabel = alertRecipient ? `Owner alert summary: ${humanizeSlug(alertStatus)} to ${alertRecipient}` : `Owner alert summary: ${humanizeSlug(alertStatus)}`;

  return { statusLabel, ownerAlertLabel };
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
