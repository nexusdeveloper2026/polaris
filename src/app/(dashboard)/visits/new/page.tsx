"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  useEffect(() => {
    async function load() {
      const [compRes, userRes] = await Promise.all([
        fetch("/api/companies?isActive=true"),
        fetch("/api/users?isActive=true"),
      ]);
      if (compRes.ok) setCompanies(await compRes.json());
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
      router.push("/visits");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error || "Error al crear visita");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Nueva Visita</h1>
      <Card>
        <CardHeader>
          <CardTitle>Datos de la Visita</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Empresa</label>
              <Select
                name="companyId"
                required
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
              >
                <option value="">Seleccionar empresa</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contacto</label>
              <Select name="contactId">
                <option value="">Sin contacto</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select name="type" required>
                <option value="">Seleccionar tipo</option>
                {visitTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha Programada</label>
              <Input
                name="scheduledDate"
                type="datetime-local"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Asignado a</label>
              <Select name="assignedTo">
                <option value="">Sin asignar</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notas</label>
              <Textarea name="notes" rows={3} />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : "Crear Visita"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/visits")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
