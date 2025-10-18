import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
export type NotificationItem = {
  label: string;
  message: string;
  timestamp?: string;
};

type NotificationContextValue = {
  active: NotificationItem[];
  dismiss: (label: string) => void;
  reset: (items: NotificationItem[]) => void;
  hydrated: boolean;
};

const STORAGE_KEY = "stockspies:dismissedNotifications";
const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        setDismissed(new Set(parsed));
      }
    } catch {
      // ignore corrupt data
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(dismissed)));
  }, [dismissed]);

  const [active, setActive] = useState<NotificationItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const dismiss = useCallback((label: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(label.toLowerCase());
      return next;
    });
    setActive((prev) => prev.filter((item) => item.label.toLowerCase() !== label.toLowerCase()));
  }, []);

  const reset = useCallback(
    (items: NotificationItem[]) => {
      const filtered = items.filter((item) => !dismissed.has(item.label.toLowerCase()));
      setActive(filtered);
      setHydrated(true);
    },
    [dismissed]
  );

  const value = useMemo(
    () => ({ active, dismiss, reset, hydrated }),
    [active, dismiss, reset, hydrated]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
