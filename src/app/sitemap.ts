import type { MetadataRoute } from "next";
import { serviceCategories, staffMembers } from "@/lib/studio-data";

const siteUrl = "https://mild2wild.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const staticRoutes = ["", "/book", "/staff", "/tour", "/products", "/legal", "/login"];
  const serviceRoutes = serviceCategories.map((category) => `/services/${category.slug}`);
  const staffRoutes = staffMembers.map((staff) => `/staff/${staff.slug}`);

  return [...staticRoutes, ...serviceRoutes, ...staffRoutes].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path.startsWith("/services") || path === "/book" ? 0.85 : 0.65,
  }));
}
