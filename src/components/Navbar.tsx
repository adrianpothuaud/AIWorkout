"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/plan", label: "Plan", icon: "✨" },
  { href: "/log", label: "Log", icon: "📝" },
  { href: "/history", label: "History", icon: "📅" },
];

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null));
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-700 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around md:justify-start md:gap-8 h-16">
          <div className="hidden md:flex items-center gap-2 mr-8">
            <span className="text-2xl">💪</span>
            <span className="text-xl font-bold text-indigo-400">AIWorkout</span>
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-indigo-400 bg-indigo-950"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                <span className="text-xl md:text-base">{item.icon}</span>
                <span className="text-xs md:text-sm">{item.label}</span>
              </Link>
            );
          })}

          {/* Auth section – desktop only */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            {user ? (
              <>
                <span
                  data-testid="nav-user-name"
                  className="text-slate-300 text-sm font-medium px-3"
                >
                  👤 {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  data-testid="nav-logout-btn"
                  className="px-3 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  data-testid="nav-login"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === "/login"
                      ? "text-indigo-400 bg-indigo-950"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  data-testid="nav-register"
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
