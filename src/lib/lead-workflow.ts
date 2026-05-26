export const leadWorkflowStatuses = ["new", "contacted", "waiting_on_client", "booked", "not_a_fit", "archived"] as const;

export type LeadWorkflowStatus = (typeof leadWorkflowStatuses)[number];

const workflowCopy: Record<LeadWorkflowStatus, { label: string; nextAction: string; tone: string }> = {
  new: {
    label: "New",
    nextAction: "Review the request and make first contact.",
    tone: "bg-lime-300 text-black",
  },
  contacted: {
    label: "Contacted",
    nextAction: "Confirm fit, timing, and deposit details.",
    tone: "bg-cyan-300 text-black",
  },
  waiting_on_client: {
    label: "Waiting on client",
    nextAction: "Wait for the client to reply before booking.",
    tone: "bg-yellow-200 text-black",
  },
  booked: {
    label: "Booked",
    nextAction: "Appointment is handled; keep notes for context.",
    tone: "bg-purple-300 text-black",
  },
  not_a_fit: {
    label: "Not a fit",
    nextAction: "No booking needed unless the client follows up.",
    tone: "bg-orange-300 text-black",
  },
  archived: {
    label: "Archived",
    nextAction: "Hidden from active follow-up unless reopened.",
    tone: "bg-white/50 text-black",
  },
};

export function normalizeLeadStatus(value: unknown): LeadWorkflowStatus {
  if (typeof value !== "string") return "new";
  const normalized = value.trim().toLowerCase().replace(/-/g, "_").replace(/\s+/g, "_");
  return leadWorkflowStatuses.includes(normalized as LeadWorkflowStatus) ? (normalized as LeadWorkflowStatus) : "new";
}

export function normalizeInternalNote(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n")
    .slice(0, 1000);
}

export function buildLeadWorkflowSummary(statusValue: unknown, internalNoteValue: unknown) {
  const status = normalizeLeadStatus(statusValue);
  const notePreview = normalizeInternalNote(internalNoteValue);
  return {
    status,
    label: workflowCopy[status].label,
    nextAction: workflowCopy[status].nextAction,
    tone: workflowCopy[status].tone,
    notePreview,
    isActive: status !== "booked" && status !== "archived" && status !== "not_a_fit",
  };
}
