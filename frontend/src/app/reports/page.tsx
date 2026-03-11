"use client";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";

const MESES_CORTO = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export default function ReportsPage() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [annual, setAnnual] = useState<any[]>([]);
  const [deudores, setDeudores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/reports/annual?anio=${anio}`),
      api.get("/reports/deudores?meses_minimo=2"),
    ]).then(([a, d]) => {
      // Transformar para recharts: [{mes: "Ene", pagados: 5, recaudado: 2500}, ...]
      const data = (a.data.meses || []).map((m: any) => ({
        mes: MESES_CORTO[m.mes],
        Pagados: m.pagados,
        Pendientes: m.pendientes,
        Recaudado: m.recaudado,
      }));
      setAnnual(data);
      setDeudores(d.data.deudores || []);
    }).finally(() => setLoading(false));
  }, [anio]);

  const totalRecaudado = annual.reduce((s, m) => s + (m.Recaudado || 0), 0);
  const totalPagados = annual.reduce((s, m) => s + (m.Pagados || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900">📈 Reportes</h1>
          <select
            value={anio}
            onChange={(e) => setAnio(Number(e.target.value))}
            className="border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Resumen anual */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500 mb-1">Total recaudado {anio}</p>
            <p className="text-3xl font-bold text-slate-900">${totalRecaudado.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500 mb-1">Pagos registrados {anio}</p>
            <p className="text-3xl font-bold text-slate-900">{totalPagados}</p>
          </div>
        </div>

        {/* Gráfica de barras */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="font-bold text-slate-900 mb-6">Pagos por mes — {anio}</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400">Cargando...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={annual} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  formatter={(val: any, name: string) =>
                    name === "Recaudado" ? [`$${Number(val).toLocaleString()}`, name] : [val, name]
                  }
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="Pagados" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pendientes" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Gráfica de recaudación */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="font-bold text-slate-900 mb-6">💰 Recaudación mensual — {anio}</h2>
          {!loading && (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={annual}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px" }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Recaudado"]}
                />
                <Bar dataKey="Recaudado" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tabla deudores */}
        {deudores.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="font-bold text-slate-900 mb-4">⚠️ Deudores — 2+ meses sin pagar ({deudores.length})</h2>
            <div className="divide-y divide-slate-100">
              {deudores.map((d: any) => (
                <a key={d.id} href={`/members/${d.id}`}
                  className="flex items-center justify-between py-3 hover:bg-slate-50 transition px-1 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">{d.nombre}</p>
                    <p className="text-sm text-slate-500">{d.actividad}</p>
                  </div>
                  <span className="bg-red-100 text-red-700 text-sm font-semibold px-3 py-1 rounded-full">
                    {d.meses_sin_pagar} meses
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
