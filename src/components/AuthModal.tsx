"use client";

import { useState } from "react";
import { auth } from "@/lib/auth";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
  defaultTab?: "login" | "signup";
  inline?: boolean;
}

export function AuthModal({ onClose, onSuccess, defaultTab = "login", inline = false }: Props) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "signup") {
        if (!name.trim() || !email.trim() || !password) {
          setError("All fields are required.");
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError("Password must be at least 6 characters.");
          setLoading(false);
          return;
        }
        const result = await auth.signup(email, name, password);
        if (!result.ok) {
          setError(result.error);
          setLoading(false);
          return;
        }
      } else {
        if (!email.trim() || !password) {
          setError("Email and password are required.");
          setLoading(false);
          return;
        }
        const result = await auth.login(email, password);
        if (!result.ok) {
          setError(result.error);
          setLoading(false);
          return;
        }
      }
      onSuccess();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const card = (
      <div className={`bg-white rounded-xl ${inline ? "border border-gray-200" : "shadow-xl"} w-full max-w-sm ${inline ? "" : "mx-4"} p-6 relative`}>
        {!inline && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => { setTab("login"); setError(""); }}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "login" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => { setTab("signup"); setError(""); }}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "signup" ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === "signup" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="Jane Smith" disabled={loading} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@company.com" disabled={loading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder={tab === "signup" ? "At least 6 characters" : "••••••••"} disabled={loading} />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Please wait…" : tab === "login" ? "Log In" : "Create Account"}
          </button>
        </form>
      </div>
  );

  if (inline) return card;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      {card}
    </div>
  );
}
