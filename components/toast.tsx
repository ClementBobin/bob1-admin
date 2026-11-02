"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "info" | "danger";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  toast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

const icons = {
  success: CheckCircle2,
  info: Info,
  danger: TriangleAlert,
};

const tones = {
  success: "text-mint-foreground bg-mint",
  info: "text-info bg-info-soft",
  danger: "text-danger bg-danger-soft",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current.slice(-2), { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex w-[min(360px,calc(100vw-2.5rem))] flex-col gap-2">
        {toasts.map((item) => {
          const Icon = icons[item.tone];
          return (
            <div
              key={item.id}
              role="status"
              className="animate-toast pointer-events-auto flex items-center gap-3 rounded-2xl border border-line bg-card p-3.5 shadow-float"
            >
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", tones[item.tone])}>
                <Icon size={18} />
              </span>
              <p className="flex-1 text-[13px] font-medium leading-snug">{item.message}</p>
              <button
                onClick={() => dismiss(item.id)}
                aria-label="Fermer la notification"
                className="grid size-7 place-items-center rounded-lg text-soft transition hover:bg-muted hover:text-ink"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
