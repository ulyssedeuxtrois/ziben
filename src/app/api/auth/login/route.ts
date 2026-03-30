import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { checkRateLimit } from "@/lib/rate-limit";

function hashPassword(password: string): string {
  return createHash("sha256")
    .update(password + (process.env.NEXTAUTH_SECRET || "dev-secret"))
    .digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const limit = checkRateLimit(`login:${ip}`);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: `Trop de tentatives. Réessaie dans ${limit.retryAfter}s.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.password !== hashPassword(password)) {
      return NextResponse.json(
        { error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
}
