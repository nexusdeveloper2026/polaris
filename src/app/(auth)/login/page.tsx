"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const hadDark = html.classList.contains("dark");
    html.classList.remove("dark");
    return () => {
      if (hadDark) html.classList.add("dark");
    };
  }, []);

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
    <div className="no-dark flex min-h-screen">
      {/* Left: Login form */}
      <div className="animate-slide-in-left flex w-full max-w-[480px] flex-col justify-center bg-white px-14 shadow-2xl shadow-navy-950/10">
        <div className="mb-10 animate-fade-in-up">
          <Image src="/logo/logo.png" alt="NEXUS POLARIS" width={200} height={80} className="h-auto w-auto" priority />
          <h1 className="mt-8 text-3xl font-bold tracking-tight text-navy-900">Bienvenido</h1>
          <p className="mt-2 text-sm text-navy-400">Ingresa tus credenciales para acceder al sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="animate-fade-in-up animate-delay-1 space-y-5">
          {error && (
            <div className="animate-scale-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-navy-700">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-navy-700">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-300" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-10"
                required
              />
            </div>
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
              <span className="flex items-center gap-2">
                Iniciar sesión
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        <p className="animate-fade-in animate-delay-3 mt-10 text-center text-xs text-navy-300">
          &copy; 2026 NEXUS POLARIS &mdash; Todos los derechos reservados
        </p>
      </div>

      {/* Right: Branding panel */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-navy-900">
        <Image src="/polaris.png" alt="" fill className="object-cover opacity-30" priority />
        <div className="animate-fade-in-up relative z-10 mt-64 text-center">
          <Image src="/logo/logo.png" alt="NEXUS POLARIS" width={350} height={140} className="mx-auto mb-8 h-auto w-auto" priority />
          <p className="mt-3 text-sm leading-relaxed text-blue-300/70">Platform for Operational Logistics, Analytics,<br/>and Resource Integration Systems</p>
        </div>
      </div>
    </div>
  );
}
