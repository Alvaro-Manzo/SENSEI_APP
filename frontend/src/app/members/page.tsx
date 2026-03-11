"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface Member {
  id: string;
  nombre: string;
  actividad: string;
  fecha_inscripcion: string;
  activo: boolean;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/members/").then((r) => setMembers(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = members.filter((m) =>
    m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    m.actividad?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">👥 Alumnos ({members.length})</h1>
          <Link href="/members/new" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition">
            + Nuevo alumno
          </Link>
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre o actividad..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-4 py-3 mb-6 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />

        {loading ? (
          <p className="text-center text-slate-500">Cargando...</p>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {filtered.map((m) => (
              <Link key={m.id} href={`/members/${m.id}`} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition">
                <div>
                  <p className="font-semibold text-slate-900">{m.nombre}</p>
                  <p className="text-sm text-slate-500">{m.actividad || "Sin actividad"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">
                    Inscrito: {new Date(m.fecha_inscripcion).toLocaleDateString("es-MX")}
                  </p>
                  <span className="inline-block mt-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Activo</span>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-slate-400 py-12">No se encontraron alumnos</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
