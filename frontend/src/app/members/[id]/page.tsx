"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";

const MESES = ["","Enero","Febrero","Marzo","Abril","Mayo","Junio",
               "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [member, setMember] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nombre: "", actividad: "", email: "", telefono: "", notas: "" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    api.get(`/members/${id}`).then((r) => {
      setMember(r.data.member);
      setPayments(r.data.payments || []);
      setForm({
        nombre: r.data.member.nombre || "",
        actividad: r.data.member.actividad || "",
        email: r.data.member.email || "",
        telefono: r.data.member.telefono || "",
        notas: r.data.member.notas || "",
      });
    }).finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    setSaving(true);
    await api.patch(`/members/${id}`, form);
    setMember((m: any) => ({ ...m, ...form }));
    setEditing(false);
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar a ${member?.nombre}? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    await api.delete(`/members/${id}`);
    router.push("/members");
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50"><Navbar />
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <a href="/members" className="text-slate-400 hover:text-slate-700 transition text-sm">← Alumnos</a>
        </div>

        {/* Tarjeta info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              {editing ? (
                <input
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  className="text-2xl font-bold border-b-2 border-slate-300 focus:outline-none focus:border-slate-600 w-full"
                />
              ) : (
                <h1 className="text-2xl font-bold text-slate-900">{member?.nombre}</h1>
              )}
              <p className="text-slate-500 text-sm mt-1">
                Inscrito: {new Date(member?.fecha_inscripcion).toLocaleDateString("es-MX")}
              </p>
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <>
                  <button onClick={() => setEditing(true)} className="border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-50 transition">
                    ✏️ Editar
                  </button>
                  <button onClick={handleDelete} disabled={deleting} className="border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-50 transition disabled:opacity-50">
                    {deleting ? "Eliminando..." : "🗑️ Eliminar"}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleSave} disabled={saving} className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-slate-700 transition disabled:opacity-50">
                    {saving ? "Guardando..." : "✅ Guardar"}
                  </button>
                  <button onClick={() => setEditing(false)} className="border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-sm hover:bg-slate-50 transition">
                    Cancelar
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Actividad", field: "actividad", placeholder: "Taekwondo, MMA..." },
              { label: "Teléfono", field: "telefono", placeholder: "555-123-4567" },
              { label: "Email", field: "email", placeholder: "alumno@email.com" },
              { label: "Notas", field: "notas", placeholder: "..." },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
                {editing ? (
                  <input
                    value={(form as any)[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    placeholder={placeholder}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  />
                ) : (
                  <p className="text-slate-900 text-sm">{(member as any)[field] || <span className="text-slate-300">—</span>}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Historial de pagos */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">💰 Historial de pagos ({payments.length})</h2>
            <a href={`/payments/new?member_id=${id}&nombre=${encodeURIComponent(member?.nombre)}`}
              className="text-sm bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition">
              + Registrar pago
            </a>
          </div>

          {payments.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">Sin pagos registrados</p>
          ) : (
            <div className="space-y-2">
              {payments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <p className="text-sm text-slate-700">{MESES[p.mes]} {p.anio}</p>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-slate-900">${p.monto?.toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.estado === "pagado" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>{p.estado}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
