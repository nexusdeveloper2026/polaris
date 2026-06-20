"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Package, Tag, DollarSign, Percent, FileText, FolderOpen, Clock, Loader2, Receipt } from "lucide-react";
import { toast } from "sonner";
import { PERIOD_DAYS, calculateDailyPrice } from "@/lib/utils";

type Category = { id: number; name: string };

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    categoryId: "",
    type: "PRODUCT",
    price: "",
    cost: "",
    discountPercent: "",
    ivaPercent: "0",
    paymentPeriod: "ONE_TIME",
    isActive: true,
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/products/${id}`).then((r) => r.json()),
      fetch("/api/product-categories").then((r) => r.json()),
    ]).then(([product, cats]) => {
      if (product.error) { router.push("/products"); return; }
      setForm({
        name: product.name || "",
        description: product.description || "",
        categoryId: product.categoryId || "",
        type: product.type || "PRODUCT",
        price: String(product.price || 0),
        cost: String(product.cost || 0),
        discountPercent: String(product.discountPercent || 0),
        ivaPercent: String(product.ivaPercent || 0),
        paymentPeriod: product.paymentPeriod || "ONE_TIME",
        isActive: product.isActive ?? true,
      });
      setCategories(Array.isArray(cats) ? cats : []);
      setLoading(false);
    }).catch(() => { setError("Error al cargar el producto"); setLoading(false); });
  }, [id, router]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const priceNum = parseFloat(form.price) || 0;
  const costNum = parseFloat(form.cost) || 0;
  const discountPct = parseFloat(form.discountPercent) || 0;
  const ivaPct = parseFloat(form.ivaPercent) || 0;

  const discountAmount = priceNum * (discountPct / 100);
  const priceAfterDiscount = priceNum - discountAmount;
  const ivaAmount = priceAfterDiscount * (ivaPct / 100);
  const finalPrice = priceAfterDiscount + ivaAmount;
  const dailyPrice = calculateDailyPrice(finalPrice, form.paymentPeriod);
  const periodDays = PERIOD_DAYS[form.paymentPeriod] || 30;
  const profit = finalPrice - costNum;
  const profitMargin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const missing: string[] = [];
    if (!form.name.trim()) missing.push("Nombre");
    if (!form.price) missing.push("Precio");
    if (!form.cost) missing.push("Costo");

    if (missing.length > 0) {
      setError(`Los campos obligatorios están incompletos: ${missing.join(", ")}`);
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          categoryId: form.categoryId || null,
          type: form.type,
          price: priceNum,
          cost: costNum,
          discountPercent: discountPct,
          ivaPercent: ivaPct,
          paymentPeriod: form.paymentPeriod,
          isActive: form.isActive,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar");
      }

      toast.success("Producto actualizado correctamente");
      router.push(`/products/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-navy-300 dark:text-white/30" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="animate-fade-in-up flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 dark:text-white">Editar Producto / Servicio</h1>
          <p className="text-sm text-navy-400 dark:text-white/40">Modifica la información del producto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="animate-fade-in-up animate-delay-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <CardTitle>Información General</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {error && (
              <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</div>
            )}

            <div className="flex items-center gap-3 rounded-xl bg-navy-50 p-3 dark:bg-white/[0.03]">
              <span className="text-sm font-medium text-navy-700 dark:text-white/70">Estatus:</span>
              <Select name="isActive" value={String(form.isActive)} onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.value === "true" }))} className="h-9 w-32">
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-navy-700 dark:text-white/70">
                <Tag className="h-3.5 w-3.5 text-navy-400 dark:text-white/40" />
                Nombre <span className="text-red-500">*</span>
              </label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="Nombre del producto o servicio" className="h-11" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-navy-700 dark:text-white/70">
                  <FolderOpen className="h-3.5 w-3.5 text-navy-400 dark:text-white/40" />
                  Categoría
                </label>
                <Select name="categoryId" value={form.categoryId} onChange={handleChange} className="h-11">
                  <option value="">Sin categoría</option>
                  {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-navy-700 dark:text-white/70">
                  <Package className="h-3.5 w-3.5 text-navy-400 dark:text-white/40" />
                  Tipo <span className="text-red-500">*</span>
                </label>
                <Select name="type" value={form.type} onChange={handleChange} className="h-11">
                  <option value="PRODUCT">Producto</option>
                  <option value="SERVICE">Servicio</option>
                </Select>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-navy-700 dark:text-white/70">
                  <DollarSign className="h-3.5 w-3.5 text-navy-400 dark:text-white/40" />
                  Costo <span className="text-red-500">*</span>
                </label>
                <Input name="cost" type="number" step="0.01" min="0" value={form.cost} onChange={handleChange} placeholder="0.00" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-navy-700 dark:text-white/70">
                  <DollarSign className="h-3.5 w-3.5 text-navy-400 dark:text-white/40" />
                  Precio <span className="text-red-500">*</span>
                </label>
                <Input name="price" type="number" step="0.01" min="0" value={form.price} onChange={handleChange} placeholder="0.00" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-navy-700 dark:text-white/70">
                  <Percent className="h-3.5 w-3.5 text-navy-400 dark:text-white/40" />
                  Descuento (%)
                </label>
                <Input name="discountPercent" type="number" step="0.01" min="0" max="100" value={form.discountPercent} onChange={handleChange} placeholder="0" className="h-11" />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-navy-700 dark:text-white/70">
                  <Receipt className="h-3.5 w-3.5 text-navy-400 dark:text-white/40" />
                  IVA (%)
                </label>
                <Select name="ivaPercent" value={form.ivaPercent} onChange={handleChange} className="h-11">
                  <option value="0">0% (Exento)</option>
                  <option value="16">16%</option>
                  <option value="32">32%</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-navy-700 dark:text-white/70">
                  <Clock className="h-3.5 w-3.5 text-navy-400 dark:text-white/40" />
                  Período de Pago <span className="text-red-500">*</span>
                </label>
                <Select name="paymentPeriod" value={form.paymentPeriod} onChange={handleChange} className="h-11">
                  <option value="ONE_TIME">Pago Único</option>
                  <option value="DAILY">Pago Diario</option>
                  <option value="WEEKLY">Pago Semanal</option>
                  <option value="MONTHLY">Pago Mensual</option>
                  <option value="BIMONTHLY">Pago Bimensual</option>
                  <option value="QUARTERLY">Pago Trimestral</option>
                  <option value="SEMI_ANNUAL">Pago Semestral</option>
                  <option value="ANNUAL">Pago Anual</option>
                  <option value="OTHER">Otro</option>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-navy-700 dark:text-white/70">
                <FileText className="h-3.5 w-3.5 text-navy-400 dark:text-white/40" />
                Descripción
              </label>
              <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Descripción detallada del producto o servicio..." rows={4} />
            </div>
          </CardContent>
        </Card>

        {(priceNum > 0 || costNum > 0) && (
          <Card className="animate-fade-in-up animate-delay-2 mt-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-500" />
                <CardTitle>Resumen de Costos</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-navy-100 bg-navy-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <p className="text-xs font-medium text-navy-400 dark:text-white/40 uppercase tracking-wider">Precio Original</p>
                  <p className="mt-1 text-xl font-bold text-navy-900 dark:text-white">${priceNum.toFixed(2)}</p>
                </div>
                <div className="rounded-xl border border-navy-100 bg-navy-50 p-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
                  <p className="text-xs font-medium text-navy-400 dark:text-white/40 uppercase tracking-wider">Costo</p>
                  <p className="mt-1 text-xl font-bold text-navy-900 dark:text-white">${costNum.toFixed(2)}</p>
                </div>
              </div>

              {discountPct > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2 dark:bg-amber-500/10">
                  <span className="text-sm text-amber-700 dark:text-amber-400">Descuento ({discountPct}%)</span>
                  <span className="font-semibold text-amber-700 dark:text-amber-400">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              {ivaPct > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-purple-50 px-4 py-2 dark:bg-purple-500/10">
                  <span className="text-sm text-purple-700 dark:text-purple-400">IVA ({ivaPct}%)</span>
                  <span className="font-semibold text-purple-700 dark:text-purple-400">+${ivaAmount.toFixed(2)}</span>
                </div>
              )}

              {form.paymentPeriod !== "ONE_TIME" && finalPrice > 0 && (
                <div className="flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2 dark:bg-blue-500/10">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-700 dark:text-blue-400">Precio Diario (calculado a {periodDays} días)</span>
                  </div>
                  <span className="font-semibold text-blue-700 dark:text-blue-400">${dailyPrice.toFixed(2)} / día</span>
                </div>
              )}

              <div className="flex items-center justify-between rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Precio Final (con IVA {ivaPct > 0 ? `y ${discountPct}% desc.` : ""})</p>
                  <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">${finalPrice.toFixed(2)}</p>
                </div>
                {discountPct > 0 && (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">-{discountPct}%</span>
                )}
              </div>

              <div className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 ${profit >= 0 ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10" : "border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10"}`}>
                <div>
                  <p className={`text-sm font-medium ${profit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>Ganancia / Pérdida</p>
                  <p className={`text-2xl font-bold ${profit >= 0 ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"}`}>
                    {profit >= 0 ? "+" : ""}${profit.toFixed(2)}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profit >= 0 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"}`}>
                  {profitMargin.toFixed(1)}% margen
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="animate-fade-in-up animate-delay-3 mt-6 flex gap-3">
          <Button type="submit" disabled={saving} className="h-11 px-8">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()} className="h-11">Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
