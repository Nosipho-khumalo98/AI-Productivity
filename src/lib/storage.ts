import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value, hydrated]);

  const reset = useCallback(() => setValue(initial), [initial]);
  return [value, setValue, reset] as const;
}

export type HistoryItem = {
  id: string;
  type: "email" | "summary" | "plan";
  title: string;
  content: string;
  meta?: Record<string, string>;
  createdAt: number;
  saved?: boolean;
};

export const HISTORY_KEY = "wai.history.v1";
export const STATS_KEY = "wai.stats.v1";

export type Stats = {
  emails: number;
  summaries: number;
  plans: number;
};

export const emptyStats: Stats = { emails: 0, summaries: 0, plans: 0 };

export function addHistoryItem(item: HistoryItem) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    const list: HistoryItem[] = raw ? JSON.parse(raw) : [];
    list.unshift(item);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 200)));
    const sraw = localStorage.getItem(STATS_KEY);
    const stats: Stats = sraw ? JSON.parse(sraw) : { ...emptyStats };
    if (item.type === "email") stats.emails++;
    else if (item.type === "summary") stats.summaries++;
    else if (item.type === "plan") stats.plans++;
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    window.dispatchEvent(new Event("wai:history-updated"));
  } catch {
    /* ignore */
  }
}

export function toggleSaved(id: string) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return;
  const list: HistoryItem[] = JSON.parse(raw);
  const next = list.map((i) => (i.id === id ? { ...i, saved: !i.saved } : i));
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("wai:history-updated"));
}

export function deleteHistoryItem(id: string) {
  if (typeof window === "undefined") return;
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return;
  const list: HistoryItem[] = JSON.parse(raw);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list.filter((i) => i.id !== id)));
  window.dispatchEvent(new Event("wai:history-updated"));
}

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(HISTORY_KEY);
        setItems(raw ? JSON.parse(raw) : []);
      } catch {
        setItems([]);
      }
    };
    load();
    window.addEventListener("wai:history-updated", load);
    return () => window.removeEventListener("wai:history-updated", load);
  }, []);
  return items;
}

export function useStats() {
  const [stats, setStats] = useState<Stats>(emptyStats);
  useEffect(() => {
    const load = () => {
      try {
        const raw = localStorage.getItem(STATS_KEY);
        setStats(raw ? JSON.parse(raw) : emptyStats);
      } catch {
        setStats(emptyStats);
      }
    };
    load();
    window.addEventListener("wai:history-updated", load);
    return () => window.removeEventListener("wai:history-updated", load);
  }, []);
  return stats;
}

export function newId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
