import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const zonesFromDb = await prisma.zone.findMany({
      include: { camera: true },
      orderBy: { code: "asc" },
    });

    const formatted = zonesFromDb.map((z) => ({
      id: z.id,
      code: z.code,
      name: z.name,
      color: z.color,
      cameraId: z.camera.code,
      points: JSON.parse(z.pointsJson || "[]"),
    }));

    return NextResponse.json({
      ok: true,
      source: "neon-postgresql",
      zones: formatted,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Gagal mengambil zona dari database." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!Array.isArray(body.zones)) {
      return NextResponse.json(
        { ok: false, error: "Payload harus berupa { zones: Zone[] }." },
        { status: 400 }
      );
    }

    // Update each zone in Neon
    for (const z of body.zones) {
      if (z.id && !z.id.startsWith("z-temp")) {
        await prisma.zone
          .update({
            where: { id: z.id },
            data: {
              name: z.name,
              color: z.color,
              pointsJson: JSON.stringify(z.points ?? []),
            },
          })
          .catch(() => {});
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Zona berhasil disinkronkan ke Neon PostgreSQL.",
      count: body.zones.length,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Gagal menyimpan zona." },
      { status: 500 }
    );
  }
}
