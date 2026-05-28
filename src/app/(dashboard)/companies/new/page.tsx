"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Building2 } from "lucide-react";

type Company = { id: string; name: string };

export default function NewCompanyPage() {
  const router = useRouter();
  const [mainCompanies, setMainCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    taxId: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    type: "MAIN",
    parentId: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/companies?type=MAIN&limit=100")
      .then((res) => res.json())
      .then((data) => setMainCompanies(data.data || []))
      .catch(() => {});
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear empresa");
      }

      router.push("/companies");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="animate-fade-in-up flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Nueva Empresa
          </h1>
          <p className="text-sm text-navy-300">
            Registra una nueva empresa en el sistema
          </p>
        </div>
      </div>

      <Card className="animate-fade-in-up animate-delay-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            <CardTitle>Información General</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700">
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Razón social o nombre comercial"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700">RNC</label>
                <Input name="taxId" value={form.taxId} onChange={handleChange} placeholder="Número de RNC" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700">Tipo</label>
                <Select name="type" value={form.type} onChange={handleChange}>
                  <option value="MAIN">Principal</option>
                  <option value="BRANCH">Sucursal</option>
                </Select>
              </div>
            </div>

            {form.type === "BRANCH" && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700">Empresa Principal</label>
                <Select name="parentId" value={form.parentId} onChange={handleChange}>
                  <option value="">Seleccionar empresa principal</option>
                  {mainCompanies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700">Dirección</label>
              <Input name="address" value={form.address} onChange={handleChange} placeholder="Dirección física" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700">Teléfono</label>
                <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700">Email</label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700">Sitio Web</label>
              <Input name="website" value={form.website} onChange={handleChange} placeholder="https://ejemplo.com" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700">Notas</label>
              <Textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notas adicionales..." rows={3} />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Guardando..." : "Guardar Empresa"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
