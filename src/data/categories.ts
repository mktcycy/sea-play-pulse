import type { Lang, MarketId } from "@/lib/types";

export type CategoryId =
  | "slot"
  | "bingo"
  | "colorGame"
  | "liveCasino"
  | "poker"
  | "crash"
  | "fishing";

export type Category = {
  id: CategoryId;
  label: Record<Lang, string>;
  icon: string; // lucide icon name
  color: string; // accent hex used on chips/thumbnails
  // relative popularity weight per market (0-1), shapes ranks & "trending" feel
  weight: Record<MarketId, number>;
};

export const CATEGORIES: Category[] = [
  {
    id: "slot",
    label: { zh: "老虎機 Slot", vi: "Slot", en: "Slot" },
    icon: "Cherry",
    color: "#F59E0B",
    weight: { vn: 0.95, ph: 0.85 },
  },
  {
    id: "fishing",
    label: { zh: "捕魚", vi: "Bắn cá", en: "Fishing" },
    icon: "Fish",
    color: "#22D3EE",
    weight: { vn: 0.9, ph: 0.6 },
  },
  {
    id: "bingo",
    label: { zh: "賓果 Bingo", vi: "Bingo", en: "Bingo" },
    icon: "Grid3x3",
    color: "#A78BFA",
    weight: { vn: 0.45, ph: 0.92 },
  },
  {
    id: "colorGame",
    label: { zh: "顏色遊戲", vi: "Color Game", en: "Color Game" },
    icon: "Palette",
    color: "#F472B6",
    weight: { vn: 0.3, ph: 0.95 },
  },
  {
    id: "liveCasino",
    label: { zh: "真人遊戲", vi: "Casino trực tiếp", en: "Live Casino" },
    icon: "Radio",
    color: "#34D399",
    weight: { vn: 0.7, ph: 0.8 },
  },
  {
    id: "crash",
    label: { zh: "Crash", vi: "Crash", en: "Crash" },
    icon: "Rocket",
    color: "#FB7185",
    weight: { vn: 0.75, ph: 0.7 },
  },
  {
    id: "poker",
    label: { zh: "撲克 Poker", vi: "Poker", en: "Poker" },
    icon: "Spade",
    color: "#60A5FA",
    weight: { vn: 0.55, ph: 0.65 },
  },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export function categoryLabel(id: string, lang: Lang): string {
  const c = CATEGORY_MAP[id as CategoryId];
  return c ? c.label[lang] : id;
}
export function categoryColor(id: string): string {
  return CATEGORY_MAP[id as CategoryId]?.color ?? "#26E0C0";
}
export function categoryIcon(id: string): string {
  return CATEGORY_MAP[id as CategoryId]?.icon ?? "Gamepad2";
}
