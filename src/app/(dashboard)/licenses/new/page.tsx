"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import { FieldIcon, FieldGroup } from "@/components/ui/field-group";
import {
  ArrowLeft, Save, Building2, Package, CalendarDays, Users, FileText,
  KeyRound, DollarSign, Clock, Gift, Percent, Wrench, GraduationCap, Info, Hash, Tag, Store
} from "lucide-react";
import { toast } from "sonner";

type Company = { id: string; name: string };
type Branch = { id: string; name: string };
type Product = { id: string; name: string };

export default function NewLicensePage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [companyId, setCompanyId] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState("");
  const [productId, setProductId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxUsers, setMaxUsers] = useState("1");
  const [notes, setNotes] = useState("");

  const [licenseId, setLicenseId] = useState("");
  const [name, setName] = useState("");
  const [costUSD, setCostUSD] = useState("");
  const [supportHours, setSupportHours] = useState("0");
  const [freeDays, setFreeDays] = useState("0");
  const [discountPercent, setDiscountPercent] = useState("");
  const [allowedTechnicalVisits, setAllowedTechnicalVisits] = useState("0");
  const [additionalTechHourValue, setAdditionalTechHourValue] = useState("");
  const [additionalTrainingPerPerson, setAdditionalTrainingPerPerson] = useState("");

  useEffect(() => {
    async function load() {
      const [compRes, prodRes] = await Promise.all([
        fetch("/api/companies?limit=200"),
        fetch("/api/products"),
      ]);
      if (compRes.ok) {
        const json = await compRes.json();
        setCompanies(json.data ?? json);
      }
      if (prodRes.ok) setProducts(await prodRes.json());
    }
    load();
  }, []);

  useEffect(() => {
    setBranchId("");
    if (!companyId) { setBranches([]); return; }
    fetch(`/api/companies/${companyId}/branches`)
      .then((r) => r.ok ? r.json() : [])
      .then(setBranches)
      .catch(() => setBranches([]));
  }, [companyId]);

  const selectedCompany = companies.find((c) => c.id === companyId);
  const selectedBranch = branches.find((b) => b.id === branchId);
  const selectedProduct = products.find((p) => p.id === productId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/licenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId, branchId: branchId || null, productId, startDate, endDate, maxUsers, notes,
        licenseId: licenseId || null,
        name: name || null,
        costUSD: costUSD || null,
        supportHours,
        freeDays,
        discountPercent: discountPercent || null,
        allowedTechnicalVisits,
        additionalTechHourValue: additionalTechHourValue || null,
        additionalTrainingPerPerson: additionalTrainingPerPerson || null,
      }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Licencia creada correctamente");
      router.push("/licenses");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Error al crear licencia");
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="animate-fade-in-up flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Nueva Licencia
          </h1>
          <p className="text-sm text-navy-300">
            Registra una nueva licencia con todos sus detalles comerciales y técnicos
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="animate-scale-in flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            <Info className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            {/* Card 1: Identificación */}
            <Card className="animate-fade-in-up animate-delay-1 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                    <KeyRound className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Identificación</CardTitle>
                    <p className="text-xs text-navy-300 mt-0.5">
                      Identificador único, nombre y asignación
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldGroup>
                    <label className="text-sm font-medium text-navy-700">
                      <FieldIcon icon={Hash}>ID de Licencia</FieldIcon>
                    </label>
                    <Input
                      value={licenseId}
                      onChange={(e) => setLicenseId(e.target.value)}
                      placeholder="Ej: LIC-001"
                    />
                    <p className="text-xs text-navy-400 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Código interno opcional para identificar la licencia
                    </p>
                  </FieldGroup>
                  <FieldGroup>
                    <label className="text-sm font-medium text-navy-700">
                      <FieldIcon icon={Tag}>Nombre de Licencia</FieldIcon>
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Licencia Premium Anual"
                    />
                  </FieldGroup>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldGroup>
                    <label className="text-sm font-medium text-navy-700">
                      <FieldIcon icon={Building2}>Empresa <span className="text-red-500">*</span></FieldIcon>
                    </label>
                    <Select
                      value={companyId}
                      onChange={(e) => setCompanyId(e.target.value)}
                      required
                    >
                      <option value="">Seleccionar empresa</option>
                      {companies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </FieldGroup>
                  {branches.length > 0 && (
                    <FieldGroup>
                      <label className="text-sm font-medium text-navy-700">
                        <FieldIcon icon={Store}>Sucursal</FieldIcon>
                      </label>
                      <Select
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                      >
                        <option value="">Seleccionar sucursal</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </Select>
                    </FieldGroup>
                  )}
                </div>
                <FieldGroup>
                  <label className="text-sm font-medium text-navy-700">
                    <FieldIcon icon={Package}>Producto <span className="text-red-500">*</span></FieldIcon>
                  </label>
                  <Select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar producto</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </Select>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Card 2: Período y Usuarios */}
            <Card className="animate-fade-in-up animate-delay-2 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-400 to-emerald-500" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <CardTitle>Vigencia y Usuarios</CardTitle>
                    <p className="text-xs text-navy-300 mt-0.5">
                      Período de validez y límite de usuarios
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldGroup>
                    <label className="text-sm font-medium text-navy-700">
                      <FieldIcon icon={CalendarDays}>Fecha de Inicio <span className="text-red-500">*</span></FieldIcon>
                    </label>
                    <DateInput value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                  </FieldGroup>
                  <FieldGroup>
                    <label className="text-sm font-medium text-navy-700">
                      <FieldIcon icon={CalendarDays}>Fecha de Vencimiento <span className="text-red-500">*</span></FieldIcon>
                    </label>
                    <DateInput value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                  </FieldGroup>
                </div>

                {startDate && endDate && new Date(endDate) < new Date(startDate) && (
                  <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    La fecha de vencimiento es anterior a la fecha de inicio
                  </div>
                )}

                <FieldGroup>
                  <label className="text-sm font-medium text-navy-700">
                    <FieldIcon icon={Users}>Máximo de Usuarios</FieldIcon>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(e.target.value)}
                    className="max-w-xs"
                  />
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Card 3: Costos */}
            <Card className="animate-fade-in-up animate-delay-3 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle>Costos y Descuentos</CardTitle>
                    <p className="text-xs text-navy-300 mt-0.5">
                      Valor de la licencia, descuentos y cargos adicionales
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldGroup>
                    <label className="text-sm font-medium text-navy-700">
                      <FieldIcon icon={DollarSign}>Costo en USD</FieldIcon>
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-navy-400">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={costUSD}
                        onChange={(e) => setCostUSD(e.target.value)}
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                  </FieldGroup>
                  <FieldGroup>
                    <label className="text-sm font-medium text-navy-700">
                      <FieldIcon icon={Percent}>Descuento (%)</FieldIcon>
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={discountPercent}
                        onChange={(e) => setDiscountPercent(e.target.value)}
                        placeholder="0"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-navy-400">%</span>
                    </div>
                    {costUSD && discountPercent && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <Percent className="h-3 w-3" />
                        Total con descuento: ${(parseFloat(costUSD) * (1 - parseFloat(discountPercent || "0") / 100)).toFixed(2)} USD
                      </p>
                    )}
                  </FieldGroup>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldGroup>
                    <label className="text-sm font-medium text-navy-700">
                      <FieldIcon icon={Clock}>Horas de Soporte</FieldIcon>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={supportHours}
                      onChange={(e) => setSupportHours(e.target.value)}
                    />
                    <p className="text-xs text-navy-400">Horas de soporte técnico incluidas</p>
                  </FieldGroup>
                  <FieldGroup>
                    <label className="text-sm font-medium text-navy-700">
                      <FieldIcon icon={Gift}>Días Gratis</FieldIcon>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={freeDays}
                      onChange={(e) => setFreeDays(e.target.value)}
                    />
                    <p className="text-xs text-navy-400">Período de prueba o cortesía en días</p>
                  </FieldGroup>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Servicios Técnicos */}
            <Card className="animate-fade-in-up animate-delay-4 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-violet-400 to-violet-500" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                    <Wrench className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle>Servicios Técnicos y Capacitación</CardTitle>
                    <p className="text-xs text-navy-300 mt-0.5">
                      Visitas técnicas, horas adicionales y capacitación
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldGroup>
                    <label className="text-sm font-medium text-navy-700">
                      <FieldIcon icon={Wrench}>Visitas Técnicas Permitidas</FieldIcon>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={allowedTechnicalVisits}
                      onChange={(e) => setAllowedTechnicalVisits(e.target.value)}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <label className="text-sm font-medium text-navy-700">
                      <FieldIcon icon={Wrench}>Valor Hora Técnica Adicional</FieldIcon>
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-navy-400">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={additionalTechHourValue}
                        onChange={(e) => setAdditionalTechHourValue(e.target.value)}
                        className="pl-7"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-xs text-navy-400">Costo por hora técnica adicional (USD)</p>
                  </FieldGroup>
                </div>

                <FieldGroup>
                  <label className="text-sm font-medium text-navy-700">
                    <FieldIcon icon={GraduationCap}>Valor Capacitación Adicional por Persona</FieldIcon>
                  </label>
                  <div className="relative max-w-xs">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-navy-400">$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={additionalTrainingPerPerson}
                      onChange={(e) => setAdditionalTrainingPerPerson(e.target.value)}
                      className="pl-7"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-navy-400">Costo por persona adicional a capacitar (USD)</p>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* Card 5: Notas */}
            <Card className="animate-fade-in-up animate-delay-5 overflow-hidden">
              <CardContent className="pt-6">
                <FieldGroup>
                  <label className="text-sm font-medium text-navy-700">
                    <FieldIcon icon={FileText}>Notas</FieldIcon>
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notas adicionales sobre la licencia..."
                    rows={3}
                  />
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar: Resumen */}
          <div className="space-y-6">
            <div className="animate-fade-in-up animate-delay-3">
              <Card className="sticky top-24 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-500" />
                <CardHeader>
                  <CardTitle className="text-sm">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-lg bg-navy-50 p-3 space-y-1.5">
                    <span className="text-xs font-medium uppercase tracking-wider text-navy-400">Identificación</span>
                    <p className="font-medium text-navy-900">{name || <span className="text-navy-300 font-normal">Sin nombre</span>}</p>
                    <p className="text-xs text-navy-400">{licenseId || "ID no asignado"}</p>
                  </div>

                  <div className="rounded-lg bg-navy-50 p-3 space-y-1.5">
                    <span className="text-xs font-medium uppercase tracking-wider text-navy-400">Asignación</span>
                    <p className="text-xs text-navy-700">{selectedCompany?.name || "Empresa: —"}</p>
                    {selectedBranch && <p className="text-xs text-navy-500">Sucursal: {selectedBranch.name}</p>}
                    <p className="text-xs text-navy-700">{selectedProduct?.name || "Producto: —"}</p>
                  </div>

                  <div className="rounded-lg bg-navy-50 p-3 space-y-1.5">
                    <span className="text-xs font-medium uppercase tracking-wider text-navy-400">Económico</span>
                    <p className="text-xs text-navy-700">Costo: {costUSD ? `$${costUSD} USD` : "—"}</p>
                    {discountPercent && <p className="text-xs text-emerald-600">Dto: {discountPercent}%</p>}
                    <p className="text-xs text-navy-700">Soporte: {supportHours}h</p>
                  </div>

                  <div className="rounded-lg bg-navy-50 p-3 space-y-1.5">
                    <span className="text-xs font-medium uppercase tracking-wider text-navy-400">Técnico</span>
                    <p className="text-xs text-navy-700">Visitas: {allowedTechnicalVisits}</p>
                    <p className="text-xs text-navy-700">
                      Hora adicional: {additionalTechHourValue ? `$${additionalTechHourValue}/h` : "—"}
                    </p>
                    <p className="text-xs text-navy-700">
                      Capacitación: {additionalTrainingPerPerson ? `$${additionalTrainingPerPerson}/pers` : "—"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="animate-fade-in-up animate-delay-5 flex flex-col gap-2">
              <Button type="submit" size="lg" disabled={loading} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Guardando..." : "Guardar Licencia"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => router.push("/licenses")} className="w-full text-navy-400">
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
