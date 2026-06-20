"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/modal";
import { formatDate, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import {
  DollarSign, Loader2, Plus, Clock, CalendarDays,
  CreditCard, Banknote, Smartphone, Globe, CircleDollarSign,
  History, CheckCircle, X, Pencil, Trash2
} from "lucide-react";

type Payment = {
  id: number;
  paymentDate: string;
  paymentMethod: string;
  amount: number;
  renewalPeriod: string;
  renewalEndDate: string | null;
  reference: string | null;
  notes: string | null;
  creator: { name: string | null; email: string };
  createdAt: string;
};

type Assignment = {
  id: number;
  renewalPeriod: string | null;
  priceOverride: number | null;
  company: { id: number; name: string };
  branch: { id: number; name: string } | null;
  license: { id: number; name: string | null; product: { name: string } };
};

const paymentMethodLabel: Record<string, string> = {
  TRANSFERENCIA: "Transferencia",
  PAGO_MOVIL: "Pago Móvil",
  EFECTIVO: "Efectivo",
  TARJETA_CREDITO: "Tarjeta Crédito",
  TARJETA_DEBITO: "Tarjeta Débito",
  ZELLE: "Zelle",
  PAYPAL: "PayPal",
  CRYPTO: "Cripto",
  OTRO: "Otro",
};

const paymentMethodIcon: Record<string, typeof DollarSign> = {
  TRANSFERENCIA: Globe,
  PAGO_MOVIL: Smartphone,
  EFECTIVO: Banknote,
  TARJETA_CREDITO: CreditCard,
  TARJETA_DEBITO: CreditCard,
  ZELLE: Globe,
  PAYPAL: Globe,
  CRYPTO: CircleDollarSign,
  OTRO: DollarSign,
};

const renewalPeriodLabel: Record<string, string> = {
  MONTHLY: "Mensual",
  BIMONTHLY: "Bimestral",
  QUARTERLY: "Trimestral",
  SEMI_ANNUAL: "Semestral",
  ANNUAL: "Anual",
};

export function LicensePaymentButton({
  assignment,
  onPaymentRegistered,
}: {
  assignment: Assignment;
  onPaymentRegistered?: () => void;
}) {
  const refresh = onPaymentRegistered || (() => { window.location.reload(); });
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);

  const [form, setForm] = useState({
    paymentDate: new Date().toISOString().split("T")[0],
    paymentMethod: "TRANSFERENCIA",
    amount: "",
    renewalPeriod: assignment.renewalPeriod || "MONTHLY",
    renewalEndDate: "",
    reference: "",
    notes: "",
  });

  async function loadPayments() {
    setLoading(true);
    try {
      const res = await fetch(`/api/license-payments?assignmentId=${assignment.id}`);
      if (res.ok) setPayments(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function calcDefaultEndDate(period: string): string {
    const end = new Date();
    switch (period) {
      case "MONTHLY": end.setMonth(end.getMonth() + 1); break;
      case "BIMONTHLY": end.setMonth(end.getMonth() + 2); break;
      case "QUARTERLY": end.setMonth(end.getMonth() + 3); break;
      case "SEMI_ANNUAL": end.setMonth(end.getMonth() + 6); break;
      case "ANNUAL": end.setFullYear(end.getFullYear() + 1); break;
      default: end.setFullYear(end.getFullYear() + 1); break;
    }
    return end.toISOString().split("T")[0];
  }

  function openForm() {
    const period = assignment.renewalPeriod || "MONTHLY";
    setForm({
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "TRANSFERENCIA",
      amount: assignment.priceOverride != null ? String(assignment.priceOverride) : "",
      renewalPeriod: period,
      renewalEndDate: calcDefaultEndDate(period),
      reference: "",
      notes: "",
    });
    setShowForm(true);
  }

  function openEditForm(payment: Payment) {
    setEditingPayment(payment);
    setForm({
      paymentDate: payment.paymentDate.split("T")[0],
      paymentMethod: payment.paymentMethod,
      amount: String(payment.amount),
      renewalPeriod: payment.renewalPeriod,
      renewalEndDate: payment.renewalEndDate ? payment.renewalEndDate.split("T")[0] : calcDefaultEndDate(payment.renewalPeriod),
      reference: payment.reference || "",
      notes: payment.notes || "",
    });
    setShowEditForm(true);
  }

  function openHistory() {
    loadPayments();
    setShowHistory(true);
  }

  async function handleSave() {
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    if (!form.renewalEndDate) {
      toast.error("Selecciona la fecha de vigencia");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        assignmentId: assignment.id,
        paymentDate: form.paymentDate,
        paymentMethod: form.paymentMethod,
        amount: parseFloat(form.amount),
        renewalPeriod: form.renewalPeriod,
        renewalEndDate: form.renewalEndDate,
        reference: form.reference || null,
        notes: form.notes || null,
      };
      const res = await fetch("/api/license-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Pago registrado correctamente");
        setShowForm(false);
        loadPayments();
        refresh();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || `Error ${res.status}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      toast.error(`Error de conexión: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!editingPayment) return;
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error("Ingresa un monto válido");
      return;
    }
    if (!form.renewalEndDate) {
      toast.error("Selecciona la fecha de vigencia");
      return;
    }
    if (saving) return;
    setSaving(true);
    try {
      const payload = {
        paymentDate: form.paymentDate,
        paymentMethod: form.paymentMethod,
        amount: parseFloat(form.amount),
        renewalPeriod: form.renewalPeriod,
        renewalEndDate: form.renewalEndDate,
        reference: form.reference || null,
        notes: form.notes || null,
      };
      const res = await fetch(`/api/license-payments/${editingPayment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success("Pago actualizado correctamente");
        setShowEditForm(false);
        setEditingPayment(null);
        loadPayments();
        refresh();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || `Error ${res.status}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      toast.error(`Error de conexión: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deletingPayment) return;
    if (saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/license-payments/${deletingPayment.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Pago eliminado");
        setDeletingPayment(null);
        loadPayments();
        refresh();
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || `Error ${res.status}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      toast.error(`Error de conexión: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  const entityName = assignment.branch ? assignment.branch.name : assignment.company.name;

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-6 gap-1 text-xs"
          onClick={openForm}
        >
          <DollarSign className="h-3 w-3" />
          Pagar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 gap-1 text-xs"
          onClick={openHistory}
        >
          <History className="h-3 w-3" />
        </Button>
      </div>

      {showForm && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-navy-100 bg-white p-6 shadow-2xl dark:border-white/[0.06] dark:bg-navy-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white">Registrar Pago</h3>
                  <p className="text-sm text-navy-400 dark:text-white/40">{assignment.license.product.name} — {entityName}</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="text-navy-400 hover:text-navy-600 dark:text-white/40 dark:hover:text-white/60">
                <X className="h-5 w-5" />
              </button>
            </div>

            <PaymentForm
              form={form}
              setForm={setForm}
              calcDefaultEndDate={calcDefaultEndDate}
            />

            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={() => setShowForm(false)} className="h-9">
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving} className="h-9 gap-1.5">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Registrar Pago
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showEditForm && editingPayment && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => { setShowEditForm(false); setEditingPayment(null); }} />
          <div className="relative z-10 w-full max-w-md rounded-2xl border border-navy-100 bg-white p-6 shadow-2xl dark:border-white/[0.06] dark:bg-navy-800">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10">
                  <Pencil className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white">Editar Pago</h3>
                  <p className="text-sm text-navy-400 dark:text-white/40">{assignment.license.product.name} — {entityName}</p>
                </div>
              </div>
              <button onClick={() => { setShowEditForm(false); setEditingPayment(null); }} className="text-navy-400 hover:text-navy-600 dark:text-white/40 dark:hover:text-white/60">
                <X className="h-5 w-5" />
              </button>
            </div>

            <PaymentForm
              form={form}
              setForm={setForm}
              calcDefaultEndDate={calcDefaultEndDate}
            />

            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={() => { setShowEditForm(false); setEditingPayment(null); }} className="h-9">
                Cancelar
              </Button>
              <Button onClick={handleUpdate} disabled={saving} className="h-9 gap-1.5">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {deletingPayment && createPortal(
        <ConfirmDialog
          isOpen={true}
          title="Eliminar Pago"
          message={`¿Eliminar el pago de ${formatCurrency(Number(deletingPayment.amount))} registrado el ${formatDate(deletingPayment.paymentDate)}? Esta acción no se puede deshacer.`}
          confirmLabel={saving ? "Eliminando..." : "Eliminar"}
          onConfirm={handleDelete}
          onClose={() => setDeletingPayment(null)}
        />
      , document.body)}

      {showHistory && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowHistory(false)} />
          <div className="relative z-10 w-full max-w-lg max-h-[80vh] overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-2xl dark:border-white/[0.06] dark:bg-navy-800">
            <div className="flex items-center justify-between border-b border-navy-100 px-6 py-4 dark:border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-500/10">
                  <History className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-navy-900 dark:text-white">Historial de Pagos</h3>
                  <p className="text-sm text-navy-400 dark:text-white/40">{assignment.license.product.name} — {entityName}</p>
                </div>
              </div>
              <button onClick={() => setShowHistory(false)} className="text-navy-400 hover:text-navy-600 dark:text-white/40 dark:hover:text-white/60">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-4" style={{ maxHeight: "calc(80vh - 80px)" }}>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-navy-300" />
                </div>
              ) : payments.length === 0 ? (
                <div className="text-center py-8 text-navy-300 dark:text-white/30">
                  <DollarSign className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">No hay pagos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {payments.map((p) => {
                    const Icon = paymentMethodIcon[p.paymentMethod] || DollarSign;
                    return (
                      <div key={p.id} className="rounded-xl border border-navy-100 bg-navy-50/50 p-3 dark:border-white/[0.06] dark:bg-white/[0.02]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-500/10">
                              <Icon className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-navy-900 dark:text-white">
                                {formatCurrency(Number(p.amount))}
                              </p>
                              <p className="text-xs text-navy-400 dark:text-white/40">
                                {paymentMethodLabel[p.paymentMethod] || p.paymentMethod}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <Badge variant="info" className="text-xs">
                                {renewalPeriodLabel[p.renewalPeriod] || p.renewalPeriod}
                              </Badge>
                              <p className="text-xs text-navy-400 dark:text-white/40 mt-1">{formatDate(p.paymentDate)}</p>
                            </div>
                            <div className="flex items-center gap-1 ml-2">
                              <button
                                onClick={() => { openEditForm(p); }}
                                className="p-1.5 rounded-lg text-navy-400 hover:text-blue-600 hover:bg-blue-50 dark:text-white/40 dark:hover:text-blue-400 dark:hover:bg-blue-500/10 transition-colors"
                                title="Editar pago"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setDeletingPayment(p)}
                                className="p-1.5 rounded-lg text-navy-400 hover:text-red-600 hover:bg-red-50 dark:text-white/40 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors"
                                title="Eliminar pago"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                        {p.reference && (
                          <p className="mt-1 text-xs text-navy-400 dark:text-white/40">Ref: {p.reference}</p>
                        )}
                        {p.notes && (
                          <p className="mt-1 text-xs text-navy-400 dark:text-white/40">{p.notes}</p>
                        )}
                        <p className="mt-1 text-[10px] text-navy-300 dark:text-white/20">
                          Registrado por {p.creator.name || p.creator.email} · {formatDate(p.createdAt)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

function PaymentForm({
  form,
  setForm,
  calcDefaultEndDate,
}: {
  form: {
    paymentDate: string;
    paymentMethod: string;
    amount: string;
    renewalPeriod: string;
    renewalEndDate: string;
    reference: string;
    notes: string;
  };
  setForm: (fn: (prev: typeof form) => typeof form) => void;
  calcDefaultEndDate: (period: string) => string;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1">Fecha de Pago *</label>
          <Input
            type="date"
            value={form.paymentDate}
            onChange={(e) => setForm((prev) => ({ ...prev, paymentDate: e.target.value }))}
            className="h-9 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1">Monto ($) *</label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            className="h-9 text-sm"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1">Método de Pago *</label>
          <Select
            value={form.paymentMethod}
            onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))}
            className="h-9 text-sm"
          >
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="PAGO_MOVIL">Pago Móvil</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA_CREDITO">Tarjeta Crédito</option>
            <option value="TARJETA_DEBITO">Tarjeta Débito</option>
            <option value="ZELLE">Zelle</option>
            <option value="PAYPAL">PayPal</option>
            <option value="CRYPTO">Cripto</option>
            <option value="OTRO">Otro</option>
          </Select>
        </div>
        <div>
          <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1">Período Renovado *</label>
          <Select
            value={form.renewalPeriod}
            onChange={(e) => {
              const period = e.target.value;
              setForm((prev) => ({ ...prev, renewalPeriod: period, renewalEndDate: calcDefaultEndDate(period) }));
            }}
            className="h-9 text-sm"
          >
            <option value="MONTHLY">Mensual</option>
            <option value="BIMONTHLY">Bimestral</option>
            <option value="QUARTERLY">Trimestral</option>
            <option value="SEMI_ANNUAL">Semestral</option>
            <option value="ANNUAL">Anual</option>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1">Vigencia Hasta (renovación) *</label>
        <Input
          type="date"
          value={form.renewalEndDate}
          onChange={(e) => setForm((prev) => ({ ...prev, renewalEndDate: e.target.value }))}
          className="h-9 text-sm"
        />
        <p className="mt-0.5 text-[10px] text-navy-400 dark:text-white/30">La licencia será válida hasta esta fecha</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1">Referencia / N° Operación</label>
        <Input
          value={form.reference}
          onChange={(e) => setForm((prev) => ({ ...prev, reference: e.target.value }))}
          className="h-9 text-sm"
          placeholder="Opcional"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-navy-500 dark:text-white/50 mb-1">Notas</label>
        <Input
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          className="h-9 text-sm"
          placeholder="Opcional"
        />
      </div>
    </div>
  );
}
