import { NextRequest, NextResponse } from "next/server";

// GET /api/geocode?address=... — geocode an address using Nominatim (free, no API key)
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  if (!address) {
    return NextResponse.json({ error: "address requis" }, { status: 400 });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=5&countrycodes=fr`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Ziben/1.0 (local-events-app)",
      },
    });

    const results = await res.json();

    const suggestions = results.map((r: any) => ({
      displayName: r.display_name,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    }));

    return NextResponse.json({ suggestions });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur de géocodage" },
      { status: 500 }
    );
  }
}
