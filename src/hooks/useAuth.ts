"use client";
import { useState, useEffect } from "react";
import { auth } from "@/lib/auth";
import type { User } from "@/lib/types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(auth.currentUser());

  useEffect(() => {
    return auth.subscribe(() => setUser(auth.currentUser()));
  }, []);

  return { user, auth };
}
