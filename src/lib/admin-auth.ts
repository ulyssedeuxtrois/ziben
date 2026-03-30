import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Vérifie que le requester est ADMIN.
 * Le client envoie x-user-id en header, on vérifie en DB.
 * Retourne le user si OK, ou une NextResponse 401.
 */
export async function verifyAdmin(req: NextRequest) {
  const userId = req.headers.get("x-user-id");
  if (!userId) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user || user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  }

  return { user };
}
