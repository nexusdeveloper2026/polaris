"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type DateInputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon?: boolean;
};

const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, icon = true, type = "date", value, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const hasValue = value && String(value).length > 0;

    return (
      <div
        className={cn(
          "group relative flex h-10 w-full rounded-xl border bg-white shadow-sm transition-all duration-200",
          focused
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-navy-200 hover:border-navy-300 hover:shadow-md",
          props.disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {icon && (
          <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
        )}

        {type === "date" && !hasValue && !focused && icon && (
          <span className="pointer-events-none absolute left-9 top-1/2 -translate-y-1/2 text-sm text-navy-300">
            dd/mm/aaaa
          </span>
        )}

        <input
          ref={ref}
          type={type}
          value={value}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          className={cn(
            "flex h-full w-full rounded-xl bg-transparent py-2 text-sm text-navy-900 outline-none",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-navy-700",
            "[color-scheme:light]",
            icon ? "pl-9" : "pl-3",
            "pr-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:top-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full",
            className,
          )}
          {...props}
        />
      </div>
    );
  }
);
DateInput.displayName = "DateInput";

export { DateInput };
