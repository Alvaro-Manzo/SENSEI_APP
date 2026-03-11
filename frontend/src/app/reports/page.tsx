"use client";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import PlanGate, { UpgradeBanner, canAccess } from "@/components/PlanGate";

const MESES_CORTO = ["","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export default function ReportsPage() {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [annual, setAnnual] = useState<any[]>([]);
  const [deudores, setDeudores] = useState<any[]>([]);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const plan = org?.plan ?? "free";

  useEffect(() => {
    api.get("/orgs/me").then((r) => setOrg(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/reports/annual?anio=${anio}`),
      api.get("/reports/deudores?meses_minimo=2"),
    ]).then(([a, d]) => {
      const data = (a.data.meses || []).map((m: any) => ({
        mes: MESES_CORTO[m.mes],
        Pagados: m.pagados,
        Pendientes: m.pendientes,
        Recaudado: m.recaudado,
      }));
      setAnnual(data);
      setDeudores(d.data.deudores || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [anio]);

  const totalRecaudado = annual.reduce((s, m) => s + (m.Recaudado || 0), 0);
  const totalPagados = annual.reduce((s, m) => s + (m.Pagados || 0), 0);

  function exportCSV() {
    if (!canAccess(plan, "pro")) return;
    const rows = [["Mes", "Pagados", "Pendientes", "Recaudado ($)"]];
    annual.forEach((m) => rows.push([m.mes, m.Pagados, m.Pendientes, m.Recaudado]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_${anio}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportDeudoresCSV() {
    if (!canAccess(plan, "pro")) return;
    const rows = [["Nombre", "Actividad", "Meses sin pagar"]];
    deudores.forEach((d) => rows.push([d.nombre, d.actividad, d.meses_sin_pagar]));
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `deudores_${anio}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar plan={plan} />
      <div className="max-w-6xl mx-auto px-4 py-8">

        <UpgradeBanner plan={plan} message="Los reportes son exclusivos del plan Starter y superior." />

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">📈 Reportes</h1>
          <div className="flex gap-2">
            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2 text-sm focus:outline-none"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            {canAccess(plan, "pro") ? (
              <button
                onClick={exportCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
              >
                ⬇️ Exportar CSV
              </button>
            ) : (
              <a href="/pricing" className="bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5">
                🔒 Exportar CSV
              </a>
            )}
          </div>
        </div>

        <PlanGate required="starter" current={plan} feature="Reportes mensuales y anuales" blur={false}>
          {/* Resumen anual */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total recaudado {anio}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">${totalRecaudado.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Pagos registrados {anio}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{totalPagados}</p>
            </div>
          </div>

          {/* Gráfica pagados vs pendientes */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
            <h2 className="font-bold text-slate-900 dark:text-white mb-6">Pagos por mes — {anio}</h2>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-400">Cargando...</div>
            ) : annual.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <p className="text-4xl mb-3">📊</p>
                <p>Sin datos para {anio}</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={annual} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", background: "#1e293b", color: "#fff" }}
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
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-8">
            <h2 className="font-bold text-slate-900 dark:text-white mb-6">💰 Recaudación mensual — {anio}</h2>
            {!loading && annual.length > 0 && (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={annual}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "12px", background: "#1e293b", color: "#fff" }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Recaudado"]}
                  />
                  <Bar dataKey="Recaudado" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Tabla deudores */}
          {deudores.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-slate-900 dark:text-white">⚠️ Deudores — 2+ meses sin pagar ({deudores.length})</h2>
                {canAccess(plan, "pro") && (
                  <button onClick={exportDeudoresCSV} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-lg font-semibold hover:bg-green-200 transition">
                    ⬇️ Exportar lista
                  </button>
                )}
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {deudores.map((d: any) => (
                  <a key={d.id} href={`/members/${d.id}`}
                    className="flex items-center justify-between py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition px-1 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{d.nombre}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{d.actividad ?? "Sin actividad"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {canAccess(plan, "pro") && org && (
                        <a
                          href={`https://wa.me/?text=Hola%20${encodeURIComponent(d.nombre)}%2C%20te%20recordamos%20que%20tienes%20${d.meses_sin_pagar}%20mes(es)%20pendientes%20en%20${encodeURIComponent(org.nombre)}.%20%F0%9F%A5%8B`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full hover:bg-green-200 transition"
                        >
                          📲 WA
                        </a>
                      )}
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-semibold px-3 py-1 rounded-full">
                        {d.meses_sin_pagar} meses
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </PlanGate>
      </div>
    </div>
  );
}
