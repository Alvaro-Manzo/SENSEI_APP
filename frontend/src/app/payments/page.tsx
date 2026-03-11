"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";
import Link from "next/link";

const MESES = ["","Enero","Febrero","Marzo","Abril","Mayo","Junio",
               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

interface Payment {
  id: string;
  member_id: string;
  member_nombre?: string;
  mes: number;
  anio: number;
  monto: number;
  estado: string;
  metodo_pago: string;
  fecha_pago: string;
}

export default function PaymentsPage() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [anio, setAnio] = useState(now.getFullYear());
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const plan = org?.plan ?? "free";

  useEffect(() => {
    api.get("/orgs/me").then((r) => setOrg(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/payments/?mes=${mes}&anio=${anio}`),
      api.get(`/payments/summary/month?mes=${mes}&anio=${anio}`),
    ]).then(([p, s]) => {
      setPayments(p.data);
      setSummary(s.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [mes, anio]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar plan={plan} />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">💵 Pagos</h1>
          <div className="flex gap-2">
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              {MESES.slice(1).map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <Link href="/payments/new" className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-600 transition">
              + Registrar pago
            </Link>
          </div>
        </div>

        {/* Resumen del mes */}
        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{summary.pagados ?? 0}</p>
              <p className="text-sm text-green-600 dark:text-green-500">Pagaron</p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{summary.pendientes ?? 0}</p>
              <p className="text-sm text-yellow-600 dark:text-yellow-500">Pendientes</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">${(summary.recaudado ?? 0).toLocaleString()}</p>
              <p className="text-sm text-purple-600 dark:text-purple-500">Recaudado</p>
            </div>
          </div>
        )}

        {/* Tabla de pagos */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Alumno</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Mes</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Monto</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Método</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600 dark:text-slate-300">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Cargando...</td></tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <p className="text-3xl mb-2">💵</p>
                    <p className="text-slate-400 dark:text-slate-500">Sin pagos en {MESES[mes]} {anio}</p>
                  </td>
                </tr>
              ) : payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{p.member_nombre || "—"}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{MESES[p.mes]} {p.anio}</td>
                  <td className="px-5 py-3 text-slate-900 dark:text-white font-semibold">${(p.monto ?? 0).toLocaleString()}</td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400 capitalize">{p.metodo_pago || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.estado === "pagado"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    }`}>
                      {p.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
