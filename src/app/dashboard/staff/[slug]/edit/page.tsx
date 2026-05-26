import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PageShell, SectionEyebrow } from "@/components/site";
import { dashboardSessionCookieName, parseSignedDashboardSession } from "@/lib/auth-session";
import { serviceCategories, services, staffMembers } from "@/lib/studio-data";
import {
  buildProfileEditModel,
  mergeStaffProfileOverrides,
  normalizeStaffProfileUpdate,
  readStaffProfileOverrides,
  writeStaffProfileOverride,
} from "@/lib/staff-profile-overrides";

export const dynamic = "force-dynamic";

function getDashboardSessionSecret() {
  return process.env.HERMES_DASHBOARD_SESSION_SECRET ?? "m2w-dashboard-dev-session-secret";
}

async function getSession() {
  const cookieStore = await cookies();
  const session = parseSignedDashboardSession(cookieStore.get(dashboardSessionCookieName)?.value, getDashboardSessionSecret());
  if (!session) redirect("/login");
  return session;
}

export default async function StaffEditPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const [{ slug }, query, session] = await Promise.all([params, searchParams, getSession()]);
  const mergedStaffMembers = mergeStaffProfileOverrides(staffMembers, await readStaffProfileOverrides());
  const editModel = buildProfileEditModel(session, slug, mergedStaffMembers);

  if (!editModel.profile) {
    return <ProfileEditMessage title="Profile not found" message="That staff profile does not exist yet." />;
  }

  if (!editModel.canEdit) {
    return <ProfileEditMessage title="Profile locked" message={editModel.reason ?? "You do not have permission to edit this profile."} />;
  }

  const profile = editModel.profile;
  const staffServices = services.filter((service) => profile.serviceSlugs.includes(service.slug));
  const categories = serviceCategories.filter((category) => profile.serviceCategorySlugs.includes(category.slug));
  const instagramUrl = profile.socialLinks.find((link) => link.label === "Instagram")?.href ?? "";
  const tiktokUrl = profile.socialLinks.find((link) => link.label === "TikTok")?.href ?? "";

  async function saveProfileAction(formData: FormData) {
    "use server";

    const session = await getSession();
    const mergedStaffMembers = mergeStaffProfileOverrides(staffMembers, await readStaffProfileOverrides());
    const editModel = buildProfileEditModel(session, slug, mergedStaffMembers);
    if (!editModel.canEdit) redirect(`/dashboard/staff/${slug}/edit?error=locked`);

    const normalized = normalizeStaffProfileUpdate({
      name: formData.get("name"),
      title: formData.get("title"),
      bio: formData.get("bio"),
      instagramUrl: formData.get("instagramUrl"),
      tiktokUrl: formData.get("tiktokUrl"),
    });

    if (!normalized.ok) redirect(`/dashboard/staff/${slug}/edit?error=invalid`);
    await writeStaffProfileOverride(slug, normalized.value);
    redirect(`/dashboard/staff/${slug}/edit?saved=1`);
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <SectionEyebrow color={profile.calendarColor}>Profile editor</SectionEyebrow>
            <h1 className="brand-display max-w-4xl text-5xl font-black uppercase md:text-7xl">Edit {profile.name}</h1>
            <p className="mt-4 max-w-3xl text-white/62">Update the meet-me page copy, title, and social links. Saved changes are immediately reflected on the public staff profile.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard" className="rounded-full border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-white/75 transition hover:bg-white hover:text-black">Dashboard</Link>
            <Link href={`/staff/${profile.slug}`} className="rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black">View public profile</Link>
          </div>
        </div>

        {query.saved ? <StatusCard tone="success" message="Saved. The public meet-me page now uses this updated profile copy." /> : null}
        {query.error ? <StatusCard tone="error" message={query.error === "locked" ? "That profile is locked for this login." : "Name, title, and bio are required before saving."} /> : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.72fr]">
          <form action={saveProfileAction} className="neon-card rounded-[2rem] p-6" style={{ boxShadow: `0 0 70px ${profile.calendarColor}22` }}>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Display name</span>
              <input name="name" required defaultValue={profile.name} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-white/40" />
            </label>
            <label className="mt-5 block">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Title / role</span>
              <input name="title" required defaultValue={profile.title} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-white/40" />
            </label>
            <label className="mt-5 block">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Bio</span>
              <textarea name="bio" required rows={9} defaultValue={profile.bio} className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-black/60 px-4 py-3 leading-7 text-white outline-none focus:border-white/40" />
            </label>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Instagram URL / handle</span>
                <input name="instagramUrl" defaultValue={instagramUrl} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-white/40" />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/45">TikTok URL / handle</span>
                <input name="tiktokUrl" defaultValue={tiktokUrl} className="mt-2 w-full rounded-2xl border border-white/10 bg-black/60 px-4 py-3 text-white outline-none focus:border-white/40" />
              </label>
            </div>
            <button type="submit" className="mt-6 rounded-full bg-pink-300 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-white">Save profile</button>
          </form>

          <aside className="neon-card rounded-[2rem] p-6">
            <SectionEyebrow color="#FF8AC8">Profile scope</SectionEyebrow>
            <h2 className="brand-display text-3xl font-black uppercase">Services stay controlled.</h2>
            <p className="mt-3 text-sm leading-6 text-white/58">This editor updates the personal meet-me content. Service assignments still come from the booking/service model so nail staff do not accidentally show under tattoo services.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((category) => (
                <span key={category.slug} className="rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-black" style={{ background: category.accent }}>{category.name}</span>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {staffServices.map((service) => (
                <div key={service.slug} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="font-black text-white">{service.name}</p>
                  <p className="mt-1 text-sm text-white/50">{service.priceLabel} · {service.durationMinutes}m</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

function StatusCard({ tone, message }: { tone: "success" | "error"; message: string }) {
  return <div className={`mt-6 rounded-3xl border p-4 text-sm font-bold ${tone === "success" ? "border-lime-300/30 bg-lime-300/10 text-lime-100" : "border-pink-300/30 bg-pink-300/10 text-pink-100"}`}>{message}</div>;
}

function ProfileEditMessage({ title, message }: { title: string; message: string }) {
  return (
    <PageShell>
      <section className="mx-auto max-w-4xl px-5 py-24">
        <SectionEyebrow color="#FF8AC8">Profile editor</SectionEyebrow>
        <h1 className="brand-display text-5xl font-black uppercase">{title}</h1>
        <p className="mt-4 text-white/62">{message}</p>
        <Link href="/dashboard" className="mt-6 inline-block rounded-full bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-black">Back to dashboard</Link>
      </section>
    </PageShell>
  );
}
