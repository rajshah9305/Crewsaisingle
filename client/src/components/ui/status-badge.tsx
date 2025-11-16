import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: "running" | "completed" | "failed";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    running: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-300",
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: "Running"
    },
    completed: {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-300",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: "Completed"
    },
    failed: {
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-300",
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: "Failed"
    }
  };

  const variant = variants[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold",
        variant.bg,
        variant.text,
        variant.border,
        className
      )}
    >
      {variant.icon}
      <span>{variant.label}</span>
    </div>
  );
}
