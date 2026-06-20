"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CascadingAddress, type AddressValue } from "@/components/ui/cascading-address";
import { ArrowLeft, Save, Building2 } from "lucide-react";
import { toast } from "sonner";
import { ECONOMIC_ACTIVITIES } from "@/data/economic-activities";

type User = { id: number; name: string | null; email: string; hasCommissions: boolean };
type Company = { id: number; name: string; taxIdType: string | null; taxId: string | null };

export default function NewCompanyPage() {
  const router = useRouter();
  const [mainCompanies, setMainCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    taxIdType: "V",
    taxId: "",
    phone: "",
    email: "",
    website: "",
    type: "MAIN",
    parentId: "",
    notes: "",
    salesRepId: "",
    economicActivity: "",
  });
  const [address, setAddress] = useState<AddressValue>({
    state: "",
    municipality: "",
    parish: "",
    localidad: "",
    street: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/companies?type=MAIN&limit=100").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([companyData, userData]) => {
      setMainCompanies(companyData.data || []);
      setUsers((Array.isArray(userData) ? userData : userData.data || []).filter((u: User) => u.hasCommissions));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.type === "BRANCH" && form.parentId) {
      const parent = mainCompanies.find((c) => c.id === Number(form.parentId));
      if (parent) {
        setForm((prev) => ({
          ...prev,
          taxIdType: parent.taxIdType || "V",
          taxId: parent.taxId || "",
        }));
      }
    }
  }, [form.type, form.parentId, mainCompanies]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const missing: string[] = [];
    if (!form.name.trim()) missing.push("Nombre");
    if (!form.taxId.trim()) missing.push("Nro. de Identificación");
    if (!address.state) missing.push("Estado");
    if (!address.municipality.trim()) missing.push("Municipio");
    if (!address.parish.trim()) missing.push("Parroquia");
    if (!address.localidad.trim()) missing.push("Sector / Barrio");
    if (!address.street.trim()) missing.push("Dirección");
    if (!form.phone.trim()) missing.push("Teléfono");
    if (!form.email.trim()) missing.push("Email");
    if (!form.economicActivity) missing.push("Actividad Económica");
    if (!form.salesRepId) missing.push("Representante de Ventas");
    if (form.type === "BRANCH" && !form.parentId) missing.push("Empresa Principal");

    if (missing.length > 0) {
      setError(`Los campos obligatorios están incompletos: ${missing.join(", ")}`);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          address: address.street || null,
          state: address.state || null,
          municipality: address.municipality || null,
          parish: address.parish || null,
          localidad: address.localidad || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear empresa");
      }

      toast.success("Empresa creada correctamente");
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
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">
            Nueva Empresa
          </h1>
          <p className="text-sm text-navy-400 dark:text-white/40">
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
              <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Razón social o nombre comercial"
              />
              <div className="flex items-center gap-2 pt-1">
                <label className="text-sm font-medium text-navy-700 dark:text-white/70">Tipo <span className="text-red-500">*</span></label>
                <Select name="type" value={form.type} onChange={handleChange} required>
                  <option value="MAIN">Principal</option>
                  <option value="BRANCH">Sucursal</option>
                </Select>
                {form.type === "BRANCH" && (
                  <>
                    <label className="text-sm font-medium text-navy-700 dark:text-white/70"> Empresa Principal</label>
                    <Select name="parentId" value={form.parentId} onChange={handleChange}>
                      <option value="">Seleccionar empresa principal</option>
                      {mainCompanies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700 dark:text-white/70">Tipo ID <span className="text-red-500">*</span></label>
                <Select name="taxIdType" value={form.taxIdType} onChange={handleChange} disabled={form.type === "BRANCH"} required>
                  <option value="V">V</option>
                  <option value="E">E</option>
                  <option value="P">P</option>
                  <option value="J">J</option>
                  <option value="G">G</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700 dark:text-white/70">Nro. de Identificación <span className="text-red-500">*</span></label>
                <Input name="taxId" value={form.taxId} onChange={handleChange} placeholder="Número de identificación" disabled={form.type === "BRANCH"} required />
              </div>
            </div>
            {form.type === "BRANCH" && (
              <div className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                El Tipo ID y Nro. de Identificación se heredan de la empresa principal. Para modificarlos, edite la empresa principal.
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">Ubicación</label>
              <CascadingAddress value={address} onChange={setAddress} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700 dark:text-white/70">Teléfono <span className="text-red-500">*</span></label>
                <Input name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-navy-700 dark:text-white/70">Email <span className="text-red-500">*</span></label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="correo@ejemplo.com" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">Sitio Web</label>
              <Input name="website" value={form.website} onChange={handleChange} placeholder="https://ejemplo.com" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">Actividad Económica <span className="text-red-500">*</span></label>
              <Select name="economicActivity" value={form.economicActivity} onChange={handleChange} required>
                <option value="">Seleccionar actividad</option>
                {ECONOMIC_ACTIVITIES.map((a) => (
                  <option key={a.code} value={a.code}>{a.code} - {a.name}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">Notas</label>
              <Textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notas adicionales..." rows={3} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-navy-700 dark:text-white/70">Representante de Ventas <span className="text-red-500">*</span></label>
              <Select name="salesRepId" value={form.salesRepId} onChange={handleChange} required>
                <option value="">Seleccionar representante</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.name || u.email}</option>
                ))}
              </Select>
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
