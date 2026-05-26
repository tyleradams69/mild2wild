import { NextResponse } from "next/server";
import {
  buildAppointmentInsert,
  validateBookingRequest,
} from "@/lib/booking-foundation";
import { services, staffMembers } from "@/lib/studio-data";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ["Request body must be valid JSON."] }, { status: 400 });
  }

  const validation = validateBookingRequest(body && typeof body === "object" ? body : {}, { services, staffMembers });
  if (!validation.ok) {
    return NextResponse.json({ ok: false, errors: validation.errors }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ ok: false, errors: ["Booking database is not configured."] }, { status: 503 });
  }

  const [{ data: staffRows, error: staffError }, { data: serviceRows, error: serviceError }] = await Promise.all([
    supabase.from("staff_members").select("id, slug").in("slug", [validation.value.staffSlug]),
    supabase.from("services").select("id, slug").in("slug", [validation.value.serviceSlug]),
  ]);

  if (staffError || serviceError) {
    return NextResponse.json({ ok: false, errors: ["Could not look up booking records."] }, { status: 500 });
  }

  const staffIdsBySlug = new Map((staffRows ?? []).map((row) => [row.slug as string, row.id as string]));
  const serviceIdsBySlug = new Map((serviceRows ?? []).map((row) => [row.slug as string, row.id as string]));

  let insertPayload: ReturnType<typeof buildAppointmentInsert>;
  try {
    insertPayload = buildAppointmentInsert(validation.value, { staffIdsBySlug, serviceIdsBySlug });
  } catch {
    return NextResponse.json({ ok: false, errors: ["Online booking is being connected. Please contact the shop directly and we can help with this request."] }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("appointments")
    .insert(insertPayload)
    .select("id, status, starts_at, ends_at")
    .single();

  if (error) {
    return NextResponse.json({ ok: false, errors: ["Could not create booking request."] }, { status: 500 });
  }

  return NextResponse.json({ ok: true, appointment: data }, { status: 201 });
}
