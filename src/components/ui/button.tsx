import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

const variants = {
  default:
    "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:from-blue-600 hover:to-blue-700 active:scale-[0.97]",
  destructive:
    "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 hover:from-red-600 hover:to-red-700 active:scale-[0.97]",
  outline:
    "border border-navy-200 bg-white text-navy-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 active:scale-[0.97]",
  secondary:
    "bg-navy-100 text-navy-800 hover:bg-navy-200 active:scale-[0.97]",
  ghost: "text-navy-600 hover:bg-navy-50 hover:text-navy-800",
  link: "text-blue-600 underline-offset-4 hover:underline",
} as const;

const sizes = {
  sm: "h-8 px-3 text-xs rounded-lg",
  default: "h-10 px-4 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-xl",
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
          "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
