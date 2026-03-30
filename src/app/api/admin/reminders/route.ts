import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEventReminder } from "@/lib/email";

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-scraper-secret");
  if (!secret || secret !== process.env.SCRAPER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tomorrowStart = new Date(tomorrow);
  tomorrowStart.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const events = await prisma.event.findMany({
    where: {
      status: "APPROVED",
      date: { gte: tomorrowStart, lte: tomorrowEnd },
    },
    include: {
      savedBy: {
        include: {
          user: { select: { email: true } },
        },
      },
    },
  });

  let sent = 0;

  for (const event of events) {
    const results = await Promise.allSettled(
      event.savedBy.map((saved) =>
        sendEventReminder(saved.user.email, {
          id: event.id,
          title: event.title,
          date: event.date.toISOString(),
          location: event.location,
        })
      )
    );
    sent += results.filter((r) => r.status === "fulfilled").length;
  }

  return NextResponse.json({ sent, eventCount: events.length });
}
