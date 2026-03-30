import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/admin-auth";

// GET /api/admin/users — list all users
export async function GET(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth.error) return auth.error;
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          events: true,
          savedEvents: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}

// PATCH /api/admin/users — update user role
export async function PATCH(request: NextRequest) {
  const auth = await verifyAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { userId, role } = await request.json();

    if (!userId || !["USER", "ORGANIZER", "ADMIN"].includes(role)) {
      return NextResponse.json(
        { error: "userId et role valide requis" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, email: true, name: true, role: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour" },
      { status: 500 }
    );
  }
}
