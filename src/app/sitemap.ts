import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await prisma.event.findMany({
    where: { status: "APPROVED" },
    select: { id: true, updatedAt: true },
    orderBy: { date: "asc" },
  });

  const eventUrls = events.map((event) => ({
    url: `https://ziben.onrender.com/events/${event.id}`,
    lastModified: event.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: "https://ziben.onrender.com", lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: "https://ziben.onrender.com/map", lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: "https://ziben.onrender.com/submit", lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    ...eventUrls,
  ];
}
