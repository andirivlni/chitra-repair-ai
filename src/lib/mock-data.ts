import {
  AIModelConfig,
  CameraFeed,
  DetectionBox,
  DetectionEvent,
  ShiftOption,
  WorkshopSettings,
  Zone,
  ZoneDurationSummary,
} from "@/types/workshop";

export const DEFAULT_ZONES: Zone[] = [
  {
    id: "z1",
    code: "Z1",
    name: "Repair Bay A",
    color: "#eab308",
    cameraId: "cctv-01",
    points: [
      { x: 11, y: 88 },
      { x: 26, y: 46 },
      { x: 64, y: 49 },
      { x: 58, y: 92 },
    ],
  },
  {
    id: "z2",
    code: "Z2",
    name: "Repair Bay B",
    color: "#9333ea",
    cameraId: "cctv-01",
    points: [
      { x: 24, y: 31 },
      { x: 46, y: 27 },
      { x: 56, y: 39 },
      { x: 29, y: 43 },
    ],
  },
  {
    id: "z3",
    code: "Z3",
    name: "Support Area",
    color: "#06b6d4",
    cameraId: "cctv-01",
    points: [
      { x: 67, y: 31 },
      { x: 86, y: 34 },
      { x: 83, y: 82 },
      { x: 63, y: 78 },
    ],
  },
];

export const DEFAULT_CAMERAS: CameraFeed[] = [
  {
    id: "cctv-01",
    name: "CCTV 01",
    location: "Repair Workshop",
    status: "online",
    streamType: "simulation",
  },
  {
    id: "cctv-02",
    name: "CCTV 02",
    location: "Bay C & Wash Area",
    status: "online",
    streamType: "simulation",
  },
  {
    id: "cctv-03",
    name: "CCTV 03",
    location: "Tire Storage & Staging",
    status: "offline",
    streamType: "simulation",
  },
];

export const DEFAULT_DETECTIONS_BY_CAMERA: Record<string, DetectionBox[]> = {
  "cctv-01": [
    {
      id: "det-1",
      trackId: "T-01",
      zoneId: "z1",
      label: "Repairing",
      confidence: 0.92,
      x: 38,
      y: 44,
      w: 5.5,
      h: 13,
    },
    {
      id: "det-2",
      trackId: "T-02",
      zoneId: "z1",
      label: "Repairing",
      confidence: 0.89,
      x: 47,
      y: 46,
      w: 5,
      h: 12,
    },
    {
      id: "det-3",
      trackId: "T-03",
      zoneId: "z1",
      label: "Repairing",
      confidence: 0.94,
      x: 43,
      y: 57,
      w: 6,
      h: 13,
    },
    {
      id: "det-4",
      trackId: "T-04",
      zoneId: "z1",
      label: "Repairing",
      confidence: 0.88,
      x: 51,
      y: 54,
      w: 5.5,
      h: 13,
    },
    {
      id: "det-5",
      trackId: "T-05",
      zoneId: "z2",
      label: "Repairing",
      confidence: 0.86,
      x: 33,
      y: 25,
      w: 4.5,
      h: 11,
    },
    {
      id: "det-6",
      trackId: "T-06",
      zoneId: "z2",
      label: "Repairing",
      confidence: 0.91,
      x: 40,
      y: 24,
      w: 4.5,
      h: 11,
    },
    {
      id: "det-7",
      trackId: "T-07",
      zoneId: "z2",
      label: "Repairing",
      confidence: 0.84,
      x: 47,
      y: 26,
      w: 4.5,
      h: 11,
    },
    {
      id: "det-8",
      trackId: "T-08",
      zoneId: "z3",
      label: "Not Repairing",
      confidence: 0.81,
      x: 8.5,
      y: 42,
      w: 4.5,
      h: 12,
    },
    {
      id: "det-9",
      trackId: "T-09",
      zoneId: "z3",
      label: "Not Repairing",
      confidence: 0.78,
      x: 76,
      y: 44,
      w: 5,
      h: 13,
    },
  ],
  "cctv-02": [
    {
      id: "det-21",
      trackId: "T-11",
      zoneId: "z1",
      label: "Repairing",
      confidence: 0.87,
      x: 35,
      y: 52,
      w: 5.5,
      h: 13,
    },
    {
      id: "det-22",
      trackId: "T-12",
      zoneId: "z3",
      label: "Not Repairing",
      confidence: 0.76,
      x: 70,
      y: 48,
      w: 5,
      h: 13,
    },
  ],
  "cctv-03": [],
};

export const DEFAULT_DURATION_BY_SHIFT: Record<ShiftOption, ZoneDurationSummary[]> = {
  "Shift 1": [
    {
      zoneId: "z1",
      zoneLabel: "Z1 • Repair Bay A",
      zoneColor: "#eab308",
      repairingMinutes: 320, // 5j 20m
      notRepairingMinutes: 80, // 1j 20m
    },
    {
      zoneId: "z2",
      zoneLabel: "Z2 • Repair Bay B",
      zoneColor: "#9333ea",
      repairingMinutes: 280, // 4j 40m
      notRepairingMinutes: 140, // 2j 20m
    },
    {
      zoneId: "z3",
      zoneLabel: "Z3 • Support Area",
      zoneColor: "#06b6d4",
      repairingMinutes: 30, // 0j 30m
      notRepairingMinutes: 390, // 6j 30m
    },
  ],
  "Shift 2": [
    {
      zoneId: "z1",
      zoneLabel: "Z1 • Repair Bay A",
      zoneColor: "#eab308",
      repairingMinutes: 295,
      notRepairingMinutes: 105,
    },
    {
      zoneId: "z2",
      zoneLabel: "Z2 • Repair Bay B",
      zoneColor: "#9333ea",
      repairingMinutes: 250,
      notRepairingMinutes: 150,
    },
    {
      zoneId: "z3",
      zoneLabel: "Z3 • Support Area",
      zoneColor: "#06b6d4",
      repairingMinutes: 45,
      notRepairingMinutes: 345,
    },
  ],
  "Shift 3": [
    {
      zoneId: "z1",
      zoneLabel: "Z1 • Repair Bay A",
      zoneColor: "#eab308",
      repairingMinutes: 210,
      notRepairingMinutes: 120,
    },
    {
      zoneId: "z2",
      zoneLabel: "Z2 • Repair Bay B",
      zoneColor: "#9333ea",
      repairingMinutes: 185,
      notRepairingMinutes: 135,
    },
    {
      zoneId: "z3",
      zoneLabel: "Z3 • Support Area",
      zoneColor: "#06b6d4",
      repairingMinutes: 20,
      notRepairingMinutes: 280,
    },
  ],
};

export const DEFAULT_EVENTS: DetectionEvent[] = [
  {
    id: "evt-1",
    timestamp: "08:43:06",
    zoneId: "z1",
    zoneLabel: "Z1 • Repair Bay A",
    zoneColor: "#eab308",
    label: "Repairing",
    confidence: 0.94,
    trackId: "T-03",
  },
  {
    id: "evt-2",
    timestamp: "08:42:51",
    zoneId: "z2",
    zoneLabel: "Z2 • Repair Bay B",
    zoneColor: "#9333ea",
    label: "Repairing",
    confidence: 0.91,
    trackId: "T-06",
  },
  {
    id: "evt-3",
    timestamp: "08:42:37",
    zoneId: "z3",
    zoneLabel: "Z3 • Support Area",
    zoneColor: "#06b6d4",
    label: "Not Repairing",
    confidence: 0.81,
    trackId: "T-09",
  },
  {
    id: "evt-4",
    timestamp: "08:42:14",
    zoneId: "z1",
    zoneLabel: "Z1 • Repair Bay A",
    zoneColor: "#eab308",
    label: "Repairing",
    confidence: 0.89,
    trackId: "T-02",
  },
];

export const DEFAULT_MODELS: AIModelConfig[] = [
  {
    id: "model-v1",
    name: "Repair Activity v1.0",
    version: "1.0.0",
    source: "Afi Vision",
    classes: ["Repairing", "Not Repairing"],
    confidenceThreshold: 0.7,
    active: true,
    uploadedAt: "2026-11-10 09:15",
    workflowName: "Workshop Repair Multi-Zone + Timer",
    endpointUrl: "/api/events",
  },
  {
    id: "model-v0",
    name: "RF-DETR Person + Pose Baseline",
    version: "0.9.2",
    source: "Afi Vision",
    classes: ["Repairing", "Not Repairing"],
    confidenceThreshold: 0.65,
    active: false,
    uploadedAt: "2026-11-02 14:30",
    workflowName: "Baseline Detection",
    endpointUrl: "/api/events",
  },
];

export const DEFAULT_SETTINGS: WorkshopSettings = {
  companyName: "PT Chitra Paratama",
  workshopName: "Workshop Repair",
  dataMode: "simulation",
  afiVisionWebhookSecret: "chitra-afi-vision-dev",
  shiftSchedules: {
    "Shift 1": "07:00 - 15:00",
    "Shift 2": "15:00 - 23:00",
    "Shift 3": "23:00 - 07:00",
  },
};

export function formatDurationID(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}j ${mins}m`;
}

