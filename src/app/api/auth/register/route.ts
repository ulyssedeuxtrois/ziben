import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { notifyNewOrganizer } from "@/lib/notify";
import { sendWelcomeOrganizer } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

function hashPassword(password: string): string {
  return createHash("sha256")
    .update(password + (process.env.NEXTAUTH_SECRET || "dev-secret"))
    .digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    const limit = checkRateLimit(`register:${ip}`);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Trop de tentatives. Réessaie dans ${limit.retryAfter}s.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword(password),
        name: name || null,
        role: role === "ORGANIZER" ? "ORGANIZER" : "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (user.role === "ORGANIZER") {
      notifyNewOrganizer(user).catch(() => {});
      sendWelcomeOrganizer(user.email, user.name || "Organisateur").catch(() => {});
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}
