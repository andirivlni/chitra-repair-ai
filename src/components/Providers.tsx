"use client";

import React from "react";
import { WorkshopProvider } from "@/context/WorkshopContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <WorkshopProvider>{children}</WorkshopProvider>;
}

