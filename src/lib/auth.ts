import { supabase } from "./supabase";
import type { User } from "./types";

let currentUser: User | null = null;
let listeners: (() => void)[] = [];

function notify() {
  listeners.forEach((fn) => fn());
}

function mapUser(supaUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): User {
  return {
    id: supaUser.id,
    email: supaUser.email || "",
    name: (supaUser.user_metadata?.name as string) || supaUser.email?.split("@")[0] || "",
  };
}

if (typeof window !== "undefined") {
  supabase.auth.getSession().then(({ data }) => {
    if (data.session?.user) {
      currentUser = mapUser(data.session.user);
      notify();
    }
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ? mapUser(session.user) : null;
    notify();
  });
}

export const auth = {
  subscribe(fn: () => void) {
    listeners.push(fn);
    return () => {
      listeners = listeners.filter((l) => l !== fn);
    };
  },

  async signup(
    email: string,
    name: string,
    password: string
  ): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: { data: { name: name.trim() } },
    });
    if (error) return { ok: false, error: error.message };
    if (!data.user) return { ok: false, error: "Signup failed. Please try again." };
    const user = mapUser(data.user);
    currentUser = user;
    notify();
    return { ok: true, user };
  },

  async login(
    email: string,
    password: string
  ): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password,
    });
    if (error) return { ok: false, error: error.message };
    if (!data.user) return { ok: false, error: "Login failed. Please try again." };
    const user = mapUser(data.user);
    currentUser = user;
    notify();
    return { ok: true, user };
  },

  async logout() {
    await supabase.auth.signOut();
    currentUser = null;
    notify();
  },

  currentUser(): User | null {
    return currentUser;
  },
};
