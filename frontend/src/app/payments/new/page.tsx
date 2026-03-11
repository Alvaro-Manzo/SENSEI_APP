"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";

const MESES = ["","Enero","Febrero","Marzo","Abril","Mayo","Junio",
               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function NewPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const now = new Date();

  const [members, setMembers] = useState<any[]>([]);
  const [form, setForm] = useState({
    member_id: searchParams.get("member_id") || "",
    mes: now.getMonth() + 1,
    anio: now.getFullYear(),
    monto: "",
    estado: "pagado",
    metodo_pago: "efectivo",
    notas: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/members/").then((r) => setMembers(r.data));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/payments/", { ...form, monto: Number(form.monto) });
      // Si venimos del detalle del alumno, volver ahí
      const memberId = searchParams.get("member_id");
      router.push(memberId ? `/members/${memberId}` : "/payments");
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error al registrar pago");
    } finally {
      setLoading(false);
    }
  }

  const memberNombre = searchParams.get("nombre");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="text-slate-400 hover:text-slate-700 transition text-sm">← Volver</button>
          <h1 className="text-2xl font-bold text-slate-900">💵 Registrar pago</h1>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Alumno */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Alumno <span className="text-red-500">*</span>
              </label>
              {memberNombre ? (
                <div className="border border-slate-200 bg-slate-50 rounded-lg px-4 py-2.5 text-slate-900 font-medium">
                  {memberNombre}
                </div>
              ) : (
                <select
                  value={form.member_id}
                  onChange={(e) => setForm((f) => ({ ...f, member_id: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  required
                >
                  <option value="">Selecciona alumno...</option>
                  {members.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.nombre} — {m.actividad}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Mes + Año */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mes</label>
                <select
                  value={form.mes}
                  onChange={(e) => setForm((f) => ({ ...f, mes: Number(e.target.value) }))}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {MESES.slice(1).map((m, i) => (
                    <option key={i + 1} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Año</label>
                <select
                  value={form.anio}
                  onChange={(e) => setForm((f) => ({ ...f, anio: Number(e.target.value) }))}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {[2024, 2025, 2026, 2027].map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Monto */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monto (MXN) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.monto}
                onChange={(e) => setForm((f) => ({ ...f, monto: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="500"
                min="0"
                required
              />
            </div>

            {/* Estado + método */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                <select
                  value={form.estado}
                  onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="pagado">✅ Pagado</option>
                  <option value="pendiente">⏳ Pendiente</option>
                  <option value="parcial">🔸 Parcial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Método</label>
                <select
                  value={form.metodo_pago}
                  onChange={(e) => setForm((f) => ({ ...f, metodo_pago: e.target.value }))}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <option value="efectivo">💵 Efectivo</option>
                  <option value="transferencia">🏦 Transferencia</option>
                  <option value="tarjeta">💳 Tarjeta</option>
                </select>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
              <input
                type="text"
                value={form.notas}
                onChange={(e) => setForm((f) => ({ ...f, notas: e.target.value }))}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="Opcional..."
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-700 transition disabled:opacity-50"
              >
                {loading ? "Registrando..." : "Registrar pago"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="border border-slate-300 text-slate-700 px-6 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
