import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { CheckCircle2, Info, AlertTriangle } from "lucide-react";

type Tone = "success" | "info" | "warn";
type Toast = { id: number; message: string; tone: Tone };

type ToastCtx = { push: (message: string, tone?: Tone) => void };

const Ctx = createContext<ToastCtx | null>(null);

const ICONS = { success: CheckCircle2, info: Info, warn: AlertTriangle } as const;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const push = useCallback((message: string, tone: Tone = "success") => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-8">
        {toasts.map((t) => {
          const Icon = ICONS[t.tone];
          const tone =
            t.tone === "warn"
              ? "border-flame/40 text-flame"
              : t.tone === "info"
                ? "border-surface-line text-content"
                : "border-pulse/40 text-pulse";
          return (
            <div
              key={t.id}
              role="status"
              className={`animate-toast-in pointer-events-auto flex items-center gap-2 rounded-full border ${tone} bg-ink-800/95 px-4 py-2 text-sm font-medium shadow-card backdrop-blur`}
            >
              <Icon size={16} aria-hidden />
              <span className="text-content">{t.message}</span>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
