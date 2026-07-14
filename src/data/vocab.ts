import type { Game, Lang, MarketId } from "@/lib/types";
import { rankOf, trendOf } from "@/lib/format";

// Localized labels for the optimization vocabulary (mechanics / experience /
// themes / operation tips / review tags). One place, three languages.
type L = Record<Lang, string>;
const M = (zh: string, vi: string, en: string): L => ({ zh, vi, en });

export const MECHANIC: Record<string, L> = {
  holdWin: M("Hold & Win", "Hold & Win", "Hold & Win"),
  megaways: M("Megaways", "Megaways", "Megaways"),
  cluster: M("Cluster 群消", "Cluster", "Cluster pays"),
  cascading: M("Cascading 連消", "Nổ chuỗi", "Cascading"),
  freeSpins: M("免費旋轉", "Vòng quay miễn phí", "Free spins"),
  shooting: M("射擊互動", "Bắn tương tác", "Shooting"),
  clickPlay: M("點擊玩法", "Chạm để chơi", "Tap to play"),
};

export const EXPERIENCE: Record<string, L> = {
  newbie: M("適合新手", "Hợp người mới", "Beginner friendly"),
  simple: M("操作簡單", "Dễ thao tác", "Simple controls"),
  fast: M("快節奏", "Nhịp nhanh", "Fast pace"),
  special: M("特殊介面", "Giao diện đặc biệt", "Special interface"),
  rich: M("玩法豐富", "Lối chơi phong phú", "Rich gameplay"),
};

export const THEME: Record<string, L> = {
  animal: M("動物", "Động vật", "Animals"),
  fortune: M("財富", "Thần tài", "Fortune"),
  adventure: M("冒險", "Phiêu lưu", "Adventure"),
  egypt: M("埃及", "Ai Cập", "Egypt"),
  candy: M("糖果", "Kẹo ngọt", "Candy"),
  pirate: M("海盜", "Cướp biển", "Pirate"),
  sport: M("運動", "Thể thao", "Sports"),
  classic: M("經典", "Cổ điển", "Classic"),
};

export const OPTIP: Record<string, L> = {
  tapShoot: M("點擊畫面射擊", "Chạm để bắn", "Tap the screen to shoot"),
  mobileSwipe: M("手機滑動操作", "Vuốt trên di động", "Swipe on mobile"),
  mobileTap: M("手機點擊操作", "Chạm trên di động", "Tap on mobile"),
  spaceSpin: M("空白鍵加速旋轉", "Phím cách quay nhanh", "Spacebar to fast-spin"),
  autoSpin: M("支援自動旋轉", "Hỗ trợ tự quay", "Auto-spin supported"),
  tapCashout: M("點擊即時兌現", "Chạm để rút", "Tap to cash out"),
  tapPick: M("點擊選色/選項", "Chạm để chọn", "Tap to pick"),
  tapBet: M("點擊下注區", "Chạm vùng cược", "Tap the bet area"),
  tapAction: M("點擊出牌/動作", "Chạm để ra bài", "Tap to act"),
};

export const REVIEW_TAG: Record<string, L> = {
  niceVisuals: M("畫面吸引", "Hình đẹp", "Nice visuals"),
  simpleControls: M("操作簡單", "Dễ thao tác", "Simple controls"),
  fastPace: M("節奏快速", "Nhịp nhanh", "Fast pace"),
  specialGameplay: M("玩法特別", "Lối chơi lạ", "Special gameplay"),
  funBonus: M("Bonus 有趣", "Bonus vui", "Fun bonus"),
  easyUnderstand: M("容易理解", "Dễ hiểu", "Easy to understand"),
  slowLoad: M("載入較慢", "Tải hơi chậm", "Slow to load"),
  complexControls: M("操作複雜", "Thao tác phức tạp", "Complex controls"),
  repetitive: M("重複感較高", "Hơi lặp lại", "A bit repetitive"),
};

const EXTRA: Record<string, L> = {
  fast: EXPERIENCE.fast,
  manyBonus: M("多重獎勵", "Nhiều thưởng", "Many bonuses"),
  easy: M("簡單易上手", "Dễ chơi", "Easy to play"),
  bigWin: M("高倍潛力", "Tiềm năng lớn", "Big-win potential"),
};

// Resolve any optimization token to a label, searching all vocab maps.
export function tokenLabel(token: string, lang: Lang): string {
  return (
    MECHANIC[token]?.[lang] ??
    EXPERIENCE[token]?.[lang] ??
    THEME[token]?.[lang] ??
    OPTIP[token]?.[lang] ??
    REVIEW_TAG[token]?.[lang] ??
    EXTRA[token]?.[lang] ??
    token
  );
}

// A localized one-line gameplay hook, composed from tokens (so it reads
// naturally in zh/vi/en without hand-writing one per game per language).
export function gameOneLiner(g: Game, lang: Lang): string {
  const pace = g.pace >= 4 ? EXPERIENCE.fast[lang] : g.pace <= 2 ? M("慢節奏", "Nhịp chậm", "Relaxed pace")[lang] : M("節奏適中", "Nhịp vừa", "Balanced pace")[lang];
  const mech = g.mechanics[0] ? tokenLabel(g.mechanics[0], lang) : "";
  const theme = g.themes[0] ? THEME[g.themes[0]][lang] : "";
  const sep = lang === "en" ? " · " : "·";
  return [theme, mech, pace].filter(Boolean).join(sep);
}

// Short human reason for a rank/trend, per active market.
export function rankReason(g: Game, market: MarketId, lang: Lang): string {
  const trend = trendOf(g, market);
  const rank = rankOf(g, market);
  if (g.newRelease && rank <= 12) return M("本週首次進榜", "Lần đầu vào bảng tuần này", "First time on the board this week")[lang];
  if (trend >= 6) return M("近 7 日試玩次數增加", "Lượt chơi thử 7 ngày tăng", "Demo plays up over the last 7 days")[lang];
  if (trend <= -6) return M("近 7 日熱度回落", "Nhiệt 7 ngày giảm", "Cooling off over the last 7 days")[lang];
  if (g.favoriteCount > 12000) return M("收藏數成長", "Lượt lưu tăng", "Growing favorites")[lang];
  return M("熱度穩定", "Nhiệt ổn định", "Steady interest")[lang];
}
