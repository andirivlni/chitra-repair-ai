"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  Calendar,
  Cpu,
  LayoutDashboard,
  Layers,
  Menu,
  Settings,
  Users,
  Video,
  X,
} from "lucide-react";
import { useWorkshop } from "@/context/WorkshopContext";
import { ShiftOption } from "@/types/workshop";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/live-cctv", label: "Live CCTV", icon: Video },
  { href: "/zona", label: "Zona Workshop", icon: Layers },
  { href: "/laporan", label: "Laporan Aktivitas", icon: BarChart3 },
  { href: "/model-ai", label: "Model AI", icon: Cpu },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export function DashboardShell({
  children,
  tvFit = false,
}: {
  children: React.ReactNode;
  tvFit?: boolean;
}) {
  const pathname = usePathname();
  const {
    settings,
    selectedShift,
    setSelectedShift,
    selectedDate,
    setSelectedDate,
    isLive,
    setIsLive,
  } = useWorkshop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentNav =
    NAV_ITEMS.find((item) => item.href === pathname)?.label ?? "Overview";

  return (
    <div
      className={`flex bg-[#f1f5f9] text-slate-900 ${
        tvFit ? "min-h-screen lg:h-screen lg:overflow-hidden" : "min-h-screen"
      }`}
    >
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Corporate Navy Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 bg-[#0b1f3a] text-slate-200 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 border-r border-slate-800 shrink-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Official Chitra Paratama Logo Block */}
          <div className="bg-white px-4 py-3.5 border-b border-slate-200 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <img
                src="/chitra-logo.png"
                alt="PT Chitra Paratama - Total Tire Solution"
                className="h-10 w-auto object-contain"
              />
            </Link>
            <button
              type="button"
              className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Tutup menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* System Label */}
          <div className="px-4 pt-5 pb-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Repair AI Monitoring
            </div>
          </div>

          {/* Navigation */}
          <nav className="px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    active
                      ? "bg-[#0089b6]/20 text-white font-semibold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#6fb43f]" />
                  )}
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      active ? "text-[#38bdf8]" : "text-slate-400"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Corporate Footer Status */}
        <div className="p-4 border-t border-white/10 space-y-2.5">
          <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-xs">
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span className="text-[11px] font-medium text-slate-400">
                Vision Engine
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                  settings.dataMode === "simulation"
                    ? "text-sky-300"
                    : "text-[#6fb43f]"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    settings.dataMode === "simulation"
                      ? "bg-sky-400"
                      : "bg-[#6fb43f]"
                  }`}
                />
                {settings.dataMode === "simulation"
                  ? "Simulasi"
                  : "Afi Vision"}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {settings.companyName}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Top Corporate Command Bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-5 py-2.5 sticky top-0 z-20 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Buka menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0089b6]">
                    {currentNav}
                  </span>
                  <span className="text-slate-300">/</span>
                  <h1 className="text-base sm:text-lg font-bold text-[#0b1f3a] tracking-tight">
                    Workshop Repair Productivity
                  </h1>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${
                      settings.dataMode === "simulation"
                        ? "bg-slate-100 text-slate-600 border-slate-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {settings.dataMode === "simulation"
                      ? "DATA SIMULASI"
                      : "AFI VISION LIVE"}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Operational AI Monitoring • {settings.companyName}
                </p>
              </div>
            </div>

            {/* Compact Filter Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700">
                <Building2 className="w-3.5 h-3.5 text-[#0089b6]" />
                <span>{settings.workshopName}</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedShift}
                  onChange={(e) =>
                    setSelectedShift(e.target.value as ShiftOption)
                  }
                  className="bg-transparent outline-none cursor-pointer pr-1"
                  aria-label="Pilih Shift"
                >
                  <option value="Shift 1">Shift 1</option>
                  <option value="Shift 2">Shift 2</option>
                  <option value="Shift 3">Shift 3</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-medium text-slate-700">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent outline-none cursor-pointer text-xs"
                  aria-label="Pilih Tanggal"
                />
              </div>

              <button
                type="button"
                onClick={() => setIsLive(!isLive)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                  isLive
                    ? "bg-[#6fb43f]/10 text-[#4d8427] border-[#6fb43f]/30 hover:bg-[#6fb43f]/20"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                }`}
                title="Klik untuk pause/resume monitoring live"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLive ? "bg-[#6fb43f] animate-pulse" : "bg-slate-400"
                  }`}
                />
                <span>{isLive ? "Live" : "Paused"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace */}
        <main
          className={`flex-1 w-full mx-auto ${
            tvFit
              ? "p-3 lg:p-4 lg:min-h-0 lg:overflow-hidden"
              : "p-4 lg:p-6 max-w-[1600px]"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
