import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "30", 10);
    const cameraId = searchParams.get("cameraId");

    const events = await prisma.detectionEvent.findMany({
      where: cameraId ? { camera: { code: cameraId } } : undefined,
      include: {
        zone: true,
        camera: true,
      },
      orderBy: { timestamp: "desc" },
      take: limit,
    });

    return NextResponse.json({
      ok: true,
      source: "neon-postgresql",
      events: events.map((e) => ({
        id: e.id,
        timestamp: e.timestamp.toTimeString().slice(0, 8),
        cameraId: e.camera.code,
        zoneId: e.zone.id,
        zoneLabel: `${e.zone.code} • ${e.zone.name}`,
        zoneColor: e.zone.color,
        label: e.label,
        confidence: e.confidence,
        trackId: e.trackId,
        durationSec: e.durationSec,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Gagal mengambil data event dari database." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.label || typeof body.confidence !== "number") {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Payload tidak valid. Wajib menyertakan label ('Repairing' | 'Not Repairing') dan confidence.",
        },
        { status: 400 }
      );
    }

    // Resolve Camera
    const cameraCode = body.cameraId ?? "cctv-01";
    let camera = await prisma.camera.findUnique({
      where: { code: cameraCode },
    });
    if (!camera) {
      camera = await prisma.camera.create({
        data: {
          code: cameraCode,
          name: cameraCode.toUpperCase(),
          location: "Workshop Area",
        },
      });
    }

    // Resolve Zone
    let zoneId = body.zoneId;
    let zone = zoneId
      ? await prisma.zone.findFirst({
          where: {
            OR: [{ id: zoneId }, { code: zoneId }],
          },
        })
      : null;

    if (!zone) {
      zone = await prisma.zone.findFirst({
        where: { cameraId: camera.id },
      });
    }

    if (!zone) {
      zone = await prisma.zone.create({
        data: {
          code: "Z1",
          name: "Default Bay",
          color: "#eab308",
          cameraId: camera.id,
          pointsJson: "[]",
        },
      });
    }

    // Insert detection event to Neon
    const createdEvent = await prisma.detectionEvent.create({
      data: {
        cameraId: camera.id,
        zoneId: zone.id,
        label: body.label,
        confidence: body.confidence,
        trackId: body.trackId ?? `T-${Math.floor(Math.random() * 100)}`,
        durationSec: body.durationSec,
      },
      include: {
        zone: true,
        camera: true,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Event deteksi dari Afi Vision tersimpan di Neon PostgreSQL.",
      event: {
        id: createdEvent.id,
        timestamp: createdEvent.timestamp.toTimeString().slice(0, 8),
        cameraId: createdEvent.camera.code,
        zoneId: createdEvent.zone.id,
        zoneLabel: `${createdEvent.zone.code} • ${createdEvent.zone.name}`,
        zoneColor: createdEvent.zone.color,
        label: createdEvent.label,
        confidence: createdEvent.confidence,
        trackId: createdEvent.trackId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: "Gagal menyimpan event ke database." },
      { status: 500 }
    );
  }
}
