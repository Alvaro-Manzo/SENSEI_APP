"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useThemeStore } from "@/store/theme";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/members", label: "Alumnos", icon: "👥" },
  { href: "/payments", label: "Pagos", icon: "💵" },
  { href: "/reports", label: "Reportes", icon: "📈" },
  { href: "/settings", label: "Ajustes", icon: "⚙️" },
];

const PLAN_BADGE: Record<string, { label: string; color: string }> = {
  free:    { label: "FREE", color: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300" },
  starter: { label: "STARTER", color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  pro:     { label: "PRO ⚡", color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
  elite:   { label: "ELITE 👑", color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300" },
};

export default function Navbar({ plan = "free" }: { plan?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { dark, toggle } = useThemeStore();
  const badge = PLAN_BADGE[plan] ?? PLAN_BADGE.free;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">🥋</span>
        <div>
          <p className="font-bold text-slate-900 dark:text-white leading-none text-sm">Sensei</p>
          {user && <p className="text-xs text-slate-400 leading-none mt-0.5 truncate max-w-[120px]">{user.nombre}</p>}
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badge.color}`}>
          {badge.label}
        </span>
        {plan === "free" && (
          <Link
            href="/pricing"
            className="hidden md:inline-flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1.5 rounded-full hover:opacity-90 transition animate-pulse"
          >
            ⬆️ Actualiza tu plan
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="hidden md:flex items-center gap-0.5">
        {NAV_LINKS.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700"
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Right: dark toggle + logout */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          title={dark ? "Modo claro" : "Modo oscuro"}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition text-lg"
        >
          {dark ? "☀️" : "🌙"}
        </button>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition font-medium px-2"
        >
          Salir →
        </button>
      </div>
    </header>
  );
}
