"use client";

import type { ReactNode } from "react";
import { useApp } from "@/lib/app-context";
import { cn } from "@/lib/utils";

export function Note({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { state } = useApp();
  if (!state.showDisclaimers) return null;
  return <p className={cn("text-[12px] text-white/45", className)}>{children}</p>;
}
