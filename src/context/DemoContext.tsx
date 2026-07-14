import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { X, Play, Loader2, ExternalLink, AlertTriangle, Wrench, Globe, Smartphone, LinkIcon } from "lucide-react";
import type { DemoStatus, Game } from "@/lib/types";
import { GameThumb } from "@/components/GameThumb";
import { PulseLine } from "@/components/PulseLine";
import { useMarket } from "./MarketContext";
import { useSaved } from "./SavedContext";
import { useToast } from "./ToastContext";
import { pick } from "@/i18n";

type DemoCtx = { playDemo: (game: Game) => void };
const Ctx = createContext<DemoCtx | null>(null);

// Localized copy for each non-playable demo status.
function statusInfo(status: DemoStatus, lang: "zh" | "vi" | "en") {
  switch (status) {
    case "maintenance":
      return { icon: Wrench, title: pick(lang, "維護中", "Đang bảo trì", "Under maintenance"), body: pick(lang, "這款遊戲的試玩暫時維護中，請稍後再試。", "Bản chơi thử đang bảo trì, vui lòng thử lại sau.", "This demo is temporarily under maintenance. Please try again later.") };
    case "mobileUnsupported":
      return { icon: Smartphone, title: pick(lang, "手機暫不支援", "Chưa hỗ trợ di động", "Not on mobile yet"), body: pick(lang, "此試玩目前建議使用電腦開啟。", "Bản chơi thử này nên mở trên máy tính.", "This demo is best opened on desktop for now.") };
    case "regionLocked":
      return { icon: Globe, title: pick(lang, "地區限制", "Giới hạn khu vực", "Region-limited"), body: pick(lang, "此試玩在你目前的地區暫不可用。", "Bản chơi thử tạm không khả dụng ở khu vực của bạn.", "This demo isn't available in your region right now.") };
    case "linkBroken":
      return { icon: LinkIcon, title: pick(lang, "連結失效", "Liên kết lỗi", "Link unavailable"), body: pick(lang, "官方試玩連結目前失效，我們已記錄回報。", "Liên kết chơi thử chính thức đang lỗi, đã ghi nhận báo cáo.", "The official demo link is currently down — we've logged your report.") };
    default:
      return null;
  }
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const { t, lang } = useMarket();
  const { addRecentPlayed, reportBroken } = useSaved();
  const { push } = useToast();
  const [game, setGame] = useState<Game | null>(null);
  const [mode, setMode] = useState<"onsite" | "official" | "blocked">("onsite");
  const [loading, setLoading] = useState(false);

  const playDemo = useCallback(
    (g: Game) => {
      setGame(g);
      if (g.demoStatus !== "ok") {
        setMode("blocked");
        if (g.demoStatus === "linkBroken") reportBroken(g.id);
        return;
      }
      addRecentPlayed(g.id);
      if (g.demoType === "official") {
        setMode("official");
      } else {
        setMode("onsite");
        setLoading(true);
        window.setTimeout(() => setLoading(false), 900);
      }
    },
    [addRecentPlayed, reportBroken],
  );

  const close = useCallback(() => setGame(null), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const value = useMemo(() => ({ playDemo }), [playDemo]);
  const status = game ? statusInfo(game.demoStatus, lang) : null;

  return (
    <Ctx.Provider value={value}>
      {children}
      {game && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={game.name}
          onClick={close}
        >
          <div className="card w-full max-w-md overflow-hidden rounded-b-none rounded-t-3xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="relative aspect-video w-full">
              <GameThumb game={game} ratio="aspect-video" rounded="rounded-none" />
              <div className="absolute inset-0 grid place-items-center bg-black/40">
                {mode === "onsite" && loading && <Loader2 className="animate-spin text-pulse" size={34} />}
                {mode === "onsite" && !loading && (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-pulse text-ink"><Play size={26} fill="currentColor" /></div>
                    <PulseLine className="h-6 w-40 opacity-90" />
                    <p className="text-xs font-medium text-white/85">{pick(lang, "在本站試玩（示意）", "Chơi thử tại trang (demo)", "In-site demo (preview)")}</p>
                  </div>
                )}
                {mode === "official" && (
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-ph text-ink"><ExternalLink size={24} /></div>
                )}
                {mode === "blocked" && status && (
                  <div className="grid h-14 w-14 place-items-center rounded-full bg-flame/20 text-flame"><status.icon size={26} /></div>
                )}
              </div>
              <button onClick={close} aria-label={t("action.back")} className="btn absolute right-2 top-2 h-9 w-9 bg-black/50 p-0 text-white hover:bg-black/70"><X size={18} /></button>
            </div>

            <div className="p-4">
              <p className="font-display text-lg font-bold">{game.name}</p>
              <p className="mt-0.5 text-sm text-content-muted">{game.provider}</p>

              {mode === "onsite" && (
                <p className="mt-2 text-xs leading-relaxed text-content-muted">{t("footer.demo")} — {game.description}</p>
              )}

              {mode === "official" && (
                <div className="mt-2">
                  <div className="flex items-start gap-2 rounded-xl border border-surface-line bg-surface-raised p-3 text-xs text-content-muted">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-flame" />
                    <span>{pick(lang, "即將開啟遊戲商提供的官方免費試玩頁面。本站不提供註冊、儲值或真實金錢遊戲。", "Sắp mở trang chơi thử miễn phí chính thức của nhà cung cấp. Trang này không có đăng ký, nạp tiền hay chơi tiền thật.", "About to open the provider's official free-demo page. This site has no sign-up, deposit or real-money play.")}</span>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => { window.open(game.demoUrl, "_blank", "noopener,noreferrer"); push(t("toast.demoOpened"), "info"); close(); }}
                      className="btn-primary h-10 flex-1"
                    >
                      <ExternalLink size={15} /> {t("action.goOfficial")}
                    </button>
                    <button
                      onClick={() => { reportBroken(game.id); push(t("toast.brokenReported"), "warn"); }}
                      className="btn-ghost h-10"
                    >
                      {t("action.reportBroken")}
                    </button>
                  </div>
                </div>
              )}

              {mode === "blocked" && status && (
                <div className="mt-2">
                  <p className="font-display text-sm font-bold text-flame">{status.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-content-muted">{status.body}</p>
                  <button onClick={close} className="btn-ghost mt-3 h-9 w-full">{t("action.back")}</button>
                </div>
              )}
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
