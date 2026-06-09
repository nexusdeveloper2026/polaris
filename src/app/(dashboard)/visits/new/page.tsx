"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateInput } from "@/components/ui/date-input";
import { FieldIcon, FieldGroup } from "@/components/ui/field-group";
import { ArrowLeft, Save, CalendarCheck, Building2, User, Tags, Clock, Users, FileText, Info } from "lucide-react";
import { toast } from "sonner";

type Company = { id: string; name: string };
type Contact = { id: string; name: string };
type User = { id: string; name: string | null; email: string };

const visitTypes = [
  { value: "DEMO", label: "Demo" },
  { value: "INFO_GATHERING", label: "Info" },
  { value: "INSTALLATION", label: "Instalación" },
  { value: "INDUCTION", label: "Inducción" },
  { value: "REINDUCTION", label: "Reinducción" },
  { value: "POST_SALE", label: "Post Venta" },
  { value: "TECHNICAL", label: "Técnica" },
];

export default function NewVisitPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [error, setError] = useState("");

  const selectedCompany = companies.find((c) => c.id === companyId);

  useEffect(() => {
    async function load() {
      const [compRes, userRes] = await Promise.all([
        fetch("/api/companies?isActive=true"),
        fetch("/api/users?isActive=true"),
      ]);
      if (compRes.ok) {
        const json = await compRes.json();
        setCompanies(json.data ?? json);
      }
      if (userRes.ok) setUsers(await userRes.json());
    }
    load();
  }, []);

  useEffect(() => {
    async function loadContacts() {
      if (!companyId) {
        setContacts([]);
        return;
      }
      const res = await fetch(`/api/contacts?companyId=${companyId}`);
      if (res.ok) setContacts(await res.json());
    }
    loadContacts();
  }, [companyId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const body = {
      companyId: form.get("companyId") as string,
      contactId: (form.get("contactId") as string) || null,
      type: form.get("type") as string,
      scheduledDate: form.get("scheduledDate") as string,
      assignedTo: (form.get("assignedTo") as string) || null,
      notes: (form.get("notes") as string) || null,
    };

    const res = await fetch("/api/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Visita programada correctamente");
      router.push("/visits");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Error al crear visita");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="animate-fade-in-up flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900">
            Nueva Visita
          </h1>
          <p className="text-sm text-navy-300">
            Programa una nueva visita a una empresa
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

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-fade-in-up animate-delay-1 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
                    <Building2 className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle>Empresa y Contacto</CardTitle>
                    <p className="text-xs text-navy-300 mt-0.5">
                      Selecciona la empresa y persona de contacto
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <FieldGroup>
                  <label className="text-sm font-medium text-navy-700">
                    <FieldIcon icon={Building2}>
                      Empresa <span className="text-red-500">*</span>
                    </FieldIcon>
                  </label>
                  <Select name="companyId" required value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
                    <option value="">Seleccionar empresa</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </FieldGroup>

                <FieldGroup>
                  <label className="text-sm font-medium text-navy-700">
                    <FieldIcon icon={User}>
                      Contacto
                    </FieldIcon>
                  </label>
                  <Select name="contactId">
                    <option value="">Sin contacto</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                  {contacts.length === 0 && companyId && (
                    <p className="text-xs text-navy-400 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      No hay contactos registrados para esta empresa
                    </p>
                  )}
                </FieldGroup>
              </CardContent>
            </Card>

            <Card className="animate-fade-in-up animate-delay-2 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-violet-400 to-violet-500" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
                    <CalendarCheck className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle>Detalles de la Visita</CardTitle>
                    <p className="text-xs text-navy-300 mt-0.5">
                      Tipo, fecha y asignación
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <FieldGroup>
                    <label className="text-sm font-medium text-navy-700">
                      <FieldIcon icon={Tags}>
                        Tipo <span className="text-red-500">*</span>
                      </FieldIcon>
                    </label>
                    <Select name="type" required>
                      <option value="">Seleccionar tipo</option>
                      {visitTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </Select>
                  </FieldGroup>

                  <FieldGroup>
                    <label className="text-sm font-medium text-navy-700">
                      <FieldIcon icon={Clock}>
                        Fecha Programada <span className="text-red-500">*</span>
                      </FieldIcon>
                    </label>
                    <DateInput name="scheduledDate" type="datetime-local" required />
                  </FieldGroup>
                </div>

                <FieldGroup>
                  <label className="text-sm font-medium text-navy-700">
                    <FieldIcon icon={Users}>
                      Asignado a
                    </FieldIcon>
                  </label>
                  <Select name="assignedTo">
                    <option value="">Sin asignar</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </Select>
                </FieldGroup>

                <FieldGroup>
                  <label className="text-sm font-medium text-navy-700">
                    <FieldIcon icon={FileText}>
                      Notas
                    </FieldIcon>
                  </label>
                  <Textarea name="notes" rows={3} placeholder="Notas adicionales sobre la visita..." />
                </FieldGroup>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="animate-fade-in-up animate-delay-3">
              <Card className="sticky top-24 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-amber-400 to-amber-500" />
                <CardHeader>
                  <CardTitle className="text-sm">Resumen</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="rounded-lg bg-navy-50 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-navy-400">
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium uppercase tracking-wider">Empresa</span>
                    </div>
                    <p className="font-medium text-navy-900">
                      {selectedCompany?.name || <span className="text-navy-300 font-normal">Sin seleccionar</span>}
                    </p>
                  </div>

                  <div className="rounded-lg bg-navy-50 p-3 space-y-2">
                    <div className="flex items-center gap-2 text-navy-400">
                      <CalendarCheck className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium uppercase tracking-wider">Tipo</span>
                    </div>
                    <p className="font-medium text-navy-900 text-xs">Selecciona un tipo de visita</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="animate-fade-in-up animate-delay-4 flex flex-col gap-2">
              <Button type="submit" size="lg" disabled={loading} className="w-full">
                <Save className="mr-2 h-4 w-4" />
                {loading ? "Guardando..." : "Crear Visita"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => router.push("/visits")}
                className="w-full text-navy-400"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
