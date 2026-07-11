import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { X, Play, Loader2 } from "lucide-react";
import type { Game } from "@/lib/types";
import { GameThumb } from "@/components/GameThumb";
import { PulseLine } from "@/components/PulseLine";
import { useMarket } from "./MarketContext";

type DemoCtx = { playDemo: (game: Game) => void };
const Ctx = createContext<DemoCtx | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const { t } = useMarket();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);

  const playDemo = useCallback((g: Game) => {
    setGame(g);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 900);
  }, []);

  const close = useCallback(() => setGame(null), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const value = useMemo(() => ({ playDemo }), [playDemo]);

  return (
    <Ctx.Provider value={value}>
      {children}
      {game && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${game.name} demo`}
          onClick={close}
        >
          <div
            className="card w-full max-w-md overflow-hidden rounded-b-none rounded-t-3xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-video w-full">
              <GameThumb game={game} ratio="aspect-video" rounded="rounded-none" />
              <div className="absolute inset-0 grid place-items-center bg-black/35">
                {loading ? (
                  <Loader2 className="animate-spin text-pulse" size={34} />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-pulse text-ink">
                      <Play size={26} fill="currentColor" />
                    </div>
                    <PulseLine className="h-6 w-40 opacity-90" />
                    <p className="text-xs font-medium text-white/85">示範試玩 · Demo preview</p>
                  </div>
                )}
              </div>
              <button
                onClick={close}
                aria-label={t("action.back")}
                className="btn absolute right-2 top-2 h-9 w-9 bg-black/50 p-0 text-white hover:bg-black/70"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4">
              <p className="font-display text-lg font-bold">{game.name}</p>
              <p className="mt-0.5 text-sm text-content-muted">{game.provider}</p>
              <p className="mt-2 text-xs leading-relaxed text-content-muted">
                {t("footer.demo")} — {game.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useDemo(): DemoCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
