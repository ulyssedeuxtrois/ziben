import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: { category: true },
  });

  if (!event) return {};

  const description = event.description?.slice(0, 160);

  return {
    title: `${event.title} — Ziben`,
    description,
    openGraph: {
      title: event.title,
      description,
      images: event.imageUrl ? [event.imageUrl] : [],
      type: "website",
    },
    other: {
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.title,
        description: event.description,
        startDate: event.date.toISOString(),
        endDate: event.endDate?.toISOString(),
        location: {
          "@type": "Place",
          name: event.location,
          address: event.address,
        },
        image: event.imageUrl || undefined,
        isAccessibleForFree: event.isFree,
        offers: event.isFree
          ? undefined
          : {
              "@type": "Offer",
              price: event.price,
              priceCurrency: "EUR",
            },
      }),
    },
  };
}

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
