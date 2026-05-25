import { NextResponse } from "next/server";
import {
  buildCallAgentLeadInsert,
  validateCallAgentLead,
} from "@/lib/booking-foundation";
import { createSupabaseServerClient } from "@/lib/supabase";

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
    return NextResponse.json({ ok: false, errors: ["Call-agent lead database is not configured."] }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("call_agent_leads")
    .insert(buildCallAgentLeadInsert(validation.value))
    .select("id, created_at")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, errors: ["Could not save call-agent lead."] }, { status: 500 });
  }

  return NextResponse.json({ ok: true, lead: data }, { status: 201 });
}
