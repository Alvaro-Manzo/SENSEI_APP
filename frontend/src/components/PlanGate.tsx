"use client";
import Link from "next/link";

const PLAN_RANK: Record<string, number> = { free: 0, starter: 1, pro: 2, elite: 3 };

interface PlanGateProps {
  required: "starter" | "pro" | "elite";
  current: string;
  feature: string;
  children: React.ReactNode;
  blur?: boolean; // mostrar contenido difuminado en lugar de ocultarlo
}

const PLAN_NAMES: Record<string, string> = {
  starter: "Starter ($299/mes)",
  pro: "Pro ($599/mes)",
  elite: "Elite ($999/mes)",
};

export default function PlanGate({ required, current, feature, children, blur = true }: PlanGateProps) {
  const hasAccess = (PLAN_RANK[current] ?? 0) >= (PLAN_RANK[required] ?? 99);
  if (hasAccess) return <>{children}</>;

  if (blur) {
    return (
      <div className="relative">
        <div className="select-none pointer-events-none blur-sm opacity-40 overflow-hidden max-h-48">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 rounded-xl z-10 p-6 text-center">
          <div className="text-3xl mb-2">🔒</div>
          <p className="font-bold text-slate-900 dark:text-white mb-1">{feature}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Disponible desde el plan <span className="font-semibold text-purple-600">{PLAN_NAMES[required]}</span>
          </p>
          <Link
            href="/pricing"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition shadow-lg shadow-purple-200 dark:shadow-purple-900"
          >
            Ver planes →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-8 text-center">
      <div className="text-4xl mb-3">🔒</div>
      <p className="font-bold text-slate-900 dark:text-white text-lg mb-2">{feature}</p>
      <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
        Esta función está disponible en el plan{" "}
        <span className="font-semibold text-purple-600">{PLAN_NAMES[required]}</span> o superior.
        Actualiza ahora y desbloquea todo el potencial de Sensei.
      </p>
      <Link
        href="/pricing"
        className="inline-block bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition shadow-lg"
      >
        🚀 Actualizar plan ahora
      </Link>
    </div>
  );
}

// Banner de upgrade inline (para usar dentro de páginas)
export function UpgradeBanner({ plan, message }: { plan: string; message: string }) {
  if (plan !== "free") return null;
  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">⚡</span>
        <div>
          <p className="font-bold text-sm">{message}</p>
          <p className="text-purple-200 text-xs">Prueba Pro 14 días gratis — cancela cuando quieras</p>
        </div>
      </div>
      <Link
        href="/pricing"
        className="bg-white text-purple-700 font-bold text-sm px-4 py-2 rounded-lg hover:bg-purple-50 transition whitespace-nowrap"
      >
        Ver planes
      </Link>
    </div>
  );
}

// Hook para verificar plan
export function canAccess(current: string, required: string): boolean {
  return (PLAN_RANK[current] ?? 0) >= (PLAN_RANK[required] ?? 99);
}
