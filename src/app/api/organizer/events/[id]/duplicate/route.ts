import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/organizer/events/:id/duplicate
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = request.headers.get("x-user-id");
  if (!userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ORGANIZER") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const original = await prisma.event.findUnique({ where: { id: params.id } });
  if (!original) {
    return NextResponse.json({ error: "Événement non trouvé" }, { status: 404 });
  }

  if (original.organizerId !== userId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const newDate = new Date(original.date);
  newDate.setDate(newDate.getDate() + 7);

  const newEndDate = original.endDate
    ? new Date(new Date(original.endDate).getTime() + 7 * 24 * 60 * 60 * 1000)
    : null;

  const duplicate = await prisma.event.create({
    data: {
      title: `Copie — ${original.title}`,
      description: original.description,
      date: newDate,
      endDate: newEndDate,
      location: original.location,
      address: original.address,
      lat: original.lat,
      lng: original.lng,
      price: original.price,
      isFree: original.isFree,
      imageUrl: original.imageUrl,
      city: original.city,
      capacity: original.capacity,
      submitterName: original.submitterName,
      submitterEmail: original.submitterEmail,
      categoryId: original.categoryId,
      organizerId: original.organizerId,
      status: "PENDING",
      boosted: false,
      boostedUntil: null,
      viewCount: 0,
      rsvpCount: 0,
      clickCount: 0,
    },
    include: { category: true },
  });

  return NextResponse.json(duplicate, { status: 201 });
}
