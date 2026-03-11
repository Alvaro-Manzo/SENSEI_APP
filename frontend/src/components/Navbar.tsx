"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/members", label: "Alumnos", icon: "👥" },
  { href: "/payments", label: "Pagos", icon: "💵" },
  { href: "/reports", label: "Reportes", icon: "📈" },
  { href: "/settings", label: "Ajustes", icon: "⚙️" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
      {/* Logo + org name */}
      <div className="flex items-center gap-3">
        <span className="text-2xl">🥋</span>
        <div>
          <p className="font-bold text-slate-900 leading-none">Sensei</p>
          {user && <p className="text-xs text-slate-400 leading-none mt-0.5">{user.nombre}</p>}
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex items-center gap-1">
        {NAV_LINKS.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="text-sm text-slate-400 hover:text-red-500 transition font-medium"
      >
        Salir →
      </button>
    </header>
  );
}
