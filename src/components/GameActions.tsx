import { Heart, Play, GitCompareArrows } from "lucide-react";
import type { Game } from "@/lib/types";
import { useSaved } from "@/context/SavedContext";
import { useToast } from "@/context/ToastContext";
import { useDemo } from "@/context/DemoContext";
import { useMarket } from "@/context/MarketContext";

// Reusable save / compare / demo controls, wired to state + toasts.
export function SaveButton({ game, compact = false }: { game: Game; compact?: boolean }) {
  const { toggleSave, isSaved } = useSaved();
  const { push } = useToast();
  const { t } = useMarket();
  const saved = isSaved(game.id);
  return (
    <button
      onClick={() => {
        const now = toggleSave(game.id);
        push(now ? t("toast.saved") : t("toast.unsaved"), now ? "success" : "info");
      }}
      aria-pressed={saved}
      aria-label={t("action.save")}
      className={`btn h-9 w-9 p-0 ${
        saved ? "bg-vn/15 text-vn ring-1 ring-vn/40" : "border border-surface-line bg-surface-raised text-content-muted hover:text-content"
      } ${compact ? "" : ""}`}
    >
      <Heart size={17} fill={saved ? "currentColor" : "none"} />
    </button>
  );
}

export function CompareButton({ game }: { game: Game }) {
  const { toggleCompare, inCompare } = useSaved();
  const { push } = useToast();
  const { t } = useMarket();
  const active = inCompare(game.id);
  return (
    <button
      onClick={() => {
        const r = toggleCompare(game.id);
        if (r === "added") push(t("toast.compareAdded"), "success");
        else if (r === "removed") push(t("toast.compareRemoved"), "info");
        else push(t("toast.compareFull"), "warn");
      }}
      aria-pressed={active}
      aria-label={t("action.compare")}
      className={`btn h-9 w-9 p-0 ${
        active ? "bg-pulse/15 text-pulse ring-1 ring-pulse/40" : "border border-surface-line bg-surface-raised text-content-muted hover:text-content"
      }`}
    >
      <GitCompareArrows size={17} />
    </button>
  );
}

export function DemoButton({ game, full = false }: { game: Game; full?: boolean }) {
  const { playDemo } = useDemo();
  const { t } = useMarket();
  return (
    <button onClick={() => playDemo(game)} className={`btn-primary h-9 ${full ? "w-full" : "flex-1"}`}>
      <Play size={15} fill="currentColor" /> {t("action.tryFree")}
    </button>
  );
}
