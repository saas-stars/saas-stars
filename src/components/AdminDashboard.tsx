"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { getAdminAnalytics, ADMIN_EMAIL, type AdminAnalytics } from "@/lib/admin-analytics";
import {
  BarChart3,
  Eye,
  MousePointerClick,
  ArrowLeft,
  Shield,
  TrendingUp,
  Clock,
  ExternalLink,
  LogIn,
} from "lucide-react";

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 text-center">
      <div className="flex items-center justify-center gap-1.5 text-gray-400 mb-2">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
    </div>
  );
}

function LoginGate({ onLogin }: { onLogin: () => void }) {
  const { auth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await auth.login(email, password);
    if (!result.ok) {
      setError(result.error);
      setLoading(false);
    } else {
      onLogin();
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-20">
      <div className="text-center mb-6">
        <Shield className="w-10 h-10 text-gray-400 mx-auto mb-3" />
        <h1 className="text-xl font-bold text-gray-900">Admin Login</h1>
        <p className="text-sm text-gray-500 mt-1">Sign in with your admin account to view platform analytics.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="dave@saasstars.com" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" required />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">
          <LogIn className="w-4 h-4" />
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginTrigger, setLoginTrigger] = useState(0);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getAdminAnalytics().then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [isAdmin, loginTrigger]);

  // Not logged in or not admin
  if (!user) {
    return <LoginGate onLogin={() => setLoginTrigger((n) => n + 1)} />;
  }

  if (!isAdmin) {
    return (
      <div className="text-center mt-20">
        <Shield className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h1 className="text-xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-sm text-gray-500 mt-2">This page is restricted to platform administrators.</p>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mt-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to homepage
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center mt-20 text-gray-400">Loading analytics…</div>;
  }

  if (!data) {
    return <div className="text-center mt-20 text-gray-400">No analytics data yet.</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-emerald-600" />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Platform Analytics</h1>
            <p className="text-sm text-gray-500">All startups &middot; All time</p>
          </div>
        </div>
        <Link href="/" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
      </div>

      {/* ── Top Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard icon={<Eye className="w-4 h-4" />} label="Total Profile Views" value={data.totalViews} />
        <StatCard icon={<MousePointerClick className="w-4 h-4" />} label="Total Outbound Clicks" value={data.totalClicks} />
        <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Startups Tracked" value={data.startupBreakdown.length} />
      </div>

      {/* ── Views Over Time ── */}
      {data.viewsByDay.length > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Profile Views — Last 30 Days</h2>
          <div className="flex items-end gap-1 h-24">
            {data.viewsByDay.map((d) => {
              const max = Math.max(...data.viewsByDay.map((v) => v.count));
              const height = max > 0 ? (d.count / max) * 100 : 0;
              return (
                <div key={d.date} className="flex-1 group relative">
                  <div className="bg-emerald-500 rounded-t-sm transition-all" style={{ height: `${Math.max(height, 4)}%` }} />
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                    {d.date}: {d.count}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Per-Startup Breakdown ── */}
      <section className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
        <h2 className="text-sm font-bold text-gray-900 mb-4">By Startup</h2>
        {data.startupBreakdown.length === 0 ? (
          <p className="text-sm text-gray-400">No data yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.startupBreakdown.map((s) => (
              <div key={s.startupId} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-gray-900">{s.companyName}</span>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {s.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <MousePointerClick className="w-3.5 h-3.5" />
                    {s.clicks}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Clicks by Link Type ── */}
      {Object.keys(data.clicksByType).length > 0 && (
        <section className="bg-white border border-gray-200 rounded-xl p-5 mb-8">
          <h2 className="text-sm font-bold text-gray-900 mb-4">Clicks by Link Type</h2>
          <div className="space-y-2">
            {Object.entries(data.clicksByType)
              .sort((a, b) => b[1] - a[1])
              .map(([type, count]) => {
                const maxCount = Math.max(...Object.values(data.clicksByType));
                const width = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600 capitalize">{type.replace(/_/g, " ")}</span>
                      <span className="font-medium text-gray-900">{count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* ── Recent Activity ── */}
      <section className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-bold text-gray-900 mb-4">Recent Activity</h2>
        {data.recentEvents.length === 0 ? (
          <p className="text-sm text-gray-400">No events yet.</p>
        ) : (
          <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
            {data.recentEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-3 py-2.5">
                {e.eventType === "profile_view" ? (
                  <Eye className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                ) : (
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 truncate">
                    <span className="font-medium">{e.companyName}</span>
                    {" — "}
                    {e.eventType === "profile_view" ? "Profile view" : `Click: ${e.linkType || "link"}`}
                  </p>
                  {e.referrer && <p className="text-xs text-gray-400 truncate">from {e.referrer}</p>}
                </div>
                <span className="text-xs text-gray-400 shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(e.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
