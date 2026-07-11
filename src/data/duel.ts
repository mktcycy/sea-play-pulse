import type { Duel } from "@/lib/types";

// A short rotation of daily duels; the app picks one deterministically per day.
export const DUELS: Duel[] = [
  {
    id: "duel-1",
    date: "2026-07-10",
    gameA: "rocket-cashout",
    gameB: "candy-blast-deluxe",
    votesA: 1840,
    votesB: 1610,
    vnSplitA: 61,
    phSplitA: 44,
  },
  {
    id: "duel-2",
    date: "2026-07-09",
    gameA: "manila-bingo-live",
    gameB: "color-quest",
    votesA: 2210,
    votesB: 2530,
    vnSplitA: 55,
    phSplitA: 41,
  },
  {
    id: "duel-3",
    date: "2026-07-08",
    gameA: "god-of-wealth",
    gameB: "fortune-koi",
    votesA: 1975,
    votesB: 2088,
    vnSplitA: 47,
    phSplitA: 52,
  },
];

export function duelOfTheDay(): Duel {
  const dayIndex = Math.floor(Date.now() / 86400000);
  return DUELS[dayIndex % DUELS.length];
}
