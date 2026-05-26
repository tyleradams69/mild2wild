import type { ValidatedCallAgentLead } from "./booking-foundation";

export const businessOwnerCallRouting = {
  name: "Caitlin",
  role: "Business owner",
  phoneDisplay: "440-654-7085",
  phoneE164: "+14406547085",
  transferLabel: "Caitlin (business owner) at 440-654-7085",
} as const;

export function buildOwnerTextSummary(lead: Pick<ValidatedCallAgentLead, "customerName" | "customerPhone" | "requestedService" | "preferredStaffSlug" | "preferredTime" | "summary">) {
  const parts = [
    "Mild 2 Wild call summary",
    `Client: ${lead.customerName}`,
    `Phone: ${lead.customerPhone ?? "not provided"}`,
    `Service: ${lead.requestedService}`,
    `Preferred staff: ${lead.preferredStaffSlug ?? "not specified"}`,
    `Preferred time: ${lead.preferredTime ?? "not specified"}`,
    `Notes: ${lead.summary}`,
  ];

  return parts.join("\n");
}
