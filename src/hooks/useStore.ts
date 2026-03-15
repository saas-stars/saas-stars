"use client";
import { useState, useEffect } from "react";
import { store } from "@/lib/store";
import type { Startup } from "@/lib/types";

export function useStartups() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return store.subscribe(() => setTick((t) => t + 1));
  }, []);

  return store;
}

export function useStartup(id: string): Startup | undefined {
  const [, setTick] = useState(0);

  useEffect(() => {
    return store.subscribe(() => setTick((t) => t + 1));
  }, []);

  return store.getById(id);
}
