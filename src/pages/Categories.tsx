import { useState } from "react";
import { Link } from "react-router-dom";
import { useMarket } from "@/context/MarketContext";
import type { Lang } from "@/lib/types";
import { CATEGORIES } from "@/data/categories";
import { gamesInMarket } from "@/data/games";
import { MECHANIC, THEME } from "@/data/vocab";
import { Icon } from "@/components/Icon";
import { pick } from "@/i18n";

type Group = "type" | "mechanic" | "theme";

const MECHANIC_ICON: Record<string, string> = {
  holdWin: "Lock", megaways: "Layers", cluster: "Grid3x3", cascading: "ArrowDownUp",
  freeSpins: "RefreshCw", shooting: "Crosshair", clickPlay: "MousePointerClick",
};
const THEME_ICON: Record<string, string> = {
  animal: "PawPrint", fortune: "Coins", adventure: "Compass", egypt: "Pyramid",
  candy: "Candy", pirate: "Anchor", sport: "Trophy", classic: "Diamond",
};

function desc(id: string, lang: Lang): string {
  const M: Record<string, [string, string, string]> = {
    // mechanics
    holdWin: ["鎖定符號累積再觸發大獎", "Giữ biểu tượng để nổ thưởng", "Lock symbols to trigger a prize"],
    megaways: ["每轉路數變化、路徑更多", "Số cách trúng thay đổi mỗi vòng", "Ways-to-win change every spin"],
    cluster: ["成群消除、連鎖給獎", "Xoá theo cụm, thưởng chuỗi", "Clear clusters for chain wins"],
    cascading: ["中獎符號落下遞補連消", "Ký hiệu rơi xuống nổ chuỗi", "Winning symbols tumble for combos"],
    freeSpins: ["免費旋轉回合、常帶加成", "Vòng quay miễn phí kèm thưởng", "Free-spin rounds with boosts"],
    shooting: ["瞄準射擊、即時互動", "Ngắm bắn, tương tác thời gian thực", "Aim-and-shoot, real-time"],
    clickPlay: ["點一下就玩、規則直覺", "Chạm là chơi, luật đơn giản", "Tap and play, intuitive"],
    // themes
    animal: ["可愛動物與海洋生物", "Động vật & sinh vật biển", "Cute animals & sea life"],
    fortune: ["財神與招財主題", "Chủ đề thần tài", "Fortune & prosperity"],
    adventure: ["探索與冒險旅程", "Hành trình phiêu lưu", "Exploration & adventure"],
    egypt: ["古埃及與金字塔", "Ai Cập & kim tự tháp", "Ancient Egypt & pyramids"],
    candy: ["繽紛糖果甜點", "Kẹo ngọt nhiều màu", "Colorful candy & sweets"],
    pirate: ["海盜與寶藏冒險", "Cướp biển & kho báu", "Pirates & treasure"],
    sport: ["運動競技主題", "Chủ đề thể thao", "Sports & competition"],
    classic: ["經典熟悉玩法", "Lối chơi cổ điển", "Familiar classics"],
  };
  const c = M[id];
  return c ? pick(lang, c[0], c[1], c[2]) : "";
}

export default function Categories() {
  const { t, lang, market } = useMarket();
  const [group, setGroup] = useState<Group>("type");
  const games = gamesInMarket(market);

  const items: { id: string; label: string; icon: string; to: string; count: number }[] =
    group === "type"
      ? CATEGORIES.map((c) => ({
          id: c.id, label: c.label[lang], icon: c.icon, to: `/discover?cat=${c.id}`,
          count: games.filter((g) => g.category === c.id && g.demoStatus === "ok").length,
        }))
      : group === "mechanic"
        ? Object.keys(MECHANIC).map((m) => ({
            id: m, label: MECHANIC[m][lang], icon: MECHANIC_ICON[m] ?? "Puzzle", to: `/discover?mech=${m}`,
            count: games.filter((g) => g.mechanics.includes(m) && g.demoStatus === "ok").length,
          }))
        : Object.keys(THEME).map((th) => ({
            id: th, label: THEME[th][lang], icon: THEME_ICON[th] ?? "Sparkles", to: `/discover?theme=${th}`,
            count: games.filter((g) => g.themes.includes(th) && g.demoStatus === "ok").length,
          }));

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">{t("nav.categories")}</h1>
      <p className="mt-1 text-sm text-content-muted">{t(`market.${market}`)} · {t("misc.updated")}</p>

      {/* group switch */}
      <div className="mt-4 inline-flex rounded-full border border-surface-line bg-ink-800 p-0.5">
        {(["type", "mechanic", "theme"] as Group[]).map((gp) => (
          <button key={gp} onClick={() => setGroup(gp)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${group === gp ? "bg-pulse text-ink" : "text-content-muted hover:text-content"}`}>
            {pick(lang, { type: "依類型", mechanic: "依玩法找遊戲", theme: "依主題" }[gp], { type: "Theo loại", mechanic: "Theo lối chơi", theme: "Theo chủ đề" }[gp], { type: "By type", mechanic: "By mechanic", theme: "By theme" }[gp])}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <Link key={it.id} to={it.to} className="card group flex items-center gap-3 p-4 transition hover:border-pulse/40">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-surface-raised text-pulse">
              <Icon name={it.icon} size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-content">{it.label}</p>
              <p className="truncate text-xs text-content-muted">{desc(it.id, lang)}</p>
              <p className="tnum mt-0.5 text-[11px] text-pulse">{pick(lang, `${it.count} 款可免費試玩`, `${it.count} game chơi thử`, `${it.count} playable`)}</p>
            </div>
            <span className="text-content-faint transition group-hover:translate-x-0.5">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
