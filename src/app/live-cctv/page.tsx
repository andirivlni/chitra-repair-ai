"use client";

import React, { useState } from "react";
import { Camera, Layers, Scan, Wifi, WifiOff } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { CctvCanvas } from "@/components/CctvCanvas";
import { useWorkshop } from "@/context/WorkshopContext";

export default function LiveCctvPage() {
  const { cameras, zones, detectionsByCamera, activeModel } = useWorkshop();
  const [showZones, setShowZones] = useState(true);
  const [showDetections, setShowDetections] = useState(true);

  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Live CCTV Monitoring
            </h2>
            <p className="text-xs text-slate-500">
              Pantau semua kamera workshop secara bersamaan. Siap dihubungkan
              ke stream RTSP/WebRTC atau output preview Afi Vision.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowZones((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                showZones
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Zona {showZones ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={() => setShowDetections((v) => !v)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${
                showDetections
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-500 border-slate-200"
              }`}
            >
              <Scan className="w-3.5 h-3.5" />
              Deteksi {showDetections ? "ON" : "OFF"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cameras.map((cam) => {
            const camZones = zones.filter((z) => z.cameraId === cam.id);
            const camDetections = detectionsByCamera[cam.id] ?? [];
            return (
              <div
                key={cam.id}
                className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Camera className="w-4 h-4 text-slate-600" />
                    <span>
                      {cam.name} • {cam.location}
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      cam.status === "online"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500 border border-slate-200"
                    }`}
                  >
                    {cam.status === "online" ? (
                      <Wifi className="w-3 h-3" />
                    ) : (
                      <WifiOff className="w-3 h-3" />
                    )}
                    {cam.status === "online" ? "Online" : "Offline"}
                  </span>
                </div>

                {cam.status === "online" ? (
                  <CctvCanvas
                    cameraId={cam.id}
                    cameraName={cam.name}
                    zones={camZones}
                    detections={camDetections}
                    confidenceThreshold={activeModel.confidenceThreshold}
                    showZones={showZones}
                    showDetections={showDetections}
                    compact
                  />
                ) : (
                  <div className="aspect-video rounded-xl bg-slate-900 text-slate-400 flex flex-col items-center justify-center text-xs gap-1.5 border border-slate-200">
                    <WifiOff className="w-6 h-6 text-slate-500" />
                    <span>Kamera belum terhubung ke stream</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}

