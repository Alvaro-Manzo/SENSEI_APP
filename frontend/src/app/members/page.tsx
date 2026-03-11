"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { canAccess } from "@/components/PlanGate";

interface Member {
  id: string;
  nombre: string;
  actividad: string;
  fecha_inscripcion: string;
  activo: boolean;
}

const PLAN_LIMITS: Record<string, number> = { free: 10, starter: 50, pro: 200, elite: 999999 };

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/members/"),
      api.get("/orgs/me"),
    ]).then(([m, o]) => {
      setMembers(m.data);
      setOrg(o.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const plan = org?.plan ?? "free";
  const limit = PLAN_LIMITS[plan] ?? 10;
  const atLimit = members.length >= limit;

  const filtered = members.filter((m) =>
    m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (m.actividad?.toLowerCase() ?? "").includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar plan={plan} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            👥 Alumnos ({members.length}{limit < 999999 ? `/${limit}` : ""})
          </h1>
          {atLimit ? (
            <Link href="/pricing" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition">
              🔒 Límite alcanzado — Actualizar
            </Link>
          ) : (
            <Link href="/members/new" className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-600 transition">
              + Nuevo alumno
            </Link>
          )}
        </div>

        {/* Barra de capacidad */}
        {limit < 999999 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>{members.length} de {limit} alumnos</span>
              <span className={atLimit ? "text-red-500 font-semibold" : ""}>{Math.round((members.length / limit) * 100)}% usado</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${atLimit ? "bg-red-500" : members.length / limit > 0.8 ? "bg-yellow-500" : "bg-green-500"}`}
                style={{ width: `${Math.min((members.length / limit) * 100, 100)}%` }}
              />
            </div>
            {atLimit && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                ⚠️ Límite alcanzado. <Link href="/pricing" className="underline">Actualiza tu plan</Link> para agregar más alumnos.
              </p>
            )}
          </div>
        )}

        <input
          type="text"
          placeholder="Buscar por nombre o actividad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-slate-400 dark:placeholder-slate-500"
        />

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
            {filtered.map((m) => (
              <Link key={m.id} href={`/members/${m.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-sm flex-shrink-0">
                    {m.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{m.nombre}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{m.actividad || "Sin actividad"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(m.fecha_inscripcion).toLocaleDateString("es-MX")}
                  </p>
                  <span className="inline-block mt-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-0.5 rounded-full">
                    Activo
                  </span>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🥋</p>
                <p className="text-slate-400 dark:text-slate-500">No se encontraron alumnos</p>
                {members.length === 0 && !atLimit && (
                  <Link href="/members/new" className="mt-4 inline-block bg-slate-900 dark:bg-slate-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
                    Agregar primer alumno
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* Export CSV — pro+ */}
        {members.length > 0 && (
          <div className="mt-4 text-right">
            {canAccess(plan, "pro") ? (
              <button
                onClick={() => {
                  const rows = [["Nombre", "Actividad", "Inscripcion"]];
                  members.forEach((m) => rows.push([m.nombre, m.actividad ?? "", new Date(m.fecha_inscripcion).toLocaleDateString("es-MX")]));
                  const csv = rows.map((r) => r.join(",")).join("\n");
                  const blob = new Blob([csv], { type: "text/csv" });
                  const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
                  a.download = "alumnos.csv"; a.click();
                }}
                className="text-sm text-green-600 dark:text-green-400 hover:underline font-medium"
              >
                ⬇️ Exportar lista CSV
              </button>
            ) : (
              <Link href="/pricing" className="text-sm text-slate-400 dark:text-slate-500 hover:text-purple-600 transition">
                🔒 Exportar CSV (Pro+)
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
