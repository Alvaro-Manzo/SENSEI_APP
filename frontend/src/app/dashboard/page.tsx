"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { UpgradeBanner, canAccess } from "@/components/PlanGate";

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
  const plan = org?.plan ?? "free";

  useEffect(() => {
    Promise.all([
      api.get("/orgs/me/stats"),
      api.get("/orgs/me"),
      api.get("/reports/deudores"),
    ]).then(([s, o, d]) => {
      setStats(s.data);
      setOrg(o.data);
      setDeudores(d.data?.deudores ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );

  const cobro_esperado = (stats?.total_alumnos ?? 0) * 800;
  const porcentaje_cobro = cobro_esperado > 0
    ? Math.round(((stats?.recaudado_este_mes ?? 0) / cobro_esperado) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar plan={plan} />
      <main className="max-w-6xl mx-auto px-4 py-8">

        <UpgradeBanner plan={plan} message="Estás en el plan gratuito — limitado a 10 alumnos y sin reportes." />

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {org?.nombre ?? "Tu academia"} 👋
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Resumen de {mesActual} {new Date().getFullYear()}</p>
          </div>
          {/* Barra de cobro */}
          <div className="hidden md:block text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Cobrado este mes</p>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(porcentaje_cobro, 100)}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{porcentaje_cobro}%</span>
            </div>
          </div>
        </div>

        {/* Tarjetas de stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total alumnos" value={stats?.total_alumnos ?? 0} icon="👥" color="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
          <StatCard label="Pagaron" value={stats?.pagos_este_mes ?? 0} icon="✅" color="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" />
          <StatCard label="Pendientes" value={stats?.pendientes_este_mes ?? 0} icon="⏳" color="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" />
          <StatCard label="Recaudado" value={`$${(stats?.recaudado_este_mes ?? 0).toLocaleString()}`} icon="💰" color="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" />
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/members/new" className="bg-slate-900 dark:bg-slate-700 text-white rounded-xl p-5 flex items-center gap-3 hover:bg-slate-700 dark:hover:bg-slate-600 transition col-span-1">
            <span className="text-2xl">➕</span>
            <div><p className="font-semibold text-sm">Nuevo alumno</p><p className="text-slate-300 text-xs">Registrar</p></div>
          </Link>
          <Link href="/payments/new" className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex items-center gap-3 hover:shadow-md transition">
            <span className="text-2xl">💵</span>
            <div><p className="font-semibold text-slate-900 dark:text-white text-sm">Registrar pago</p><p className="text-slate-500 dark:text-slate-400 text-xs">Cobrar cuota</p></div>
          </Link>
          <Link href="/reports" className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex items-center gap-3 hover:shadow-md transition ${!canAccess(plan, 'starter') ? 'opacity-60' : ''}`}>
            <span className="text-2xl">{canAccess(plan, 'starter') ? "📊" : "🔒"}</span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">Ver reportes</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">{canAccess(plan, 'starter') ? "Análisis financiero" : "Plan Starter+"}</p>
            </div>
          </Link>
          <Link href="/members?filter=deudores" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 flex items-center gap-3 hover:shadow-md transition">
            <span className="text-2xl">⚠️</span>
            <div><p className="font-semibold text-red-700 dark:text-red-400 text-sm">Deudores</p><p className="text-red-500 dark:text-red-400 text-xs">{deudores.length} alumnos</p></div>
          </Link>
        </div>

        {/* Deudores */}
        {deudores.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">⚠️ Alumnos con 2+ meses sin pagar ({deudores.length})</h3>
              {!canAccess(plan, 'starter') && (
                <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-2 py-1 rounded-full font-medium">
                  Solo primeros 3 — <Link href="/pricing" className="underline">actualiza</Link>
                </span>
              )}
            </div>
            <div className="space-y-2">
              {deudores.slice(0, canAccess(plan, 'starter') ? 50 : 3).map((d: any) => (
                <div key={d.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{d.nombre}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{d.actividad}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {canAccess(plan, 'pro') && (
                      <a
                        href={`https://wa.me/?text=Hola%20${encodeURIComponent(d.nombre)}%2C%20te%20recordamos%20que%20tienes%20${d.meses_sin_pagar}%20meses%20pendientes%20de%20pago%20en%20${encodeURIComponent(org?.nombre ?? 'la academia')}.%20%F0%9F%A5%8B`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full hover:bg-green-200 transition"
                        title="Enviar WhatsApp"
                      >
                        📲 WA
                      </a>
                    )}
                    <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-medium px-3 py-1 rounded-full">
                      {d.meses_sin_pagar} meses
                    </span>
                  </div>
                </div>
              ))}
              {!canAccess(plan, 'starter') && deudores.length > 3 && (
                <div className="text-center py-4 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-slate-400 dark:text-slate-500 text-sm mb-2">+{deudores.length - 3} más deudores ocultos</p>
                  <Link href="/pricing" className="text-purple-600 font-semibold text-sm hover:underline">Ver todos con plan Starter →</Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Banner de trial si free */}
        {plan === "free" && (
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl p-6 text-white text-center">
            <p className="text-xl font-bold mb-2">¿Listo para llevar tu academia al siguiente nivel?</p>
            <p className="text-slate-300 text-sm mb-4">Con Pro gestionas hasta 200 alumnos, reportes completos, bot de Telegram, exportaciones y más.</p>
            <Link href="/pricing" className="inline-block bg-white text-slate-900 font-bold px-6 py-3 rounded-lg hover:bg-slate-100 transition">
              🚀 Ver planes y precios
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: any; icon: string; color: string }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg text-xl mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</p>
    </div>
  );
}
