import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { events: { where: { status: "APPROVED" } } },
      },
    },
  });
  return NextResponse.json({ categories });
}
