"use client";

import { Select } from "@/components/ui/select";
import { VENEZUELA_GEO } from "@/data/venezuela-geo";

type AddressValue = {
  state: string;
  municipality: string;
  parish: string;
  localidad: string;
  street: string;
};

type CascadingAddressProps = {
  value: AddressValue;
  onChange: (val: AddressValue) => void;
};

export function CascadingAddress({ value, onChange }: CascadingAddressProps) {
  const states = VENEZUELA_GEO;

  function update(field: keyof AddressValue, val: string) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-navy-700 dark:text-white/70">Estado <span className="text-red-500">*</span></label>
        <Select value={value.state} onChange={(e) => update("state", e.target.value)} required>
          <option value="">Seleccionar estado</option>
          {states.map((s) => (
            <option key={s.name} value={s.name}>{s.name}</option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-navy-700 dark:text-white/70">Municipio <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={value.municipality}
          onChange={(e) => update("municipality", e.target.value)}
          placeholder="Ej: Sucre, Miranda, Libertador..."
          required
          className="flex h-10 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 shadow-sm transition-all duration-200 placeholder:text-navy-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-navy-300 hover:shadow-md dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:hover:border-white/[0.15]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-navy-700 dark:text-white/70">Parroquia <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={value.parish}
          onChange={(e) => update("parish", e.target.value)}
          placeholder="Ej: Petare, El Hatillo, La Vega..."
          required
          className="flex h-10 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 shadow-sm transition-all duration-200 placeholder:text-navy-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-navy-300 hover:shadow-md dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:hover:border-white/[0.15]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-navy-700 dark:text-white/70">Sector / Barrio <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={value.localidad}
          onChange={(e) => update("localidad", e.target.value)}
          placeholder="Ej: Barrio 24 de Marzo, La Bombilla..."
          required
          className="flex h-10 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 shadow-sm transition-all duration-200 placeholder:text-navy-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-navy-300 hover:shadow-md dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:hover:border-white/[0.15]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-navy-700 dark:text-white/70">Dirección (calle, avenida, etc.) <span className="text-red-500">*</span></label>
        <input
          type="text"
          value={value.street}
          onChange={(e) => update("street", e.target.value)}
          placeholder="Calle, avenida, número, etc."
          required
          className="flex h-10 w-full rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-900 shadow-sm transition-all duration-200 placeholder:text-navy-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-navy-300 hover:shadow-md dark:border-white/[0.1] dark:bg-white/[0.05] dark:text-white dark:placeholder:text-white/30 dark:hover:border-white/[0.15]"
        />
      </div>
    </div>
  );
}

export type { AddressValue };
