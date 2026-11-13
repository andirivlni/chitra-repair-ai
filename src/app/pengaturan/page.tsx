"use client";

import React from "react";
import { RotateCcw, Settings } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { useWorkshop } from "@/context/WorkshopContext";

export default function PengaturanPage() {
  const { settings, updateSettings, resetDemoData } = useWorkshop();

  return (
    <DashboardShell>
      <div className="space-y-4 max-w-3xl">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Pengaturan Dashboard & Sumber Data
            </h2>
            <p className="text-xs text-slate-500">
              Atur identitas workshop, jadwal shift, dan mode integrasi Afi
              Vision.
            </p>
          </div>
          <button
            type="button"
            onClick={resetDemoData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data Demo
          </button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Settings className="w-4 h-4 text-slate-600" />
            <span>Konfigurasi Umum</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Nama Perusahaan
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) =>
                  updateSettings({ companyName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">
                Nama Workshop
              </label>
              <input
                type="text"
                value={settings.workshopName}
                onChange={(e) =>
                  updateSettings({ workshopName: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <label className="font-semibold text-slate-700 block">
              Mode Sumber Data
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateSettings({ dataMode: "simulation" })}
                className={`p-3 rounded-xl border text-left cursor-pointer ${
                  settings.dataMode === "simulation"
                    ? "border-blue-500 bg-blue-50/50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="font-bold text-slate-900">Data Simulasi</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Cocok untuk demo UI sebelum CCTV & Afi Vision terhubung.
                </div>
              </button>
              <button
                type="button"
                onClick={() => updateSettings({ dataMode: "afi_vision" })}
                className={`p-3 rounded-xl border text-left cursor-pointer ${
                  settings.dataMode === "afi_vision"
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <div className="font-bold text-slate-900">
                  Afi Vision Live API
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Menerima event real-time dari workflow Afi Vision ke{" "}
                  <code>/api/events</code>.
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

