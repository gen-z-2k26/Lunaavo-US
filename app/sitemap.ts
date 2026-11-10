import type { MetadataRoute } from "next";
import {
  getProductsByCategory,
  getSiteSettings,
  getSiteUrl,
  getTopCategories,
} from "@/lib/api";
import { POLICY_PAGES } from "@/lib/policy-pages";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const base = getSiteUrl(settings) || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/products`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${base}/about-us`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/faqs`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/contact-us`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${base}/our-commitment`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/reviews`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${base}/track-your-order`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/order-help-center`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...POLICY_PAGES.map((page) => ({
      url: `${base}/${page.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.4,
    })),
  ];

  try {
    const categories = await getTopCategories(3);
    const productGroups = await Promise.all(
      categories.map((category) => getProductsByCategory(category.slug)),
    );
    const products = productGroups.flatMap((group) => group.slice(0, 3));

    const productRoutes = products.map((product) => ({
      url: `${base}/products/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const categoryRoutes = categories.map((category) => ({
      url: `${base}/collection/${category.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch {
    return staticRoutes;
  }
}
