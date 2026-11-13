import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Chitra Paratama Workshop data to Neon PostgreSQL...");

  // 1. Cameras
  const cctv1 = await prisma.camera.upsert({
    where: { code: "cctv-01" },
    update: {},
    create: {
      code: "cctv-01",
      name: "CCTV 01",
      location: "Repair Workshop",
      status: "online",
      streamType: "simulation",
    },
  });

  await prisma.camera.upsert({
    where: { code: "cctv-02" },
    update: {},
    create: {
      code: "cctv-02",
      name: "CCTV 02",
      location: "Bay C & Wash Area",
      status: "online",
      streamType: "simulation",
    },
  });

  await prisma.camera.upsert({
    where: { code: "cctv-03" },
    update: {},
    create: {
      code: "cctv-03",
      name: "CCTV 03",
      location: "Tire Storage & Staging",
      status: "offline",
      streamType: "simulation",
    },
  });

  // 2. Zones for CCTV 01
  const existingZones = await prisma.zone.findMany({
    where: { cameraId: cctv1.id },
  });

  if (existingZones.length === 0) {
    const z1 = await prisma.zone.create({
      data: {
        code: "Z1",
        name: "Repair Bay A",
        color: "#eab308",
        cameraId: cctv1.id,
        pointsJson: JSON.stringify([
          { x: 11, y: 88 },
          { x: 26, y: 46 },
          { x: 64, y: 49 },
          { x: 58, y: 92 },
        ]),
      },
    });

    const z2 = await prisma.zone.create({
      data: {
        code: "Z2",
        name: "Repair Bay B",
        color: "#9333ea",
        cameraId: cctv1.id,
        pointsJson: JSON.stringify([
          { x: 24, y: 31 },
          { x: 46, y: 27 },
          { x: 56, y: 39 },
          { x: 29, y: 43 },
        ]),
      },
    });

    const z3 = await prisma.zone.create({
      data: {
        code: "Z3",
        name: "Support Area",
        color: "#06b6d4",
        cameraId: cctv1.id,
        pointsJson: JSON.stringify([
          { x: 67, y: 31 },
          { x: 86, y: 34 },
          { x: 83, y: 82 },
          { x: 63, y: 78 },
        ]),
      },
    });

    // Initial Durations for Shift 1
    const today = "2026-11-13";
    await prisma.shiftDuration.createMany({
      data: [
        {
          zoneId: z1.id,
          shiftName: "Shift 1",
          date: today,
          repairingMinutes: 320,
          notRepairingMinutes: 80,
        },
        {
          zoneId: z2.id,
          shiftName: "Shift 1",
          date: today,
          repairingMinutes: 280,
          notRepairingMinutes: 140,
        },
        {
          zoneId: z3.id,
          shiftName: "Shift 1",
          date: today,
          repairingMinutes: 30,
          notRepairingMinutes: 390,
        },
      ],
    });

    // Initial Recent Detections
    await prisma.detectionEvent.createMany({
      data: [
        {
          cameraId: cctv1.id,
          zoneId: z1.id,
          label: "Repairing",
          confidence: 0.94,
          trackId: "T-03",
        },
        {
          cameraId: cctv1.id,
          zoneId: z2.id,
          label: "Repairing",
          confidence: 0.91,
          trackId: "T-06",
        },
        {
          cameraId: cctv1.id,
          zoneId: z3.id,
          label: "Not Repairing",
          confidence: 0.81,
          trackId: "T-09",
        },
      ],
    });
  }

  // 3. AI Models
  const existingModels = await prisma.aIModelConfig.findMany();
  if (existingModels.length === 0) {
    await prisma.aIModelConfig.createMany({
      data: [
        {
          name: "Repair Activity v1.0",
          version: "1.0.0",
          source: "Afi Vision",
          classes: "Repairing,Not Repairing",
          confidenceThreshold: 0.7,
          active: true,
          workflowName: "Workshop Repair Multi-Zone + Timer",
          endpointUrl: "/api/events",
        },
        {
          name: "RF-DETR Baseline",
          version: "0.9.2",
          source: "Afi Vision",
          classes: "Repairing,Not Repairing",
          confidenceThreshold: 0.65,
          active: false,
          workflowName: "Baseline Detection",
          endpointUrl: "/api/events",
        },
      ],
    });
  }

  console.log("Seeding to Neon PostgreSQL finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
