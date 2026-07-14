import { Heart, Play, GitCompareArrows, ExternalLink } from "lucide-react";
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

// label: "free" = 免費試玩 (short, for cards); "auto" = 在本站試玩 / 前往官方 Demo by type.
export function DemoButton({
  game,
  full = false,
  label = "free",
  size = "sm",
}: {
  game: Game;
  full?: boolean;
  label?: "free" | "auto";
  size?: "sm" | "lg";
}) {
  const { playDemo } = useDemo();
  const { t } = useMarket();
  const official = game.demoType === "official";
  const notOk = game.demoStatus !== "ok";
  const text =
    label === "free" ? t("action.tryFree") : official ? t("action.goOfficial") : t("action.tryOnsite");
  return (
    <button
      onClick={() => playDemo(game)}
      aria-label={text}
      className={`btn-primary ${size === "lg" ? "h-12 text-base" : "h-9"} ${full ? "w-full" : "flex-1"} ${
        notOk ? "opacity-70" : ""
      }`}
    >
      {official ? <ExternalLink size={size === "lg" ? 18 : 15} /> : <Play size={size === "lg" ? 18 : 15} fill="currentColor" />}
      {text}
    </button>
  );
}
