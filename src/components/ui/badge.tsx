import { cn } from "@/lib/utils";

const variants = {
  default: "bg-navy-50 text-navy-600 ring-1 ring-navy-100 dark:bg-white/[0.08] dark:text-white/70 dark:ring-white/[0.1]",
  primary: "bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/15 dark:text-blue-400 dark:ring-blue-500/25",
  success: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-400 dark:ring-emerald-500/25",
  warning: "bg-amber-50 text-amber-600 ring-1 ring-amber-100 dark:bg-amber-500/15 dark:text-amber-400 dark:ring-amber-500/25",
  danger: "bg-red-50 text-red-600 ring-1 ring-red-100 dark:bg-red-500/15 dark:text-red-400 dark:ring-red-500/25",
  info: "bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100 dark:bg-cyan-500/15 dark:text-cyan-400 dark:ring-cyan-500/25",
} as const;

const dotColors = {
  default: "bg-navy-400 dark:bg-white/50",
  primary: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-red-500",
  info: "bg-cyan-500",
} as const;

function Badge({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: keyof typeof variants;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-200",
        variants[variant],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />
      {children}
    </span>
  );
}

export { Badge };
