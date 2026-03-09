"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/payments/?mes=${mes}&anio=${anio}`),
      api.get(`/payments/summary/month?mes=${mes}&anio=${anio}`),
    ]).then(([p, s]) => {
      setPayments(p.data);
      setSummary(s.data);
    }).finally(() => setLoading(false));
  }, [mes, anio]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">💵 Pagos</h1>
          <div className="flex gap-2">
            <select
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              {MESES.slice(1).map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              value={anio}
              onChange={(e) => setAnio(Number(e.target.value))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen del mes */}
        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{summary.pagados}</p>
              <p className="text-sm text-green-600">Pagaron</p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">{summary.pendientes}</p>
              <p className="text-sm text-yellow-600">Pendientes</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-purple-700">${summary.recaudado?.toLocaleString()}</p>
              <p className="text-sm text-purple-600">Recaudado</p>
            </div>
          </div>
        )}

        {/* Tabla de pagos */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Alumno</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Mes</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Monto</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Método</th>
                <th className="text-left px-5 py-3 font-semibold text-slate-600">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Cargando...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-slate-400">Sin pagos registrados</td></tr>
              ) : payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3 font-medium text-slate-900">{p.member_nombre || p.member_id}</td>
                  <td className="px-5 py-3 text-slate-600">{MESES[p.mes]} {p.anio}</td>
                  <td className="px-5 py-3 text-slate-900">${p.monto?.toLocaleString()}</td>
                  <td className="px-5 py-3 text-slate-500 capitalize">{p.metodo_pago || "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.estado === "pagado" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
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
