"use client";

import React, { useEffect, useRef, useState } from "react";
import { DetectionBox, Zone } from "@/types/workshop";

interface CctvCanvasProps {
  cameraId: string;
  cameraName: string;
  zones: Zone[];
  detections: DetectionBox[];
  confidenceThreshold: number;
  showZones: boolean;
  showDetections: boolean;
  isEditingZones?: boolean;
  selectedZoneId?: string | null;
  onSelectZone?: (zoneId: string) => void;
  onUpdateZonePoints?: (zoneId: string, points: { x: number; y: number }[]) => void;
  compact?: boolean;
  fillContainer?: boolean;
}

export function CctvCanvas({
  cameraId,
  cameraName,
  zones,
  detections,
  confidenceThreshold,
  showZones,
  showDetections,
  isEditingZones = false,
  selectedZoneId = null,
  onSelectZone,
  onUpdateZonePoints,
  compact = false,
  fillContainer = false,
}: CctvCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingVertex, setDraggingVertex] = useState<{
    zoneId: string;
    index: number;
  } | null>(null);
  const [clockText, setClockText] = useState("12-11-2026 Thu 08:43:11");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const dd = String(now.getDate()).padStart(2, "0");
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const yyyy = now.getFullYear();
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const day = days[now.getDay()];
      const time = now.toTimeString().slice(0, 8);
      setClockText(`${dd}-${mm}-${yyyy} ${day} ${time}`);
    };
    updateClock();
    const id = setInterval(updateClock, 1000);
    return () => clearInterval(id);
  }, []);

  const visibleDetections = detections.filter(
    (d) => d.confidence >= confidenceThreshold
  );

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!draggingVertex || !containerRef.current || !onUpdateZonePoints) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(
      2,
      Math.min(98, Number((((e.clientX - rect.left) / rect.width) * 100).toFixed(1)))
    );
    const y = Math.max(
      2,
      Math.min(98, Number((((e.clientY - rect.top) / rect.height) * 100).toFixed(1)))
    );

    const targetZone = zones.find((z) => z.id === draggingVertex.zoneId);
    if (!targetZone) return;

    const updatedPoints = targetZone.points.map((pt, idx) =>
      idx === draggingVertex.index ? { x, y } : pt
    );
    onUpdateZonePoints(targetZone.id, updatedPoints);
  };

  const handlePointerUp = () => {
    setDraggingVertex(null);
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-lg overflow-hidden bg-slate-900 border border-slate-700/80 select-none ${
        fillContainer ? "h-full min-h-[240px]" : "aspect-video"
      }`}
    >
      {/* Simulated Workshop Floor Backdrop */}
      <svg
        viewBox="0 0 1000 562"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`floor-${cameraId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="35%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#78716c" />
          </linearGradient>
          <linearGradient id={`wall-${cameraId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>

        {/* Background Workshop Wall & Ceiling */}
        <rect x="0" y="0" width="1000" height="210" fill={`url(#wall-${cameraId})`} />
        {/* Floor */}
        <polygon
          points="0,210 1000,210 1000,562 0,562"
          fill={`url(#floor-${cameraId})`}
        />
        {/* Concrete floor grid lines */}
        <g stroke="#ffffff" strokeOpacity="0.12" strokeWidth="1.5">
          <line x1="200" y1="210" x2="50" y2="562" />
          <line x1="400" y1="210" x2="320" y2="562" />
          <line x1="600" y1="210" x2="680" y2="562" />
          <line x1="800" y1="210" x2="950" y2="562" />
          <line x1="0" y1="300" x2="1000" y2="300" />
          <line x1="0" y1="410" x2="1000" y2="410" />
        </g>

        {/* Workshop Pillars & Machinery Silhouettes */}
        <rect x="570" y="25" width="34" height="240" fill="#ca8a04" opacity="0.85" />
        <rect x="70" y="70" width="110" height="160" rx="4" fill="#cbd5e1" opacity="0.55" />
        <rect x="195" y="90" width="85" height="135" rx="4" fill="#94a3b8" opacity="0.6" />
        <rect x="700" y="130" width="130" height="170" rx="6" fill="#475569" opacity="0.7" />

        {/* Giant OTR Tire in Bay A (Z1) */}
        <g transform="translate(465, 345)">
          <ellipse cx="0" cy="0" rx="76" ry="44" fill="#1e293b" stroke="#0f172a" strokeWidth="6" />
          <ellipse cx="0" cy="0" rx="44" ry="24" fill="#475569" />
          <ellipse cx="0" cy="0" rx="22" ry="11" fill="#1e293b" />
        </g>

        {/* Tire in Bay B (Z2) */}
        <g transform="translate(360, 185)">
          <ellipse cx="0" cy="0" rx="36" ry="20" fill="#1e293b" stroke="#0f172a" strokeWidth="4" />
          <ellipse cx="0" cy="0" rx="18" ry="9" fill="#475569" />
        </g>

        {/* Equipment in Support Area (Z3) */}
        <g transform="translate(765, 325)">
          <rect x="-45" y="-50" width="90" height="100" rx="6" fill="#334155" opacity="0.7" />
          <circle cx="0" cy="0" r="22" fill="#0f172a" opacity="0.6" />
        </g>
      </svg>

      {/* Camera Timestamp Overlay */}
      <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded bg-slate-950/75 text-white font-mono text-[11px] tracking-wide pointer-events-none">
        {clockText} • {cameraName}
      </div>

      {isEditingZones && (
        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-semibold text-[11px] shadow pointer-events-none">
          Mode Edit Zona: Seret titik sudut polygon
        </div>
      )}

      {/* Interactive SVG Overlay for Zones & Detections */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Polygon Zones */}
        {showZones &&
          zones.map((zone) => {
            const ptsStr = zone.points.map((p) => `${p.x},${p.y}`).join(" ");
            const isSelected = selectedZoneId === zone.id;
            const labelX =
              zone.points.reduce((acc, p) => acc + p.x, 0) / zone.points.length;
            const labelY =
              Math.max(...zone.points.map((p) => p.y)) - 3;

            return (
              <g key={zone.id}>
                <polygon
                  points={ptsStr}
                  fill={zone.color}
                  fillOpacity={isSelected ? 0.28 : 0.16}
                  stroke={zone.color}
                  strokeWidth={isSelected ? 0.75 : 0.5}
                  className={isEditingZones ? "cursor-pointer" : ""}
                  onClick={() => isEditingZones && onSelectZone?.(zone.id)}
                />

                {/* Zone Label Pill */}
                {!compact && (
                  <g className="pointer-events-none">
                    <rect
                      x={Math.max(2, labelX - 11)}
                      y={Math.min(84, labelY - 3)}
                      width={22}
                      height={4.8}
                      rx={1}
                      fill={zone.color}
                      fillOpacity={0.92}
                    />
                    <text
                      x={Math.max(13, labelX)}
                      y={Math.min(87.2, labelY + 0.3)}
                      textAnchor="middle"
                      fontSize="2.2"
                      fontWeight="700"
                      fill="#0f172a"
                    >
                      {zone.code} • {zone.name}
                    </text>
                  </g>
                )}

                {/* Draggable Vertices in Edit Mode */}
                {isEditingZones &&
                  zone.points.map((pt, idx) => (
                    <circle
                      key={`${zone.id}-pt-${idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={1.35}
                      fill="#ffffff"
                      stroke={zone.color}
                      strokeWidth={0.6}
                      className="cursor-grab active:cursor-grabbing"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        onSelectZone?.(zone.id);
                        setDraggingVertex({ zoneId: zone.id, index: idx });
                      }}
                    />
                  ))}
              </g>
            );
          })}

        {/* Detection Bounding Boxes */}
        {showDetections &&
          visibleDetections.map((det) => {
            const boxColor =
              det.label === "Repairing" ? "#1d4ed8" : "#0d9488";
            return (
              <g key={det.id} className="pointer-events-none">
                <rect
                  x={det.x}
                  y={det.y}
                  width={det.w}
                  height={det.h}
                  fill={boxColor}
                  fillOpacity={0.12}
                  stroke={boxColor}
                  strokeWidth={0.45}
                  rx={0.5}
                />
                {/* Technician Silhouette Placeholder inside box */}
                <circle
                  cx={det.x + det.w / 2}
                  cy={det.y + det.h * 0.28}
                  r={det.w * 0.22}
                  fill="#e2e8f0"
                  fillOpacity={0.75}
                />
                <rect
                  x={det.x + det.w * 0.25}
                  y={det.y + det.h * 0.48}
                  width={det.w * 0.5}
                  height={det.h * 0.42}
                  rx={0.6}
                  fill="#94a3b8"
                  fillOpacity={0.7}
                />
                {/* Label Tag */}
                <rect
                  x={det.x}
                  y={Math.max(1, det.y - 4.2)}
                  width={det.label === "Repairing" ? 11.5 : 14.5}
                  height={4}
                  rx={0.7}
                  fill={boxColor}
                />
                <text
                  x={det.x + 0.8}
                  y={Math.max(3.8, det.y - 1.4)}
                  fontSize="2.1"
                  fontWeight="700"
                  fill="#ffffff"
                >
                  {det.label} {Math.round(det.confidence * 100)}%
                </text>
              </g>
            );
          })}
      </svg>

      {/* Bottom Legend Bar */}
      {!compact && (
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-xs text-white pointer-events-none">
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-medium">
              Legenda Kelas Deteksi (AI):
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-2.5 rounded-sm bg-[#1d4ed8]" />
              Repairing
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-2.5 rounded-sm bg-[#0d9488]" />
              Not Repairing
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-300 font-medium">
              Legenda Zona Workshop:
            </span>
            {zones.map((z) => (
              <span key={z.id} className="inline-flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: z.color }}
                />
                {z.code}: {z.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

