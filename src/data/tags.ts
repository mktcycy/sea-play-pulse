import type { Lang } from "@/lib/types";

// Player-facing tags as tokens, localized per market language.
// VN examples from the brief: Chơi nhanh / Dễ chơi / Nhiều vòng thưởng /
// Thưởng lớn / Chơi dọc / Chơi thử miễn phí.
export const TAGS: Record<string, Record<Lang, string>> = {
  fast: { zh: "快節奏", vi: "Chơi nhanh", en: "Fast play" },
  easy: { zh: "簡單易上手", vi: "Dễ chơi", en: "Easy to play" },
  manyBonus: { zh: "多重獎勵", vi: "Nhiều vòng thưởng", en: "Many bonuses" },
  bigWin: { zh: "高倍潛力", vi: "Thưởng lớn", en: "Big-win potential" },
  portrait: { zh: "直式手機玩", vi: "Chơi dọc", en: "Portrait mobile" },
  freeDemo: { zh: "免費試玩", vi: "Chơi thử miễn phí", en: "Free demo" },
  classic: { zh: "經典玩法", vi: "Cổ điển", en: "Classic" },
  social: { zh: "社群同樂", vi: "Chơi cùng bạn", en: "Social" },
  highVol: { zh: "高波動", vi: "Biến động cao", en: "High volatility" },
  lowVol: { zh: "穩定小獎", vi: "Ổn định", en: "Steady wins" },
  cascade: { zh: "連消玩法", vi: "Nổ chuỗi", en: "Cascading" },
  liveHost: { zh: "真人主持", vi: "Người chơi thật", en: "Live host" },
  skill: { zh: "需要技巧", vi: "Cần kỹ năng", en: "Skill-based" },
  quickRound: { zh: "短局速玩", vi: "Ván ngắn", en: "Quick rounds" },
  fortune: { zh: "財神主題", vi: "Thần tài", en: "Fortune theme" },
  animal: { zh: "動物主題", vi: "Động vật", en: "Animal theme" },
  candy: { zh: "糖果主題", vi: "Kẹo ngọt", en: "Candy theme" },
  egypt: { zh: "古埃及", vi: "Ai Cập", en: "Ancient Egypt" },
  adventure: { zh: "冒險探索", vi: "Phiêu lưu", en: "Adventure" },
  sport: { zh: "運動主題", vi: "Thể thao", en: "Sports theme" },
};

export function tagLabel(token: string, lang: Lang): string {
  return TAGS[token]?.[lang] ?? token;
}
