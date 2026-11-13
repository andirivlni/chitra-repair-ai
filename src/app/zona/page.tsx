"use client";

import React, { useState } from "react";
import { Copy, Check, Layers, Plus, RotateCcw, Trash2 } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { CctvCanvas } from "@/components/CctvCanvas";
import { useWorkshop } from "@/context/WorkshopContext";
import { DEFAULT_ZONES } from "@/lib/mock-data";

export default function ZonaWorkshopPage() {
  const { zones, setZones, detectionsByCamera, activeModel } = useWorkshop();
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(
    zones[0]?.id ?? null
  );
  const [copiedJson, setCopiedJson] = useState(false);

  const handleUpdateZonePoints = (
    zoneId: string,
    points: { x: number; y: number }[]
  ) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, points } : z))
    );
  };

  const handleAddZone = () => {
    const nextNum = zones.length + 1;
    const palette = ["#f97316", "#ec4899", "#22c55e", "#3b82f6"];
    const color = palette[nextNum % palette.length];
    const newId = `z${Date.now()}`;
    setZones((prev) => [
      ...prev,
      {
        id: newId,
        code: `Z${nextNum}`,
        name: `Area Baru ${nextNum}`,
        color,
        cameraId: "cctv-01",
        points: [
          { x: 35, y: 35 },
          { x: 55, y: 35 },
          { x: 55, y: 55 },
          { x: 35, y: 55 },
        ],
      },
    ]);
    setSelectedZoneId(newId);
  };

  const handleDeleteZone = (id: string) => {
    setZones((prev) => prev.filter((z) => z.id !== id));
    if (selectedZoneId === id) setSelectedZoneId(null);
  };

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(zones, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Editor Zona Workshop (Multi-Zone Polygon)
            </h2>
            <p className="text-xs text-slate-500">
              Seret titik sudut polygon langsung pada frame CCTV. Koordinat
              tersimpan otomatis dan dapat di-export ke node Multi-Zone Afi
              Vision.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddZone}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Tambah Zona
            </button>
            <button
              type="button"
              onClick={handleCopyJson}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {copiedJson ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>JSON Disalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Export JSON Zona</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setZones(DEFAULT_ZONES)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Default
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs">
            <CctvCanvas
              cameraId="cctv-01"
              cameraName="CCTV 01"
              zones={zones.filter((z) => z.cameraId === "cctv-01")}
              detections={detectionsByCamera["cctv-01"] ?? []}
              confidenceThreshold={activeModel.confidenceThreshold}
              showZones={true}
              showDetections={true}
              isEditingZones={true}
              selectedZoneId={selectedZoneId}
              onSelectZone={setSelectedZoneId}
              onUpdateZonePoints={handleUpdateZonePoints}
            />
          </div>

          <div className="xl:col-span-4 bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Layers className="w-4 h-4 text-slate-600" />
              <span>Daftar Zona ({zones.length})</span>
            </div>

            <div className="space-y-2.5">
              {zones.map((zone) => {
                const isSelected = selectedZoneId === zone.id;
                return (
                  <div
                    key={zone.id}
                    onClick={() => setSelectedZoneId(zone.id)}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer space-y-2 ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/40"
                        : "border-slate-200 bg-slate-50/60 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={zone.color}
                          onChange={(e) =>
                            setZones((prev) =>
                              prev.map((z) =>
                                z.id === zone.id
                                  ? { ...z, color: e.target.value }
                                  : z
                              )
                            )
                          }
                          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                          aria-label={`Warna ${zone.name}`}
                        />
                        <input
                          type="text"
                          value={zone.name}
                          onChange={(e) =>
                            setZones((prev) =>
                              prev.map((z) =>
                                z.id === zone.id
                                  ? { ...z, name: e.target.value }
                                  : z
                              )
                            )
                          }
                          className="text-xs font-bold text-slate-900 bg-white border border-slate-200 rounded px-2 py-1 w-36"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteZone(zone.id);
                        }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Hapus zona"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {zone.points
                        .map((p) => `(${p.x}%, ${p.y}%)`)
                        .join(" → ")}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

