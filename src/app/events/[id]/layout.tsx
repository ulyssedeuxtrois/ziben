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
      images: event.imageUrl
        ? [event.imageUrl]
        : [{ url: `${process.env.NEXT_PUBLIC_BASE_URL || "https://ziben.onrender.com"}/icons/icon-512.png`, width: 512, height: 512 }],
      type: "website",
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
