import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps {
  status: "running" | "completed" | "failed";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants = {
    running: {
      bg: "bg-orange/10",
      text: "text-orange",
      border: "border-orange",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      label: "Running"
    },
    completed: {
      bg: "bg-black-5",
      text: "text-black-80",
      border: "border-black-20",
      icon: <CheckCircle2 className="h-4 w-4" />,
      label: "Completed"
    },
    failed: {
      bg: "bg-orange/10",
      text: "text-orange",
      border: "border-orange",
      icon: <XCircle className="h-4 w-4" />,
      label: "Failed"
    }
  };

  const variant = variants[status];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold shadow-sm",
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
