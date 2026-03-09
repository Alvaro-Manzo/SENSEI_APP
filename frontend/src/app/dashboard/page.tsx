"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";

interface Stats {
  total_alumnos: number;
  pagos_este_mes: number;
  pendientes_este_mes: number;
  recaudado_este_mes: number;
}

const MESES = ["","Enero","Febrero","Marzo","Abril","Mayo","Junio",
               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [org, setOrg] = useState<any>(null);
  const [deudores, setDeudores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const mesActual = MESES[new Date().getMonth() + 1];

  useEffect(() => {
    Promise.all([
      api.get("/orgs/me/stats"),
      api.get("/orgs/me"),
      api.get("/reports/deudores"),
    ]).then(([s, o, d]) => {
      setStats(s.data);
      setOrg(o.data);
      setDeudores(d.data.deudores);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{org?.nombre}</h1>
          <p className="text-sm text-slate-500">{org?.deporte}</p>
        </div>
        <nav className="flex gap-4 text-sm font-medium text-slate-600">
          <Link href="/dashboard" className="text-slate-900">Dashboard</Link>
          <Link href="/members" className="hover:text-slate-900">Alumnos</Link>
          <Link href="/payments" className="hover:text-slate-900">Pagos</Link>
          <Link href="/reports" className="hover:text-slate-900">Reportes</Link>
          <Link href="/settings" className="hover:text-slate-900">Ajustes</Link>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">
          Resumen de {mesActual}
        </h2>

        {/* Tarjetas de stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total alumnos" value={stats?.total_alumnos ?? 0} icon="👥" color="bg-blue-50 text-blue-700" />
          <StatCard label="Pagaron" value={stats?.pagos_este_mes ?? 0} icon="✅" color="bg-green-50 text-green-700" />
          <StatCard label="Pendientes" value={stats?.pendientes_este_mes ?? 0} icon="⏳" color="bg-yellow-50 text-yellow-700" />
          <StatCard label="Recaudado" value={`$${(stats?.recaudado_este_mes ?? 0).toLocaleString()}`} icon="💰" color="bg-purple-50 text-purple-700" />
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/members/new" className="bg-slate-900 text-white rounded-xl p-5 flex items-center gap-3 hover:bg-slate-700 transition">
            <span className="text-2xl">➕</span>
            <div><p className="font-semibold">Nuevo alumno</p><p className="text-slate-300 text-sm">Registrar alumno</p></div>
          </Link>
          <Link href="/payments/new" className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-3 hover:shadow-md transition">
            <span className="text-2xl">💵</span>
            <div><p className="font-semibold text-slate-900">Registrar pago</p><p className="text-slate-500 text-sm">Pago de alumno</p></div>
          </Link>
          <Link href="/reports" className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-3 hover:shadow-md transition">
            <span className="text-2xl">📊</span>
            <div><p className="font-semibold text-slate-900">Ver reportes</p><p className="text-slate-500 text-sm">Análisis financiero</p></div>
          </Link>
        </div>

        {/* Deudores */}
        {deudores.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">⚠️ Alumnos con 2+ meses sin pagar ({deudores.length})</h3>
            <div className="space-y-2">
              {deudores.slice(0, 8).map((d: any) => (
                <div key={d.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900">{d.nombre}</p>
                    <p className="text-sm text-slate-500">{d.actividad}</p>
                  </div>
                  <span className="bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full">
                    {d.meses_sin_pagar} meses
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: any; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-xl mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}
