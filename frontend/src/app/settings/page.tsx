"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const PLAN_INFO: Record<string, { label: string; color: string; desc: string }> = {
  free:    { label: "Gratis", color: "text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700", desc: "10 alumnos · Sin reportes · Sin exportar" },
  starter: { label: "Starter", color: "text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30", desc: "50 alumnos · Reportes · Lista de deudores" },
  pro:     { label: "Pro ⚡", color: "text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-900/30", desc: "200 alumnos · Exportar · Bot Telegram · WhatsApp alerts" },
  elite:   { label: "Elite 👑", color: "text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30", desc: "Ilimitados · Todas las funciones · API · Soporte 24/7" },
};

export default function SettingsPage() {
  const [org, setOrg] = useState<any>(null);
  const [form, setForm] = useState({ nombre: "", deporte: "", telegram_token: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/orgs/me").then((r) => {
      setOrg(r.data);
      setForm({
        nombre: r.data.nombre || "",
        deporte: r.data.deporte || "",
        telegram_token: r.data.telegram_token || "",
      });
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await api.patch("/orgs/me", form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const plan = org?.plan ?? "free";
  const planInfo = PLAN_INFO[plan] ?? PLAN_INFO.free;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar plan={plan} />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">⚙️ Configuración</h1>

        {/* Plan actual */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Plan actual</p>
              <span className={`inline-block text-sm font-bold px-3 py-1 rounded-full ${planInfo.color}`}>
                {planInfo.label}
              </span>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{planInfo.desc}</p>
            </div>
            {plan !== "elite" && (
              <Link
                href="/pricing"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition"
              >
                ⬆️ Actualizar
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre de la academia</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deporte / Disciplina</label>
              <input
                type="text"
                value={form.deporte}
                onChange={(e) => setForm((f) => ({ ...f, deporte: e.target.value }))}
                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-400"
                placeholder="Taekwondo, MMA, Natación..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
                Token de Telegram
                {plan === "free" || plan === "starter" ? (
                  <Link href="/pricing" className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-semibold">🔒 Pro+</Link>
                ) : null}
              </label>
              <input
                type="text"
                value={form.telegram_token}
                onChange={(e) => setForm((f) => ({ ...f, telegram_token: e.target.value }))}
                disabled={plan === "free" || plan === "starter"}
                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder={plan === "free" || plan === "starter" ? "Disponible en plan Pro+" : "123456789:ABCdefGHI..."}
              />
              {plan !== "free" && plan !== "starter" && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Obtenlo hablando con @BotFather en Telegram</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-900 dark:bg-slate-700 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-700 dark:hover:bg-slate-600 transition disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              {saved && <p className="text-green-600 dark:text-green-400 text-sm font-medium">✅ Guardado</p>}
            </div>
          </form>
        </div>

        {/* Zona de peligro */}
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800 p-5">
          <h3 className="font-semibold text-red-700 dark:text-red-400 mb-1 text-sm">Zona de peligro</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Estas acciones son irreversibles. Procede con cuidado.</p>
          <button
            className="text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            onClick={() => alert("Para eliminar la cuenta, contacta a soporte@senseiapp.mx")}
          >
            Eliminar academia y datos
          </button>
        </div>
      </div>
    </div>
  );
}
