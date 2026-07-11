import type { Game, MarketId } from "./types";

// Deterministic pseudo-random in [0,1) from a string seed — keeps mock data
// stable across reloads without shipping thousands of hand-written numbers.
export function seededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export function formatInt(n: number): string {
  return n.toLocaleString("en-US");
}

// Rank & trend helpers, resolved per active market.
export function rankOf(g: Game, market: MarketId): number {
  return market === "vn" ? g.vietnamRank : g.philippinesRank;
}
export function trendOf(g: Game, market: MarketId): number {
  return market === "vn" ? g.vietnamTrend : g.philippinesTrend;
}

// A single 0-100 "heat score", derived so it reads as live and consistent.
export function heatScore(g: Game, market: MarketId): number {
  const rank = rankOf(g, market);
  const trend = trendOf(g, market);
  const base = Math.max(0, 100 - (rank - 1) * 3.4);
  const momentum = Math.max(-6, Math.min(10, trend * 0.9));
  const replay = (g.replayRate - 55) * 0.15;
  return Math.round(Math.max(1, Math.min(100, base + momentum + replay)));
}

// Percentage change of market heat over the last week, for copy like "+31%".
export function weekHeatDelta(g: Game): number {
  const d = g.trendData;
  if (d.length < 2) return 0;
  const first = d[0] || 1;
  const last = d[d.length - 1];
  return Math.round(((last - first) / first) * 100);
}

export function isInMarket(g: Game, market: MarketId): boolean {
  return g.markets.includes(market);
}
