"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  Camera,
  Check,
  Clock,
  Cpu,
  HardHat,
  Layers,
  Pencil,
  Scan,
  UserCheck,
  Wrench,
} from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { CctvCanvas } from "@/components/CctvCanvas";
import { useWorkshop } from "@/context/WorkshopContext";
import { formatDurationID } from "@/lib/mock-data";

export default function OverviewPage() {
  const {
    zones,
    setZones,
    cameras,
    detectionsByCamera,
    durationByShift,
    events,
    activeModel,
    selectedShift,
    selectedCameraId,
    setSelectedCameraId,
  } = useWorkshop();

  const [showZones, setShowZones] = useState(true);
  const [showDetections, setShowDetections] = useState(true);
  const [isEditingZones, setIsEditingZones] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  const currentCamera =
    cameras.find((c) => c.id === selectedCameraId) ?? cameras[0];

  const cameraDetections = useMemo(() => {
    const raw = detectionsByCamera[currentCamera.id] ?? [];
    return raw.filter((d) => d.confidence >= activeModel.confidenceThreshold);
  }, [detectionsByCamera, currentCamera.id, activeModel.confidenceThreshold]);

  const kpis = useMemo(() => {
    const total = cameraDetections.length;
    const repairing = cameraDetections.filter(
      (d) => d.label === "Repairing"
    ).length;
    const notRepairing = cameraDetections.filter(
      (d) => d.label === "Not Repairing"
    ).length;
    const ratio = total > 0 ? Math.round((repairing / total) * 100) : 0;
    return { total, repairing, notRepairing, ratio };
  }, [cameraDetections]);

  const zoneCounts = useMemo(() => {
    return zones.map((z) => {
      const inZone = cameraDetections.filter((d) => d.zoneId === z.id);
      const repairing = inZone.filter((d) => d.label === "Repairing").length;
      const notRepairing = inZone.filter(
        (d) => d.label === "Not Repairing"
      ).length;
      const total = repairing + notRepairing;
      const pct = total > 0 ? Math.round((repairing / total) * 100) : 0;
      return {
        zone: z,
        repairing,
        notRepairing,
        total,
        pct,
      };
    });
  }, [zones, cameraDetections]);

  const shiftDurations = durationByShift[selectedShift] ?? [];

  const handleUpdateZonePoints = (
    zoneId: string,
    points: { x: number; y: number }[]
  ) => {
    setZones((prev) =>
      prev.map((z) => (z.id === zoneId ? { ...z, points } : z))
    );
  };

  return (
    <DashboardShell tvFit>
      <div className="lg:h-full flex flex-col gap-3">
        {/* Row 1: Executive KPI Strip (TV-sized numbers) */}
        <section className="shrink-0 grid grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg border border-slate-200 border-t-[3px] border-t-[#0b1f3a] px-4 py-2.5 shadow-2xs flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Teknisi Terdeteksi
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Aktif di {zones.length} zona
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <HardHat className="w-6 h-6 text-[#0b1f3a]/70 hidden sm:block" />
              <span className="text-3xl xl:text-4xl font-extrabold text-[#0b1f3a] tabular-nums leading-none">
                {kpis.total}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 border-t-[3px] border-t-[#0089b6] px-4 py-2.5 shadow-2xs flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Repairing
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Aktivitas perbaikan
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Wrench className="w-6 h-6 text-[#0089b6]/70 hidden sm:block" />
              <span className="text-3xl xl:text-4xl font-extrabold text-[#0089b6] tabular-nums leading-none">
                {kpis.repairing}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 border-t-[3px] border-t-teal-600 px-4 py-2.5 shadow-2xs flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Not Repairing
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Standby / support
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-6 h-6 text-teal-600/70 hidden sm:block" />
              <span className="text-3xl xl:text-4xl font-extrabold text-teal-700 tabular-nums leading-none">
                {kpis.notRepairing}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 border-t-[3px] border-t-[#6fb43f] px-4 py-2.5 shadow-2xs flex items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Rasio Repair
              </div>
              <div className="text-xs font-semibold text-[#4d8427] mt-0.5">
                Target ≥ 75%
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-[#6fb43f]/80 hidden sm:block" />
              <span className="text-3xl xl:text-4xl font-extrabold text-[#4d8427] tabular-nums leading-none">
                {kpis.ratio}%
              </span>
            </div>
          </div>
        </section>

        {/* Row 2: Main CCTV + Zone & Model Sidebar (fills remaining middle height) */}
        <section className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-12 gap-3">
          {/* Left: Dark-Bezel Control Room Monitor */}
          <div className="xl:col-span-8 bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden flex flex-col min-h-0">
            <div className="bg-[#0b1f3a] text-white px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-2 text-sm font-bold tracking-wide">
                <Camera className="w-4 h-4 text-[#38bdf8]" />
                <span>
                  {currentCamera.name} — {currentCamera.location}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowZones((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                    showZones
                      ? "bg-[#0089b6]/25 text-sky-200 border-[#0089b6]/60"
                      : "bg-white/5 text-slate-400 border-white/10"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Zona {showZones ? "ON" : "OFF"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDetections((v) => !v)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                    showDetections
                      ? "bg-[#6fb43f]/25 text-lime-200 border-[#6fb43f]/60"
                      : "bg-white/5 text-slate-400 border-white/10"
                  }`}
                >
                  <Scan className="w-3.5 h-3.5" />
                  <span>Deteksi {showDetections ? "ON" : "OFF"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditingZones((v) => !v);
                    if (!showZones) setShowZones(true);
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border transition-colors cursor-pointer ${
                    isEditingZones
                      ? "bg-amber-400 text-slate-950 border-amber-500"
                      : "bg-white/10 text-slate-200 border-white/20 hover:bg-white/15"
                  }`}
                >
                  {isEditingZones ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Selesai</span>
                    </>
                  ) : (
                    <>
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Zona</span>
                    </>
                  )}
                </button>

                <select
                  value={currentCamera.id}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="px-2.5 py-1 rounded border border-white/20 bg-slate-900 text-xs font-medium text-white outline-none cursor-pointer"
                  aria-label="Pilih Kamera"
                >
                  {cameras.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex-1 min-h-0 p-2 bg-slate-950/95">
              <CctvCanvas
                cameraId={currentCamera.id}
                cameraName={currentCamera.name}
                zones={zones.filter((z) => z.cameraId === currentCamera.id)}
                detections={cameraDetections}
                confidenceThreshold={activeModel.confidenceThreshold}
                showZones={showZones}
                showDetections={showDetections}
                isEditingZones={isEditingZones}
                selectedZoneId={selectedZoneId}
                onSelectZone={setSelectedZoneId}
                onUpdateZonePoints={handleUpdateZonePoints}
                fillContainer
              />
            </div>
          </div>

          {/* Right: Zone Utilization & AI Engine */}
          <div className="xl:col-span-4 flex flex-col gap-3 min-h-0">
            {/* Ringkasan Zona */}
            <div className="flex-1 min-h-0 bg-white rounded-lg border border-slate-200 p-3.5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2 shrink-0">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0b1f3a]">
                  <Layers className="w-4 h-4 text-[#0089b6]" />
                  <span>Ringkasan Zona Aktif</span>
                </div>
                <Link
                  href="/zona"
                  className="text-xs font-semibold text-[#0089b6] hover:underline"
                >
                  Kelola
                </Link>
              </div>

              <div className="flex-1 flex flex-col justify-around gap-2">
                {zoneCounts.map(
                  ({ zone, repairing, notRepairing, total, pct }) => (
                    <div
                      key={zone.id}
                      className="px-3 py-2 rounded-lg border border-slate-200/80 bg-slate-50/70 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-xs shrink-0"
                            style={{ backgroundColor: zone.color }}
                          />
                          <span className="text-sm font-bold text-slate-900">
                            {zone.code} • {zone.name}
                          </span>
                        </div>
                        <span className="text-base font-extrabold text-[#0b1f3a] tabular-nums">
                          {total > 0 ? `${pct}%` : "0%"}
                        </span>
                      </div>

                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-[#0089b6] transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>
                          <strong className="text-[#0089b6] text-sm">
                            {repairing}
                          </strong>{" "}
                          Repairing
                        </span>
                        <span>
                          <strong className="text-teal-700 text-sm">
                            {notRepairing}
                          </strong>{" "}
                          Not Repairing
                        </span>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Compact Model AI Status */}
            <div className="shrink-0 bg-white rounded-lg border border-slate-200 px-3.5 py-2.5 shadow-2xs flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#0089b6] shrink-0" />
                  <span className="text-sm font-bold text-[#0b1f3a] truncate">
                    {activeModel.name}
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-[#6fb43f]/15 text-[#4d8427]">
                    Aktif
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {activeModel.source} • Threshold{" "}
                  <strong className="text-slate-800 font-mono">
                    {activeModel.confidenceThreshold.toFixed(2)}
                  </strong>
                </div>
              </div>
              <Link
                href="/model-ai"
                className="shrink-0 px-3 py-1.5 rounded-md bg-[#0089b6] text-white text-xs font-semibold hover:bg-[#007399] transition-colors"
              >
                Atur AI
              </Link>
            </div>
          </div>
        </section>

        {/* Row 3: Bottom Executive Tables (Compact height, Large TV text) */}
        <section className="shrink-0 grid grid-cols-1 xl:grid-cols-12 gap-3">
          {/* Akumulasi Durasi Deteksi */}
          <div className="xl:col-span-7 bg-white rounded-lg border border-slate-200 px-4 py-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0b1f3a]">
                <Clock className="w-4 h-4 text-[#0089b6]" />
                <span>Akumulasi Durasi • {selectedShift}</span>
              </div>
              <span className="text-xs text-slate-400">
                Rasio = Repairing / Total
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-left uppercase text-[11px] tracking-wider">
                    <th className="py-1 font-semibold">Zona</th>
                    <th className="py-1 font-semibold text-right">Repairing</th>
                    <th className="py-1 font-semibold text-right">
                      Not Repairing
                    </th>
                    <th className="py-1 font-semibold pl-4">Utilisasi</th>
                    <th className="py-1 font-semibold text-right">Rasio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shiftDurations.map((row) => {
                    const totalMin =
                      row.repairingMinutes + row.notRepairingMinutes;
                    const ratio =
                      totalMin > 0
                        ? Math.round((row.repairingMinutes / totalMin) * 100)
                        : 0;
                    return (
                      <tr key={row.zoneId}>
                        <td className="py-1.5 font-semibold text-slate-800">
                          <span className="inline-flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-xs shrink-0"
                              style={{ backgroundColor: row.zoneColor }}
                            />
                            {row.zoneLabel}
                          </span>
                        </td>
                        <td className="py-1.5 text-right font-bold text-[#0089b6] tabular-nums">
                          {formatDurationID(row.repairingMinutes)}
                        </td>
                        <td className="py-1.5 text-right font-semibold text-slate-600 tabular-nums">
                          {formatDurationID(row.notRepairingMinutes)}
                        </td>
                        <td className="py-1.5 pl-4 w-28">
                          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className="h-full bg-[#6fb43f]"
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-1.5 text-right font-extrabold text-[#0b1f3a] tabular-nums">
                          {ratio}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Audit Log Deteksi Terbaru */}
          <div className="xl:col-span-5 bg-white rounded-lg border border-slate-200 px-4 py-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0b1f3a]">
                <Clock className="w-4 h-4 text-[#0089b6]" />
                <span>Log Deteksi Terbaru</span>
              </div>
              <Link
                href="/laporan"
                className="text-xs font-semibold text-[#0089b6] hover:underline"
              >
                Lihat Semua
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-left uppercase text-[11px] tracking-wider">
                    <th className="py-1 font-semibold">Waktu</th>
                    <th className="py-1 font-semibold">Zona</th>
                    <th className="py-1 font-semibold text-right">Aktivitas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.slice(0, 3).map((evt) => (
                    <tr key={evt.id}>
                      <td className="py-1.5 font-mono font-semibold text-slate-700 tabular-nums">
                        {evt.timestamp}
                      </td>
                      <td className="py-1.5 font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-xs shrink-0"
                            style={{ backgroundColor: evt.zoneColor }}
                          />
                          {evt.zoneLabel}
                        </span>
                      </td>
                      <td className="py-1.5 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold ${
                            evt.label === "Repairing"
                              ? "bg-[#0089b6]/15 text-[#0089b6]"
                              : "bg-teal-50 text-teal-700"
                          }`}
                        >
                          {evt.label}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
