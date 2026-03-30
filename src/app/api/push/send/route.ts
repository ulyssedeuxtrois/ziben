import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_EMAIL!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  // Auth: require either a valid ADMIN user (x-user-id) or the scraper secret
  const scraperSecret = request.headers.get("x-scraper-secret");
  const userId = request.headers.get("x-user-id");

  let authorized = false;

  if (scraperSecret && scraperSecret === process.env.SCRAPER_SECRET) {
    authorized = true;
  } else if (userId) {
    const admin = await prisma.user.findFirst({
      where: { id: userId, role: "ADMIN" },
      select: { id: true },
    });
    if (admin) authorized = true;
  }

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, body, url } = await request.json();

    const subscriptions = await prisma.pushSubscription.findMany();
    if (subscriptions.length === 0) {
      return NextResponse.json({ sent: 0 });
    }

    const payload = JSON.stringify({ title, body, url: url || "/" });
    let sent = 0;
    const toDelete: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          sent++;
        } catch (err: any) {
          if (err.statusCode === 404 || err.statusCode === 410) {
            toDelete.push(sub.endpoint);
          }
        }
      })
    );

    if (toDelete.length > 0) {
      await prisma.pushSubscription.deleteMany({ where: { endpoint: { in: toDelete } } });
    }

    return NextResponse.json({ sent, deleted: toDelete.length });
  } catch (error) {
    console.error("Push send error:", error);
    return NextResponse.json({ error: "Erreur" }, { status: 500 });
  }
}
