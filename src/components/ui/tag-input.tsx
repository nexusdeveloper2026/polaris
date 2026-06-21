"use client";

import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

type TagInputProps = {
  options: Option[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
};

export function TagInput({ options, value, onChange, placeholder = "Seleccionar...", className }: TagInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
  const allSelected = filtered.every((o) => value.includes(o.value));

  function toggle(val: string) {
    onChange(value.includes(val) ? value.filter((v) => v !== val) : [...value, val]);
  }

  function toggleAll() {
    if (allSelected) {
      onChange(value.filter((v) => !filtered.some((o) => o.value === v)));
    } else {
      onChange([...new Set([...value, ...filtered.map((o) => o.value)])]);
    }
  }

  function remove(val: string) {
    onChange(value.filter((v) => v !== val));
  }

  return (
    <div ref={ref} className={cn("relative", open && "z-[100]", className)}>
      <div onClick={() => setOpen(!open)}
        className="flex min-h-[36px] flex-wrap items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-2.5 py-1.5 cursor-pointer transition-all focus-within:border-blue-500 focus-within:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800">
        {value.length === 0 && <span className="text-sm text-gray-400 select-none">{placeholder}</span>}
        {value.map((v) => {
          const opt = options.find((o) => o.value === v);
          return (
            <span key={v} className="inline-flex items-center gap-1 rounded-full bg-blue-500 px-2.5 py-0.5 text-xs font-medium text-white">
              {opt?.label || v}
              <button type="button" onClick={(e) => { e.stopPropagation(); remove(v); }} className="ml-0.5 rounded-full p-0.5 hover:bg-blue-600 transition-colors">
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          );
        })}
        <ChevronDown className={cn("ml-auto h-4 w-4 text-gray-400 transition-transform", open && "rotate-180")} />
      </div>

      {open && (
        <div className="absolute z-[100] mt-1 w-full overflow-hidden rounded-xl border border-gray-300 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800">
          <div className="border-b border-gray-200 p-2 dark:border-gray-600">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..."
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400" />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            <button type="button" onClick={toggleAll}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-gray-700">
              <div className={cn("flex h-4 w-4 items-center justify-center rounded border transition-colors", allSelected ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-500")}>
                {allSelected && <Check className="h-3 w-3 text-white" />}
              </div>
              Seleccionar todo
            </button>
            {filtered.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <button key={opt.value} type="button" onClick={() => toggle(opt.value)}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700">
                  <div className={cn("flex h-4 w-4 items-center justify-center rounded border transition-colors", selected ? "border-blue-500 bg-blue-500" : "border-gray-300 dark:border-gray-500")}>
                    {selected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  {opt.label}
                </button>
              );
            })}
            {filtered.length === 0 && <p className="px-2.5 py-2 text-xs text-gray-400">No hay resultados</p>}
          </div>
        </div>
      )}
    </div>
  );
}
