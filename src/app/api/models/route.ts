import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_MODELS } from "@/lib/mock-data";
import { AIModelConfig } from "@/types/workshop";

export async function GET() {
  return NextResponse.json({
    ok: true,
    models: DEFAULT_MODELS,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<AIModelConfig>;
    if (!body.name || !body.version) {
      return NextResponse.json(
        { ok: false, error: "Field 'name' dan 'version' wajib diisi." },
        { status: 400 }
      );
    }

    const created: AIModelConfig = {
      id: `model-${Date.now()}`,
      name: body.name,
      version: body.version,
      source: body.source ?? "Afi Vision",
      classes: body.classes ?? ["Repairing", "Not Repairing"],
      confidenceThreshold: body.confidenceThreshold ?? 0.7,
      active: body.active ?? false,
      uploadedAt: new Date().toISOString(),
      workflowName: body.workflowName,
      endpointUrl: body.endpointUrl ?? "/api/events",
      fileName: body.fileName,
    };

    return NextResponse.json({
      ok: true,
      model: created,
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Format JSON tidak valid." },
      { status: 400 }
    );
  }
}

