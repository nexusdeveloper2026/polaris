"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Credenciales inválidas");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen">
      <div className="animate-slide-in-left flex w-full max-w-[480px] flex-col justify-center bg-white px-14 shadow-2xl">
        <div className="mb-10 animate-fade-in-up">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-navy-800 text-xl font-bold text-white shadow-lg shadow-blue-500/25">
            NP
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-navy-900">NEXUS POLARIS</h1>
          <p className="mt-1.5 text-sm text-navy-300">
            Sistema de Gestión Empresarial
          </p>
        </div>
        <form onSubmit={handleSubmit} className="animate-fade-in-up animate-delay-1 space-y-5">
          {error && (
            <div className="animate-scale-in rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-navy-700">
              Correo electrónico
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-navy-700">
              Contraseña
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              "Iniciar sesión"
            )}
          </Button>
        </form>
        <p className="animate-fade-in animate-delay-3 mt-10 text-center text-xs text-navy-200">
          &copy; 2026 NEXUS POLARIS &mdash; Todos los derechos reservados
        </p>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-blue-900">
        <div className="absolute -inset-40 animate-pulse-soft">
          <div className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute right-1/4 top-1/2 h-64 w-64 rounded-full bg-blue-400/5 blur-3xl" />
        </div>
        <div className="animate-fade-in-up relative text-center">
          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-white/10 shadow-2xl shadow-blue-500/10 backdrop-blur-xl transition-transform duration-500 hover:scale-105">
            <span className="text-5xl font-bold tracking-tight text-white">NP</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-white">NEXUS POLARIS</h2>
          <p className="mt-3 text-blue-300/80">Sistema de Gestión Empresarial</p>
          <div className="mx-auto mt-8 h-1 w-20 rounded-full bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        </div>
      </div>
    </div>
  );
}
