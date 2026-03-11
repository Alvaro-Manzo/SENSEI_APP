"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({
    nombre: "",
    org_nombre: "",
    deporte: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      setAuth(data.user, data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al registrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">🥋 Sensei</h1>
          <p className="text-slate-500 mt-2">Registra tu academia — <span className="text-purple-600 font-semibold">gratis para siempre</span></p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
            <span>✅ Sin tarjeta de crédito</span>
            <span>✅ 2 min para empezar</span>
            <span>✅ En español</span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tu nombre</label>
            <input
              name="nombre"
              type="text"
              value={form.nombre}
              onChange={handleChange}
              placeholder="Alvaro Manzo"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de tu academia</label>
            <input
              name="org_nombre"
              type="text"
              value={form.org_nombre}
              onChange={handleChange}
              placeholder="Team Pumma, Academia Tigre..."
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deporte / Disciplina</label>
            <select
              name="deporte"
              value={form.deporte}
              onChange={handleChange}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
              required
            >
              <option value="">Selecciona...</option>
              <option value="Taekwondo">Taekwondo</option>
              <option value="MMA">MMA</option>
              <option value="Jiu-Jitsu">Jiu-Jitsu</option>
              <option value="Boxeo">Boxeo</option>
              <option value="Natación">Natación</option>
              <option value="Fútbol">Fútbol</option>
              <option value="Gimnasia">Gimnasia</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="maestro@academia.com"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500"
              required
              minLength={8}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg py-3 font-semibold hover:opacity-90 transition disabled:opacity-50 shadow-lg shadow-purple-200"
          >
            {loading ? "Creando academia..." : "🚀 Crear mi academia gratis"}
          </button>
        </form>

        <p className="text-center text-slate-400 text-xs mt-4">
          Al registrarte aceptas los <a href="#" className="underline">Términos de uso</a> y la <a href="#" className="underline">Privacidad</a>
        </p>

        <p className="text-center text-slate-500 text-sm mt-3">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-slate-900 font-medium hover:underline">
            Iniciar sesión
          </a>
        </p>
      </div>
    </div>
  );
}
