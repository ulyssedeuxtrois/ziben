import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth";

function escapeCSV(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function toCSVRow(fields: (string | number | boolean | null | undefined)[]): string {
  return fields.map(escapeCSV).join(",");
}

export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth.error) return auth.error;

  const type = request.nextUrl.searchParams.get("type") || "events";
  const date = new Date().toISOString().slice(0, 10);

  if (type === "leads") {
    const [organizers, publicSubmitters] = await Promise.all([
      prisma.user.findMany({
        where: { role: "ORGANIZER" },
        select: {
          email: true,
          name: true,
          createdAt: true,
          _count: { select: { events: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.findMany({
        where: { organizerId: null, submitterEmail: { not: null } },
        select: {
          submitterName: true,
          submitterEmail: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
    ]);

    const seenEmails = new Set<string>();
    const uniquePublic = publicSubmitters.filter((e) => {
      if (!e.submitterEmail || seenEmails.has(e.submitterEmail)) return false;
      seenEmails.add(e.submitterEmail);
      return true;
    });

    const header = toCSVRow(["name", "email", "type", "eventCount", "createdAt"]);
    const organizerRows = organizers.map((o) =>
      toCSVRow([o.name, o.email, "ORGANIZER", o._count.events, o.createdAt.toISOString()])
    );
    const publicRows = uniquePublic.map((p) =>
      toCSVRow([p.submitterName, p.submitterEmail, "PUBLIC", 1, p.createdAt.toISOString()])
    );

    const csv = [header, ...organizerRows, ...publicRows].join("\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ziben-leads-${date}.csv"`,
      },
    });
  }

  // Default: events
  const events = await prisma.event.findMany({
    include: {
      category: { select: { name: true } },
      organizer: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const header = toCSVRow([
    "id", "title", "date", "location", "category", "organizer",
    "status", "price", "isFree", "viewCount", "rsvpCount", "boosted", "createdAt",
  ]);

  const rows = events.map((e) =>
    toCSVRow([
      e.id,
      e.title,
      e.date.toISOString(),
      e.location,
      e.category?.name ?? "",
      e.organizer ? (e.organizer.name || e.organizer.email) : (e.submitterName || e.submitterEmail || ""),
      e.status,
      e.price,
      e.isFree,
      e.viewCount,
      e.rsvpCount,
      e.boosted,
      e.createdAt.toISOString(),
    ])
  );

  const csv = [header, ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="ziben-events-${date}.csv"`,
    },
  });
}
