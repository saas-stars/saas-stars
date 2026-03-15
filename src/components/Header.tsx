"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { AuthModal } from "./AuthModal";
import {
  Plus,
  Star,
  LogOut,
  User,
  Newspaper,
  BarChart3,
  MapPin,
  Search,
  X,
} from "lucide-react";

function NavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: typeof Newspaper;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
        active
          ? "bg-white text-emerald-700 shadow-sm"
          : "text-gray-600 hover:text-gray-900 hover:bg-white/60"
      }`}
    >
      <Icon className={`w-4 h-4 ${active ? "text-emerald-600" : ""}`} />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, auth } = useAuth();
  const [showAuth, setShowAuth] = useState<"login" | "signup" | null>(null);
  const [pendingAdd, setPendingAdd] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");

  function handleAddClick() {
    if (!user) {
      setPendingAdd(true);
      setShowAuth("signup");
    } else {
      router.push("/add");
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-gray-900 text-lg tracking-tight hover:opacity-80 transition-opacity shrink-0"
          >
            <Star className="w-5 h-5 text-emerald-500 fill-emerald-500" />
            <span className="hidden sm:inline">SaaS Stars</span>
          </Link>

          <div className="flex-1 flex items-center justify-center gap-1 sm:gap-3">
            <nav className="flex items-center gap-0.5 sm:gap-1 bg-gray-100 rounded-lg p-0.5">
              <NavLink href="/news" icon={Newspaper} label="News" active={pathname === "/news"} />
              <NavLink href="/dashboard" icon={BarChart3} label="Stats" active={pathname === "/dashboard"} />
              <NavLink href="/map" icon={MapPin} label="Map" active={pathname === "/map"} />
            </nav>
            <div className="relative max-w-xs hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search…"
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && headerSearch.trim()) {
                    router.push(`/?q=${encodeURIComponent(headerSearch.trim())}`);
                  }
                }}
                className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 focus:bg-white transition-all"
              />
              {headerSearch && (
                <button
                  onClick={() => setHeaderSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <>
                <span className="hidden lg:flex items-center gap-1.5 text-sm text-gray-500">
                  <User className="w-3.5 h-3.5" />
                  {user.name}
                </span>
                <button
                  onClick={handleAddClick}
                  className="flex items-center gap-1.5 text-sm font-medium bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add SaaS</span>
                </button>
                <button
                  onClick={() => auth.logout()}
                  className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowAuth("login")}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={handleAddClick}
                  className="flex items-center gap-1.5 text-sm font-medium bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add SaaS</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {showAuth && (
        <AuthModal
          defaultTab={showAuth}
          onClose={() => {
            setShowAuth(null);
            setPendingAdd(false);
          }}
          onSuccess={() => {
            setShowAuth(null);
            if (pendingAdd) {
              setPendingAdd(false);
              router.push("/add");
            }
          }}
        />
      )}
    </>
  );
}
