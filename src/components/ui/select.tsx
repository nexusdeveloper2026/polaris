import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";

const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-10 w-full appearance-none rounded-xl border border-navy-200/80 bg-white py-2 pl-3 pr-10 text-sm text-navy-900 shadow-sm transition-all duration-200",
          "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          "hover:border-navy-300 hover:shadow-md",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:hover:border-white/[0.15]",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ChevronDown className="h-4 w-4 text-navy-400 dark:text-white/40" />
      </div>
    </div>
  );
});
Select.displayName = "Select";

export { Select };
