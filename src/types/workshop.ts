export type ActivityClass = "Repairing" | "Not Repairing";

export type ShiftOption = "Shift 1" | "Shift 2" | "Shift 3";

export interface Point2D {
  /** Normalized X coordinate (0-100%) relative to video frame width */
  x: number;
  /** Normalized Y coordinate (0-100%) relative to video frame height */
  y: number;
}

export interface Zone {
  id: string;
  code: string;
  name: string;
  color: string;
  cameraId: string;
  points: Point2D[];
}

export interface DetectionBox {
  id: string;
  trackId: string;
  zoneId: string;
  label: ActivityClass;
  confidence: number;
  /** Normalized bounding box (0-100%) */
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DetectionEvent {
  id: string;
  timestamp: string;
  zoneId: string;
  zoneLabel: string;
  zoneColor: string;
  label: ActivityClass;
  confidence: number;
  trackId?: string;
  durationSec?: number;
}

export interface ZoneDurationSummary {
  zoneId: string;
  zoneLabel: string;
  zoneColor: string;
  repairingMinutes: number;
  notRepairingMinutes: number;
}

export interface CameraFeed {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline";
  streamType: "simulation" | "rtsp_webrtc" | "hls";
  streamUrl?: string;
}

export interface AIModelConfig {
  id: string;
  name: string;
  version: string;
  source: "Afi Vision" | "Custom Upload";
  classes: ActivityClass[];
  confidenceThreshold: number;
  active: boolean;
  uploadedAt: string;
  workflowName?: string;
  endpointUrl?: string;
  fileName?: string;
}

export interface WorkshopSettings {
  companyName: string;
  workshopName: string;
  dataMode: "simulation" | "afi_vision";
  afiVisionWebhookSecret: string;
  shiftSchedules: Record<ShiftOption, string>;
}

