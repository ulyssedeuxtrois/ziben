import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth";
import { sendEventApproved } from "@/lib/email";

// GET /api/admin/events — list all events for moderation
export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth.error) return auth.error;

  const status = request.nextUrl.searchParams.get("status") || "";

  const where: any = {};
  if (status) {
    where.status = status;
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      category: true,
      organizer: { select: { id: true, name: true, email: true } },
      _count: { select: { savedBy: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = {
    total: await prisma.event.count(),
    pending: await prisma.event.count({ where: { status: "PENDING" } }),
    approved: await prisma.event.count({ where: { status: "APPROVED" } }),
    rejected: await prisma.event.count({ where: { status: "REJECTED" } }),
  };

  return NextResponse.json({ events, counts });
}

// PATCH /api/admin/events — update event status
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { eventId, status } = await request.json();

    if (!eventId || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return NextResponse.json(
        { error: "eventId et status valide requis" },
        { status: 400 }
      );
    }

    const event = await prisma.event.update({
      where: { id: eventId },
      data: { status },
      include: {
        category: true,
        organizer: { select: { email: true } },
      },
    });

    if (status === "APPROVED") {
      const recipientEmail = event.organizer?.email || event.submitterEmail;
      if (recipientEmail) {
        sendEventApproved(recipientEmail, { title: event.title, id: event.id }).catch(() => {});
      }
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/events — edit event fields
export async function PUT(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { eventId, title, description, date, location, price, isFree, imageUrl } = await request.json();

    if (!eventId) {
      return NextResponse.json({ error: "eventId requis" }, { status: 400 });
    }

    const data: any = {};
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (date !== undefined) data.date = new Date(date);
    if (location !== undefined) data.location = location;
    if (price !== undefined) data.price = price;
    if (isFree !== undefined) data.isFree = isFree;
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    const event = await prisma.event.update({
      where: { id: eventId },
      data,
      include: { category: true },
    });

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la modification" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/events — delete an event and related records
export async function DELETE(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { eventId } = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId requis" },
        { status: 400 }
      );
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}
