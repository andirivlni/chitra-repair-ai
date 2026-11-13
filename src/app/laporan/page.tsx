"use client";

import React from "react";
import { BarChart3, Clock, Download, Info } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { useWorkshop } from "@/context/WorkshopContext";
import { formatDurationID } from "@/lib/mock-data";

export default function LaporanPage() {
  const { durationByShift, events, selectedShift, selectedDate } =
    useWorkshop();
  const shiftDurations = durationByShift[selectedShift] ?? [];

  const handleExportCsv = () => {
    const header = "Zona,Shift,Tanggal,Repairing (Menit),Not Repairing (Menit),Rasio (%)\n";
    const rows = shiftDurations
      .map((r) => {
        const total = r.repairingMinutes + r.notRepairingMinutes;
        const ratio = total > 0 ? Math.round((r.repairingMinutes / total) * 100) : 0;
        return `"${r.zoneLabel}","${selectedShift}","${selectedDate}",${r.repairingMinutes},${r.notRepairingMinutes},${ratio}`;
      })
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-repair-${selectedDate}-${selectedShift.replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Laporan Aktivitas & Durasi • {selectedShift} ({selectedDate})
            </h2>
            <p className="text-xs text-slate-500">
              Ringkasan durasi aktivitas Repairing vs Not Repairing per zona dan
              riwayat event deteksi.
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        {/* Visual Bar Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <BarChart3 className="w-4 h-4 text-slate-600" />
            <span>Proporsi Durasi per Zona</span>
          </div>

          <div className="space-y-4">
            {shiftDurations.map((row) => {
              const total = row.repairingMinutes + row.notRepairingMinutes;
              const repairPct =
                total > 0 ? Math.round((row.repairingMinutes / total) * 100) : 0;
              const notRepairPct = 100 - repairPct;

              return (
                <div key={row.zoneId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: row.zoneColor }}
                      />
                      {row.zoneLabel}
                    </span>
                    <span className="text-slate-600">
                      Repairing:{" "}
                      <strong className="text-blue-700">
                        {formatDurationID(row.repairingMinutes)}
                      </strong>{" "}
                      ({repairPct}%) • Not Repairing:{" "}
                      <strong className="text-teal-700">
                        {formatDurationID(row.notRepairingMinutes)}
                      </strong>{" "}
                      ({notRepairPct}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
                    <div
                      className="h-full bg-[#1d4ed8] transition-all"
                      style={{ width: `${repairPct}%` }}
                    />
                    <div
                      className="h-full bg-[#0d9488] transition-all"
                      style={{ width: `${notRepairPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-1">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Saat backend database (SQLite/PostgreSQL) diaktifkan, laporan ini
              otomatis menarik agregasi historis per tanggal & shift.
            </span>
          </div>
        </div>

        {/* Full Event Log */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Clock className="w-4 h-4 text-slate-600" />
            <span>Riwayat Event Deteksi ({events.length})</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-left">
                  <th className="py-2 font-semibold">Waktu</th>
                  <th className="py-2 font-semibold">Track ID</th>
                  <th className="py-2 font-semibold">Zona</th>
                  <th className="py-2 font-semibold">Kelas</th>
                  <th className="py-2 font-semibold text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/70">
                    <td className="py-2 font-mono text-slate-700">
                      {evt.timestamp}
                    </td>
                    <td className="py-2 font-mono text-slate-500">
                      {evt.trackId ?? "-"}
                    </td>
                    <td className="py-2 font-medium text-slate-800">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: evt.zoneColor }}
                        />
                        {evt.zoneLabel}
                      </span>
                    </td>
                    <td className="py-2 font-semibold">
                      <span
                        className={
                          evt.label === "Repairing"
                            ? "text-blue-700"
                            : "text-teal-700"
                        }
                      >
                        {evt.label}
                      </span>
                    </td>
                    <td className="py-2 text-right font-mono text-slate-700">
                      {Math.round(evt.confidence * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

