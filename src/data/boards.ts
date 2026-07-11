import type { Board, BoardId, Game, MarketId } from "@/lib/types";
import { rankOf, trendOf } from "@/lib/format";

const daysSince = (iso: string) => (Date.now() - new Date(iso).getTime()) / 86400000;

// Ordered list of boards shown on the Pulse page.
export const BOARD_ORDER: BoardId[] = [
  "todayDemo",
  "weekRising",
  "mostFavorited",
  "highestReplay",
  "mobileHot",
  "newHot",
  "vnHot",
  "phHot",
];

export const BOARDS: Record<BoardId, Board> = {
  todayDemo: {
    id: "todayDemo",
    sort: (a, b) => b.demoCount24h - a.demoCount24h,
  },
  weekRising: {
    id: "weekRising",
    sort: (a, b, m) => trendOf(b, m) - trendOf(a, m),
    filter: (g, m) => trendOf(g, m) > 0,
  },
  mostFavorited: {
    id: "mostFavorited",
    sort: (a, b) => b.favoriteCount - a.favoriteCount,
  },
  highestReplay: {
    id: "highestReplay",
    sort: (a, b) => b.replayRate - a.replayRate,
  },
  mobileHot: {
    id: "mobileHot",
    sort: (a, b, m) => b.mobileExperience - a.mobileExperience || rankOf(a, m) - rankOf(b, m),
    filter: (g) => g.mobileFriendly,
  },
  newHot: {
    id: "newHot",
    sort: (a, b, m) => rankOf(a, m) - rankOf(b, m),
    filter: (g) => daysSince(g.releaseDate) <= 60,
  },
  vnHot: {
    id: "vnHot",
    sort: (a, b) => a.vietnamRank - b.vietnamRank,
    filter: (g) => g.markets.includes("vn"),
  },
  phHot: {
    id: "phHot",
    sort: (a, b) => a.philippinesRank - b.philippinesRank,
    filter: (g) => g.markets.includes("ph"),
  },
};

export function rankedFor(board: Board, games: Game[], market: MarketId): Game[] {
  return games
    .filter((g) => (board.filter ? board.filter(g, market) : true))
    .sort((a, b) => board.sort(a, b, market));
}
