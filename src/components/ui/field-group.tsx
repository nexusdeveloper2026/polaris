import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function FieldIcon({ icon: Icon, children }: { icon: React.ComponentType<{ className?: string }>; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 text-sm font-medium text-navy-700 dark:text-white/70">
      <Icon className="h-4 w-4 text-navy-400 dark:text-white/40" />
      {children}
    </span>
  );
}

export function FieldGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {children}
    </div>
  );
}
