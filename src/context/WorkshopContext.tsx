"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_CAMERAS,
  DEFAULT_DETECTIONS_BY_CAMERA,
  DEFAULT_DURATION_BY_SHIFT,
  DEFAULT_EVENTS,
  DEFAULT_MODELS,
  DEFAULT_SETTINGS,
  DEFAULT_ZONES,
} from "@/lib/mock-data";
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

interface WorkshopContextValue {
  zones: Zone[];
  setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
  cameras: CameraFeed[];
  setCameras: React.Dispatch<React.SetStateAction<CameraFeed[]>>;
  detectionsByCamera: Record<string, DetectionBox[]>;
  durationByShift: Record<ShiftOption, ZoneDurationSummary[]>;
  events: DetectionEvent[];
  addEvent: (event: Omit<DetectionEvent, "id">) => void;
  models: AIModelConfig[];
  activeModel: AIModelConfig;
  setActiveModelId: (id: string) => void;
  updateActiveThreshold: (threshold: number) => void;
  addModel: (model: Omit<AIModelConfig, "id" | "uploadedAt">) => void;
  settings: WorkshopSettings;
  updateSettings: (partial: Partial<WorkshopSettings>) => void;
  selectedShift: ShiftOption;
  setSelectedShift: (shift: ShiftOption) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedCameraId: string;
  setSelectedCameraId: (id: string) => void;
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  resetDemoData: () => void;
}

const WorkshopContext = createContext<WorkshopContextValue | null>(null);

const STORAGE_KEYS = {
  zones: "chitra_repair_zones_v1",
  models: "chitra_repair_models_v1",
  settings: "chitra_repair_settings_v1",
};

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function WorkshopProvider({ children }: { children: React.ReactNode }) {
  const [zones, setZones] = useState<Zone[]>(DEFAULT_ZONES);
  const [cameras, setCameras] = useState<CameraFeed[]>(DEFAULT_CAMERAS);
  const [detectionsByCamera, setDetectionsByCamera] = useState<
    Record<string, DetectionBox[]>
  >(DEFAULT_DETECTIONS_BY_CAMERA);
  const [durationByShift] = useState<Record<ShiftOption, ZoneDurationSummary[]>>(
    DEFAULT_DURATION_BY_SHIFT
  );
  const [events, setEvents] = useState<DetectionEvent[]>(DEFAULT_EVENTS);
  const [models, setModels] = useState<AIModelConfig[]>(DEFAULT_MODELS);
  const [settings, setSettings] = useState<WorkshopSettings>(DEFAULT_SETTINGS);

  const [selectedShift, setSelectedShift] = useState<ShiftOption>("Shift 1");
  const [selectedDate, setSelectedDate] = useState<string>("2026-11-12");
  const [selectedCameraId, setSelectedCameraId] = useState<string>("cctv-01");
  const [isLive, setIsLive] = useState<boolean>(true);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate persisted config from localStorage on client mount
  useEffect(() => {
    setZones(readStored(STORAGE_KEYS.zones, DEFAULT_ZONES));
    setModels(readStored(STORAGE_KEYS.models, DEFAULT_MODELS));
    setSettings(readStored(STORAGE_KEYS.settings, DEFAULT_SETTINGS));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.zones, JSON.stringify(zones));
  }, [zones, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.models, JSON.stringify(models));
  }, [models, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  }, [settings, hydrated]);

  const activeModel = useMemo(
    () => models.find((m) => m.active) ?? models[0],
    [models]
  );

  const setActiveModelId = useCallback((id: string) => {
    setModels((prev) =>
      prev.map((m) => ({
        ...m,
        active: m.id === id,
      }))
    );
  }, []);

  const updateActiveThreshold = useCallback((threshold: number) => {
    setModels((prev) =>
      prev.map((m) =>
        m.active ? { ...m, confidenceThreshold: threshold } : m
      )
    );
  }, []);

  const addModel = useCallback(
    (newModel: Omit<AIModelConfig, "id" | "uploadedAt">) => {
      const now = new Date();
      const formatted = `${now.toISOString().slice(0, 10)} ${now
        .toTimeString()
        .slice(0, 5)}`;
      const entry: AIModelConfig = {
        ...newModel,
        id: `model-${Date.now()}`,
        uploadedAt: formatted,
      };
      setModels((prev) =>
        newModel.active
          ? [entry, ...prev.map((m) => ({ ...m, active: false }))]
          : [entry, ...prev]
      );
    },
    []
  );

  const updateSettings = useCallback((partial: Partial<WorkshopSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const addEvent = useCallback((event: Omit<DetectionEvent, "id">) => {
    setEvents((prev) => [
      { ...event, id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
      ...prev.slice(0, 29),
    ]);
  }, []);

  // Gentle live simulation tick
  useEffect(() => {
    if (!isLive || settings.dataMode !== "simulation") return;

    const timer = setInterval(() => {
      setDetectionsByCamera((prev) => {
        const next: Record<string, DetectionBox[]> = {};
        for (const [camId, boxes] of Object.entries(prev)) {
          next[camId] = boxes.map((box) => {
            const dx = (Math.random() - 0.5) * 0.6;
            const dy = (Math.random() - 0.5) * 0.5;
            const dConf = (Math.random() - 0.5) * 0.03;
            return {
              ...box,
              x: Math.max(4, Math.min(90, Number((box.x + dx).toFixed(2)))),
              y: Math.max(12, Math.min(82, Number((box.y + dy).toFixed(2)))),
              confidence: Math.max(
                0.55,
                Math.min(0.99, Number((box.confidence + dConf).toFixed(2)))
              ),
            };
          });
        }
        return next;
      });

      // Occasionally append a simulated detection log
      if (Math.random() > 0.45) {
        const camBoxes = detectionsByCamera["cctv-01"] ?? [];
        if (camBoxes.length > 0) {
          const picked = camBoxes[Math.floor(Math.random() * camBoxes.length)];
          const matchedZone = zones.find((z) => z.id === picked.zoneId);
          if (matchedZone) {
            const nowStr = new Date().toTimeString().slice(0, 8);
            addEvent({
              timestamp: nowStr,
              zoneId: matchedZone.id,
              zoneLabel: `${matchedZone.code} • ${matchedZone.name}`,
              zoneColor: matchedZone.color,
              label: picked.label,
              confidence: picked.confidence,
              trackId: picked.trackId,
            });
          }
        }
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [isLive, settings.dataMode, zones, detectionsByCamera, addEvent]);

  const resetDemoData = useCallback(() => {
    setZones(DEFAULT_ZONES);
    setCameras(DEFAULT_CAMERAS);
    setDetectionsByCamera(DEFAULT_DETECTIONS_BY_CAMERA);
    setEvents(DEFAULT_EVENTS);
    setModels(DEFAULT_MODELS);
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== "undefined") {
      Object.values(STORAGE_KEYS).forEach((k) =>
        window.localStorage.removeItem(k)
      );
    }
  }, []);

  return (
    <WorkshopContext.Provider
      value={{
        zones,
        setZones,
        cameras,
        setCameras,
        detectionsByCamera,
        durationByShift,
        events,
        addEvent,
        models,
        activeModel,
        setActiveModelId,
        updateActiveThreshold,
        addModel,
        settings,
        updateSettings,
        selectedShift,
        setSelectedShift,
        selectedDate,
        setSelectedDate,
        selectedCameraId,
        setSelectedCameraId,
        isLive,
        setIsLive,
        resetDemoData,
      }}
    >
      {children}
    </WorkshopContext.Provider>
  );
}

export function useWorkshop() {
  const ctx = useContext(WorkshopContext);
  if (!ctx) {
    throw new Error("useWorkshop must be used within WorkshopProvider");
  }
  return ctx;
}

