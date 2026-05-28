"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function CompaniesFilters({
  currentSearch,
  currentType,
}: {
  currentSearch: string;
  currentType: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/companies?${params.toString()}`);
  }

  function handleType(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set("type", value);
    } else {
      params.delete("type");
    }
    params.delete("page");
    router.push(`/companies?${params.toString()}`);
  }

  function handleClear() {
    router.push("/companies");
  }

  return (
    <div className="flex flex-wrap gap-4">
      <Input
        placeholder="Buscar por nombre, RNC, email o teléfono..."
        defaultValue={currentSearch}
        onChange={(e) => handleSearch(e.target.value)}
        className="max-w-sm"
      />
      <Select
        value={currentType}
        onChange={(e) => handleType(e.target.value)}
        className="w-44"
      >
        <option value="">Todos los tipos</option>
        <option value="MAIN">Principal</option>
        <option value="BRANCH">Sucursal</option>
      </Select>
      {(currentSearch || currentType) && (
        <Button variant="ghost" onClick={handleClear}>
          Limpiar
        </Button>
      )}
    </div>
  );
}
