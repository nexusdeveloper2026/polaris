"use client";

import { forwardRef } from "react";

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(({ label, className, checked, onChange, ...props }, ref) => {
  const isOn = !!checked;
  return (
    <label className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <button
        type="button"
        role="switch"
        aria-checked={isOn}
        onClick={() => {
          const event = { target: { checked: !isOn } } as React.ChangeEvent<HTMLInputElement>;
          onChange?.(event);
        }}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border transition-colors ${
          isOn
            ? "border-green-600 bg-green-600 dark:border-green-500 dark:bg-green-500"
            : "border-gray-300 bg-gray-200 dark:border-white/20 dark:bg-white/10"
        }`}
      >
        <span className={`pointer-events-none inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
          isOn ? "translate-x-4" : "translate-x-0.5"
        }`} />
      </button>
      {label && <span className="text-sm text-gray-700 dark:text-white/70">{label}</span>}
      <input type="checkbox" ref={ref} checked={isOn} onChange={onChange} className="sr-only" {...props} />
    </label>
  );
});

Switch.displayName = "Switch";

export { Switch };
