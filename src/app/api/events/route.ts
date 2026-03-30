import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewEvent } from "@/lib/notify";
import { sendEventSubmitted } from "@/lib/email";

// GET /api/events — list events with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q") || "";
    const category = searchParams.get("category") || "";
    const city = searchParams.get("city") || "";
    const isFree = searchParams.get("free") === "true";
    const dateFrom = searchParams.get("dateFrom") || searchParams.get("from");
    const dateTo = searchParams.get("dateTo") || searchParams.get("to");
    const includePast = searchParams.get("includePast") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: any = {
      status: "APPROVED",
    };

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (city) {
      where.city = city;
    }

    if (isFree) {
      where.isFree = true;
    }

    if (!includePast && !dateFrom) {
      where.date = { ...where.date, gte: new Date(new Date().setHours(0, 0, 0, 0)) };
    }

    if (dateFrom) {
      where.date = { ...where.date, gte: new Date(dateFrom) };
    }

    if (dateTo) {
      const to = dateTo.includes("T") ? new Date(dateTo) : new Date(dateTo + "T23:59:59");
      where.date = { ...where.date, lte: to };
    }

    // Auto-expire les boosts périmés
    await prisma.event.updateMany({
      where: { boosted: true, boostedUntil: { lt: new Date() } },
      data: { boosted: false, boostedUntil: null },
    });

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          category: true,
          organizer: { select: { id: true, name: true } },
          _count: { select: { savedBy: true } },
        },
        orderBy: [{ boosted: "desc" }, { date: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.event.count({ where }),
    ]);

    return NextResponse.json({
      events,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    console.error("GET /api/events error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error", events: [], total: 0 },
      { status: 500 }
    );
  }
}

// POST /api/events — create an event (authenticated or public submission)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const data: any = {
      title: body.title,
      description: body.description,
      date: new Date(body.date),
      endDate: body.endDate ? new Date(body.endDate) : null,
      location: body.location,
      address: body.address,
      lat: body.lat,
      lng: body.lng,
      price: body.price || 0,
      isFree: body.isFree ?? body.price === 0,
      imageUrl: body.imageUrl || null,
      categoryId: body.categoryId,
      city: body.city || "nice",
      capacity: body.capacity || null,
      status: "PENDING",
    };

    // Authenticated submission
    if (body.organizerId) {
      data.organizerId = body.organizerId;
    }

    // Public submission
    if (body.submitterName) {
      data.submitterName = body.submitterName;
      data.submitterEmail = body.submitterEmail || null;
    }

    const event = await prisma.event.create({
      data,
      include: {
        category: true,
      },
    });

    notifyNewEvent({
      id: event.id,
      title: event.title,
      date: event.date,
      submitterName: event.submitterName,
      submitterEmail: event.submitterEmail,
      source: body.organizerId ? "organizer" : "public",
    }).catch(() => {});

    if (event.submitterEmail) {
      sendEventSubmitted(event.submitterEmail, { title: event.title }).catch(() => {});
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'événement" },
      { status: 500 }
    );
  }
}
