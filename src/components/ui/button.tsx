import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const variants = {
  default:
    "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/35 hover:from-blue-600 hover:to-blue-700 active:scale-[0.97] hover:-translate-y-0.5",
  destructive:
    "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/35 hover:from-red-600 hover:to-red-700 active:scale-[0.97]",
  outline:
    "border border-navy-200 bg-white text-navy-700 shadow-sm hover:border-blue-300 hover:bg-blue-50/50 hover:text-blue-700 hover:shadow-md active:scale-[0.97] dark:border-white/[0.1] dark:bg-transparent dark:text-white/70 dark:hover:border-blue-400/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400",
  secondary:
    "bg-navy-50 text-navy-700 ring-1 ring-navy-100 hover:bg-navy-100 hover:ring-navy-200 active:scale-[0.97] dark:bg-white/[0.06] dark:text-white/70 dark:ring-white/[0.08] dark:hover:bg-white/[0.1]",
  ghost:
    "text-navy-600 hover:bg-navy-50 hover:text-navy-800 active:scale-[0.97] dark:text-white/60 dark:hover:bg-white/[0.08] dark:hover:text-white/90",
  link:
    "text-blue-600 underline-offset-4 hover:underline dark:text-blue-400",
} as const;

const sizes = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  default: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
  icon: "h-10 w-10 rounded-xl",
} as const;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
