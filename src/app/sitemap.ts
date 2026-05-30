import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo";
import { readStoredStaffMembers } from "@/lib/staff-profile-overrides";
import { serviceCategories, staffMembers } from "@/lib/studio-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const storedStaffMembers = await readStoredStaffMembers(staffMembers);
  const staticRoutes = ["", "/book", "/staff", "/tour", "/products", "/dog-clicker", "/legal"];
  const serviceRoutes = serviceCategories.map((category) => `/services/${category.slug}`);
  const staffRoutes = storedStaffMembers.map((staff) => `/staff/${staff.slug}`);

  return [...staticRoutes, ...serviceRoutes, ...staffRoutes].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/book" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/book" ? 0.9 : path.startsWith("/services") ? 0.85 : path.startsWith("/staff") ? 0.75 : 0.65,
  }));
}
