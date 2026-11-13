"use client";

import React, { useState } from "react";
import { CheckCircle2, Cpu, Play, Upload, Webhook } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { useWorkshop } from "@/context/WorkshopContext";

export default function ModelAiPage() {
  const {
    models,
    activeModel,
    setActiveModelId,
    updateActiveThreshold,
    addModel,
    addEvent,
    zones,
  } = useWorkshop();

  const [name, setName] = useState("");
  const [version, setVersion] = useState("1.1.0");
  const [workflowName, setWorkflowName] = useState(
    "Afi Vision - Workshop Repair"
  );
  const [fileName, setFileName] = useState("");
  const [thresholdInput, setThresholdInput] = useState(0.7);
  const [webhookResult, setWebhookResult] = useState<string | null>(null);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addModel({
      name: name.trim(),
      version: version.trim() || "1.0.0",
      source: "Afi Vision",
      classes: ["Repairing", "Not Repairing"],
      confidenceThreshold: thresholdInput,
      active: true,
      workflowName: workflowName.trim(),
      endpointUrl: "/api/events",
      fileName: fileName || undefined,
    });
    setName("");
    setFileName("");
  };

  const handleTestWebhook = async () => {
    setWebhookResult("Mengirim payload test ke /api/events...");
    try {
      const targetZone = zones[0];
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cameraId: "cctv-01",
          zoneId: targetZone?.id ?? "z1",
          zoneLabel: targetZone
            ? `${targetZone.code} • ${targetZone.name}`
            : "Z1 • Repair Bay A",
          label: "Repairing",
          confidence: 0.91,
          trackId: "AFI-TEST-01",
        }),
      });
      const data = await res.json();
      if (data.ok && data.event) {
        addEvent({
          timestamp: data.event.timestamp,
          zoneId: data.event.zoneId,
          zoneLabel: data.event.zoneLabel,
          zoneColor: targetZone?.color ?? "#eab308",
          label: data.event.label,
          confidence: data.event.confidence,
          trackId: data.event.trackId,
        });
        setWebhookResult(
          `Sukses (200 OK): Event '${data.event.label}' masuk ke log Deteksi Terbaru.`
        );
      } else {
        setWebhookResult(`Gagal: ${data.error ?? "Unknown error"}`);
      }
    } catch {
      setWebhookResult("Gagal menghubungi endpoint /api/events.");
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
          <h2 className="text-base font-bold text-slate-900">
            Manajemen Model AI & Integrasi Afi Vision
          </h2>
          <p className="text-xs text-slate-500">
            Upload paket model/workflow dari vision builder (Afi Vision), atur
            Confidence Threshold, dan uji endpoint webhook{" "}
            <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
              POST /api/events
            </code>
            .
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Left: Model List & Threshold */}
          <div className="xl:col-span-7 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Cpu className="w-4 h-4 text-slate-600" />
                  <span>Daftar Model Terdaftar</span>
                </div>
                <span className="text-xs text-slate-500">
                  Aktif: <strong>{activeModel.name}</strong>
                </span>
              </div>

              <div className="space-y-2.5">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                      model.active
                        ? "border-blue-500 bg-blue-50/40"
                        : "border-slate-200 bg-slate-50/60"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {model.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200 text-slate-700">
                          v{model.version}
                        </span>
                        {model.active && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" />
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">
                        Sumber: {model.source}
                        {model.workflowName ? ` • ${model.workflowName}` : ""}
                        {model.fileName ? ` • File: ${model.fileName}` : ""}
                      </div>
                    </div>

                    {!model.active && (
                      <button
                        type="button"
                        onClick={() => setActiveModelId(model.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                      >
                        Aktifkan
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Active Threshold Slider */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Confidence Threshold Model Aktif
                  </span>
                  <span className="font-mono font-bold text-blue-700">
                    {activeModel.confidenceThreshold.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.3"
                  max="0.95"
                  step="0.05"
                  value={activeModel.confidenceThreshold}
                  onChange={(e) =>
                    updateActiveThreshold(parseFloat(e.target.value))
                  }
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <p className="text-[11px] text-slate-500">
                  Deteksi dengan confidence di bawah threshold ini otomatis
                  disembunyikan pada tampilan CCTV.
                </p>
              </div>
            </div>

            {/* Webhook Tester */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <Webhook className="w-4 h-4 text-slate-600" />
                  <span>Endpoint Integrasi Afi Vision</span>
                </div>
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  Uji Kirim Event
                </button>
              </div>
              <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto">
{`POST /api/events
Content-Type: application/json

{
  "cameraId": "cctv-01",
  "zoneId": "z1",
  "label": "Repairing",
  "confidence": 0.91,
  "trackId": "T-01"
}`}
              </pre>
              {webhookResult && (
                <div className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  {webhookResult}
                </div>
              )}
            </div>
          </div>

          {/* Right: Upload / Register Model Form */}
          <div className="xl:col-span-5 bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs space-y-4 h-fit">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Upload Model / Workflow Baru</span>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Nama Model
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: Repair Activity v1.1 (RF-DETR)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    Versi
                  </label>
                  <input
                    type="text"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">
                    Threshold Awal
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    max="0.99"
                    step="0.05"
                    value={thresholdInput}
                    onChange={(e) =>
                      setThresholdInput(parseFloat(e.target.value) || 0.7)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  Nama Workflow Afi Vision
                </label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">
                  File Model / Export Config (.onnx, .pt, .json)
                </label>
                <input
                  type="file"
                  accept=".onnx,.pt,.pth,.json,.yaml,.yml"
                  onChange={(e) =>
                    setFileName(e.target.files?.[0]?.name ?? "")
                  }
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Daftarkan & Aktifkan Model
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

