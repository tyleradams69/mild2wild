import { NextResponse } from "next/server";
import {
  buildCallAgentLeadInsert,
  validateCallAgentLead,
} from "@/lib/booking-foundation";
import { createSupabaseServerClient } from "@/lib/supabase";

function isMissingSmsSummaryColumns(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  const message = error.message?.toLowerCase() ?? "";
  return error.code === "42703" || message.includes("text_summary_recipient") || message.includes("text_summary_body") || message.includes("text_summary_status");
}

function legacyCallAgentLeadInsert(lead: ReturnType<typeof buildCallAgentLeadInsert>) {
  return {
    customer_name: lead.customer_name,
    customer_phone: lead.customer_phone,
    requested_service: lead.requested_service,
    preferred_staff_slug: lead.preferred_staff_slug,
    preferred_time: lead.preferred_time,
    summary: lead.summary,
    transferred_to: lead.transferred_to,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ["Request body must be valid JSON."] }, { status: 400 });
  }

  const validation = validateCallAgentLead(body && typeof body === "object" ? body : {});
  if (!validation.ok) {
    return NextResponse.json({ ok: false, errors: validation.errors }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, errors: ["Phone intake is being connected. Please contact the shop directly and we can help with this request."] }, { status: 503 });
  }

  const insertPayload = buildCallAgentLeadInsert(validation.value);
  const { data, error } = await supabase
    .from("call_agent_leads")
    .insert(insertPayload)
    .select("id, created_at")
    .single();

  if (!error) {
    return NextResponse.json({ ok: true, lead: data }, { status: 201 });
  }

  if (isMissingSmsSummaryColumns(error)) {
    const fallback = await supabase
      .from("call_agent_leads")
      .insert(legacyCallAgentLeadInsert(insertPayload))
      .select("id, created_at")
      .single();

    if (!fallback.error) {
      return NextResponse.json({ ok: true, lead: fallback.data, smsSummaryQueued: false }, { status: 201 });
    }
  }

  return NextResponse.json({ ok: false, errors: ["Could not save the phone intake lead. Please contact the shop directly and we can help with this request."] }, { status: 503 });
}
