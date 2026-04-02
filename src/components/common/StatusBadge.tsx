import { cn } from "@/lib/utils";
import React from "react";

type StatusTone = "success" | "warning" | "info" | "danger" | "destructive" | "neutral";

const toneClasses: Record<StatusTone, string> = {
  success: "bg-success/20 text-success border-success/35",
  warning: "bg-warning/20 text-warning border-warning/35",
  info: "bg-info/20 text-info border-info/35",
  danger: "bg-destructive/20 text-destructive border-destructive/35",
  destructive: "bg-destructive/20 text-destructive border-destructive/35",
  neutral: "bg-muted text-muted-foreground border-border",
};

export const StatusBadge = ({ label, tone = "info", icon }: { label: string; tone?: StatusTone; icon?: React.ReactNode }) => (
  <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium", toneClasses[tone])}>
    {icon && <span className="mr-1 inline-flex items-center">{icon}</span>}
    {label}
  </span>
);
