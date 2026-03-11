"use client";
import Link from "next/link";
import { useState } from "react";

const PLANS = [
  {
    id: "free",
    name: "Gratis",
    price: 0,
    priceMXN: "Gratis",
    period: "para siempre",
    desc: "Para probar el sistema",
    color: "border-slate-200 dark:border-slate-700",
    badge: null,
    cta: "Comenzar gratis",
    ctaStyle: "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600",
    features: [
      { ok: true,  text: "Hasta 10 alumnos" },
      { ok: true,  text: "Registro de pagos básico" },
      { ok: true,  text: "Dashboard básico" },
      { ok: false, text: "Reportes mensuales/anuales" },
      { ok: false, text: "Exportar Excel / CSV" },
      { ok: false, text: "Bot de Telegram" },
      { ok: false, text: "Lista completa de deudores" },
      { ok: false, text: "Recordatorios de pago" },
      { ok: false, text: "Multi-usuario (instructores)" },
      { ok: false, text: "Soporte prioritario" },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 299,
    priceMXN: "$299",
    period: "/ mes",
    desc: "Para academias pequeñas",
    color: "border-blue-200 dark:border-blue-700",
    badge: null,
    cta: "Empezar con Starter",
    ctaStyle: "bg-blue-600 text-white hover:bg-blue-700",
    features: [
      { ok: true,  text: "Hasta 50 alumnos" },
      { ok: true,  text: "Registro de pagos completo" },
      { ok: true,  text: "Dashboard avanzado" },
      { ok: true,  text: "Reportes mensuales/anuales" },
      { ok: true,  text: "Lista completa de deudores" },
      { ok: false, text: "Exportar Excel / CSV" },
      { ok: false, text: "Bot de Telegram" },
      { ok: false, text: "Recordatorios de pago" },
      { ok: false, text: "Multi-usuario (instructores)" },
      { ok: false, text: "Soporte prioritario" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 599,
    priceMXN: "$599",
    period: "/ mes",
    desc: "El favorito de los sensei 🥋",
    color: "border-purple-500 dark:border-purple-500",
    badge: "⭐ MÁS POPULAR",
    cta: "🚀 Activar Pro ahora",
    ctaStyle: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:opacity-90 shadow-lg shadow-purple-200 dark:shadow-purple-900",
    features: [
      { ok: true,  text: "Hasta 200 alumnos" },
      { ok: true,  text: "Todo lo de Starter ✓" },
      { ok: true,  text: "Exportar Excel / CSV" },
      { ok: true,  text: "Bot de Telegram integrado" },
      { ok: true,  text: "Recordatorios automáticos" },
      { ok: true,  text: "Links de cobro WhatsApp" },
      { ok: true,  text: "Multi-usuario (2 instructores)" },
      { ok: true,  text: "Notas y seguimiento por alumno" },
      { ok: false, text: "Alumnos ilimitados" },
      { ok: false, text: "API y acceso developer" },
    ],
  },
  {
    id: "elite",
    name: "Elite",
    price: 999,
    priceMXN: "$999",
    period: "/ mes",
    desc: "Para academias profesionales",
    color: "border-amber-400 dark:border-amber-500",
    badge: "👑 MÁXIMO PODER",
    cta: "Contactar para Elite",
    ctaStyle: "bg-amber-500 text-white hover:bg-amber-600",
    features: [
      { ok: true,  text: "Alumnos ILIMITADOS" },
      { ok: true,  text: "Todo lo de Pro ✓" },
      { ok: true,  text: "Instructores ilimitados" },
      { ok: true,  text: "API pública + webhooks" },
      { ok: true,  text: "Página web de tu academia" },
      { ok: true,  text: "Facturación electrónica (CFDI)" },
      { ok: true,  text: "Onboarding personalizado" },
      { ok: true,  text: "Soporte 24/7 WhatsApp directo" },
      { ok: true,  text: "Migración de datos incluida" },
      { ok: true,  text: "SLA garantizado 99.9%" },
    ],
  },
];

const TESTIMONIALS = [
  { name: "Carlos M.", academia: "Dojo Guerrero, CDMX", text: "Antes cobraba con papel y lápiz. Con Sensei Pro cobro más rápido y sé exactamente quién me debe. Me pagó solo en el primer mes.", stars: 5 },
  { name: "Lucía R.", academia: "Gym Tigre, Monterrey", text: "Mis alumnos reciben el recordatorio por WhatsApp automático. Ya no tengo que ir a cobrar. 100% recomendado.", stars: 5 },
  { name: "Javier T.", academia: "MMA Factory, Guadalajara", text: "Subí de free a Pro y en 2 semanas ya recuperé 3 meses de pagos que no sabía que me debían. Increíble.", stars: 5 },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white py-16 px-4 text-center">
        <div className="mb-4">
          <span className="bg-purple-600/40 text-purple-300 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide">
            🔥 Oferta de lanzamiento — Precios especiales
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
          La herramienta #1 para<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
            academias deportivas en LATAM
          </span>
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
          Deja de cobrar con hojas de papel. Automatiza tus cobros, controla deudores
          y haz crecer tu academia con Sensei.
        </p>

        {/* Toggle anual/mensual */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-medium ${!annual ? "text-white" : "text-slate-400"}`}>Mensual</span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-12 h-6 rounded-full transition-colors ${annual ? "bg-purple-500" : "bg-slate-600"}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${annual ? "translate-x-7" : "translate-x-1"}`} />
          </button>
          <span className={`text-sm font-medium ${annual ? "text-white" : "text-slate-400"}`}>
            Anual <span className="text-green-400 font-bold">(ahorra 2 meses)</span>
          </span>
        </div>
      </div>

      {/* Urgencia */}
      <div className="bg-red-600 text-white text-center py-2.5 px-4">
        <p className="text-sm font-semibold">
          ⏰ <span className="font-black">Precio de lanzamiento</span> — Solo por tiempo limitado. Congela tu precio hoy.
        </p>
      </div>

      {/* Plans grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan) => {
            const price = annual ? Math.round(plan.price * 10) : plan.price;
            const isPro = plan.id === "pro";
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-6 flex flex-col ${plan.color} ${
                  isPro
                    ? "bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/30 dark:to-slate-800 shadow-xl scale-105"
                    : "bg-white dark:bg-slate-800"
                }`}
              >
                {plan.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-black px-3 py-1 rounded-full whitespace-nowrap ${
                    isPro ? "bg-purple-600 text-white" : "bg-amber-500 text-white"
                  }`}>
                    {plan.badge}
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{plan.desc}</p>
                </div>

                <div className="mb-6">
                  {plan.price === 0 ? (
                    <p className="text-3xl font-black text-slate-900 dark:text-white">Gratis</p>
                  ) : (
                    <div>
                      <span className="text-3xl font-black text-slate-900 dark:text-white">
                        ${price.toLocaleString()}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">MXN{plan.period}</span>
                      {annual && <p className="text-green-600 text-xs font-semibold mt-1">✓ 2 meses gratis incluidos</p>}
                    </div>
                  )}
                </div>

                <ul className="space-y-2 flex-1 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className={`flex items-start gap-2 text-sm ${f.ok ? "text-slate-700 dark:text-slate-300" : "text-slate-300 dark:text-slate-600 line-through"}`}>
                      <span className="mt-0.5 flex-shrink-0">{f.ok ? "✅" : "❌"}</span>
                      {f.text}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`w-full text-center py-3 rounded-xl font-bold text-sm transition ${plan.ctaStyle}`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Garantía */}
        <div className="text-center mt-12 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-8">
          <div className="text-4xl mb-3">🛡️</div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Garantía 30 días sin riesgo</h3>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Si en 30 días no estás 100% satisfecho, te devolvemos tu dinero sin preguntas.
            Sin letras chicas. Sin sorpresas.
          </p>
        </div>

        {/* Comparativa vs competencia */}
        <div className="mt-16">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-8">¿Por qué Sensei?</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="text-left p-4 rounded-tl-xl font-semibold text-slate-700 dark:text-slate-300">Función</th>
                  <th className="p-4 font-black text-purple-700 dark:text-purple-400">🥋 Sensei Pro</th>
                  <th className="p-4 font-semibold text-slate-500 dark:text-slate-400">Hojas de cálculo</th>
                  <th className="p-4 font-semibold text-slate-500 dark:text-slate-400 rounded-tr-xl">Otras apps</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Control de pagos mensual", "✅ Automático", "⚠️ Manual", "✅"],
                  ["Recordatorios por WhatsApp", "✅", "❌", "❌"],
                  ["Bot de Telegram", "✅", "❌", "❌"],
                  ["Reporte financiero anual", "✅", "⚠️ Manual", "✅"],
                  ["Exportar datos", "✅ Excel/CSV", "✅ Solo Excel", "✅"],
                  ["Precio mensual", "💚 $599 MXN", "Gratis*", "🔴 $1,500+ USD"],
                  ["Soporte en español", "✅ 24/7", "❌", "⚠️"],
                ].map(([feature, sensei, sheets, other], i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{feature}</td>
                    <td className="p-4 text-center font-semibold text-slate-900 dark:text-white">{sensei}</td>
                    <td className="p-4 text-center text-slate-500 dark:text-slate-400">{sheets}</td>
                    <td className="p-4 text-center text-slate-500 dark:text-slate-400">{other}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">*Las hojas de cálculo son gratis pero cuestan horas de tu tiempo cada mes.</p>
        </div>

        {/* Testimonios */}
        <div className="mt-16">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-8">
            Lo que dicen los sensei 🥋
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                <div className="text-yellow-400 text-lg mb-3">{"⭐".repeat(t.stars)}</div>
                <p className="text-slate-700 dark:text-slate-300 text-sm italic mb-4">"{t.text}"</p>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs">{t.academia}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-8">Preguntas frecuentes</h2>
          <div className="space-y-4">
            {[
              { q: "¿Puedo cancelar cuando quiera?", a: "Sí, sin penalizaciones ni contratos. Cancelas cuando quieras desde Ajustes." },
              { q: "¿Qué pasa con mis datos si cancelo?", a: "Puedes exportar todos tus datos antes de cancelar. Los guardamos 60 días más por si cambias de opinión." },
              { q: "¿Necesito saber de tecnología?", a: "Para nada. Si puedes usar WhatsApp, puedes usar Sensei. Además te ayudamos en la configuración inicial sin costo." },
              { q: "¿Funciona para cualquier deporte?", a: "Sí — Taekwondo, MMA, Boxeo, Natación, Fútbol, Yoga, Crossfit... cualquier disciplina que cobre mensualidades." },
              { q: "¿Cuánto tiempo toma migrar mis datos del Excel actual?", a: "15 minutos. Tienes importación directa desde Excel (.xlsx) en todos los planes de pago." },
            ].map((faq, i) => (
              <details key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 cursor-pointer group">
                <summary className="font-semibold text-slate-900 dark:text-white list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-3">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="mt-16 bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl p-10 text-white text-center">
          <div className="text-5xl mb-4">🥋</div>
          <h2 className="text-3xl font-black mb-3">Empieza hoy. Cobra más mañana.</h2>
          <p className="text-slate-300 mb-8 max-w-lg mx-auto">
            Únete a cientos de instructores en México que ya automatizaron su academia con Sensei.
            Prueba gratuita de 14 días incluida en todos los planes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="bg-white text-slate-900 font-black px-8 py-4 rounded-xl hover:bg-slate-100 transition text-lg"
            >
              🚀 Crear cuenta gratis
            </Link>
            <Link
              href="/login"
              className="border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition"
            >
              Ya tengo cuenta →
            </Link>
          </div>
          <p className="text-slate-400 text-sm mt-4">Sin tarjeta de crédito · Cancela cuando quieras · En español</p>
        </div>
      </div>
    </div>
  );
}
