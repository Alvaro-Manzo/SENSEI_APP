"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">⚙️ Configuración</h1>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de la academia</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Deporte / Disciplina</label>
              <input
                type="text"
                value={form.deporte}
                onChange={(e) => setForm((f) => ({ ...f, deporte: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="Taekwondo, MMA, Natación..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Token de Telegram</label>
              <input
                type="text"
                value={form.telegram_token}
                onChange={(e) => setForm((f) => ({ ...f, telegram_token: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="123456789:ABCdefGHI..."
              />
              <p className="text-xs text-slate-400 mt-1">Obtenlo hablando con @BotFather en Telegram</p>
            </div>

            {/* Plan info */}
            {org && (
              <div className="bg-slate-50 rounded-lg px-4 py-3 border border-slate-200">
                <p className="text-sm text-slate-600">
                  Plan actual:{" "}
                  <span className="font-semibold text-slate-900 uppercase">{org.plan}</span>
                </p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-700 transition disabled:opacity-50"
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
              {saved && <p className="text-green-600 text-sm font-medium">✅ Guardado</p>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
