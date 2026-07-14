import type { DemoStatus, DemoType, Game, MarketId } from "@/lib/types";
import { seededRandom } from "@/lib/format";
import { CATEGORY_MAP, type CategoryId } from "./categories";

// Fixed "today" so newRelease / rotations are deterministic in the demo.
const NOW = new Date("2026-07-14").getTime();

const THEME_BY_TAG: Record<string, string> = {
  animal: "animal", fortune: "fortune", adventure: "adventure",
  egypt: "egypt", candy: "candy", sport: "sport", classic: "classic",
};
const PIRATE_GAMES = new Set(["deep-sea-hunter", "mega-fisher-9"]);
// A few games carry non-ok demo status to exercise the status UI.
const DEMO_STATUS_OVERRIDE: Record<string, DemoStatus> = {
  "video-poker-jacks": "maintenance",
  "live-roulette-neo": "regionLocked",
  "mega-fisher-9": "linkBroken",
  "texas-holdem-club": "mobileUnsupported",
};

function deriveThemes(s: Seed): string[] {
  const t = s.tags.filter((x) => THEME_BY_TAG[x]).map((x) => THEME_BY_TAG[x]);
  if (PIRATE_GAMES.has(s.id)) t.push("pirate");
  if (t.length === 0) t.push(s.category === "fishing" ? "animal" : "classic");
  return [...new Set(t)];
}

function deriveMechanics(s: Seed): string[] {
  const m: string[] = [];
  if (s.tags.includes("cascade")) m.push("cascading");
  if (s.category === "fishing") m.push("shooting");
  if (s.category === "colorGame" || s.category === "crash") m.push("clickPlay");
  if (s.category === "slot") {
    // deterministic slot mechanic by seed
    const pool = ["holdWin", "megaways", "cluster", "cascading", "freeSpins"];
    const pick = pool[Math.floor(seededRandom(s.id + "mech")() * pool.length)];
    m.push(pick);
  }
  if (s.bonusRichness >= 3 && !m.includes("freeSpins")) m.push("freeSpins");
  if (m.length === 0) m.push("clickPlay");
  return [...new Set(m)].slice(0, 3);
}

function deriveExperience(s: Seed): string[] {
  const e: string[] = [];
  if (s.difficulty <= 1) { e.push("newbie"); e.push("simple"); }
  if (s.pace >= 4) e.push("fast");
  if (["fishing", "liveCasino", "crash"].includes(s.category)) e.push("special");
  if (s.bonusRichness >= 4) e.push("rich");
  if (e.length === 0) e.push("simple");
  return [...new Set(e)].slice(0, 3);
}

function deriveOps(s: Seed): string[] {
  switch (s.category) {
    case "fishing": return ["tapShoot", "mobileSwipe"];
    case "slot": return ["spaceSpin", "autoSpin", "mobileTap"];
    case "crash": return ["tapCashout", "autoSpin"];
    case "colorGame": return ["tapPick", "mobileTap"];
    case "liveCasino": return ["tapBet", "mobileTap"];
    case "poker": return ["tapAction", "mobileTap"];
    default: return ["mobileTap"];
  }
}

function visualStyleOf(themes: string[]): string {
  if (themes.includes("candy") || themes.includes("animal")) return "cute";
  if (themes.includes("fortune")) return "luxe";
  if (themes.includes("egypt") || themes.includes("adventure") || themes.includes("pirate")) return "epic";
  if (themes.includes("sport")) return "dynamic";
  return "neon";
}

function highlightsOf(s: Seed, mechanics: string[], themes: string[]): string[] {
  const h: string[] = [];
  if (s.pace >= 4) h.push("fast");
  if (s.bonusRichness >= 4) h.push("manyBonus");
  if (s.difficulty <= 1) h.push("easy");
  if (s.bigWinPotential >= 4) h.push("bigWin");
  if (mechanics[0]) h.push(mechanics[0]);
  if (themes[0]) h.push(themes[0]);
  return [...new Set(h)].slice(0, 3);
}

// Curated per-game fields; the rest is derived deterministically in build().
type Seed = {
  id: string;
  name: string;
  provider: string;
  category: CategoryId;
  releaseDate: string;
  markets: MarketId[];
  orientation: Game["orientation"];
  pace: number;
  winFrequency: number;
  bigWinPotential: number;
  bonusRichness: number;
  difficulty: number;
  mobileExperience: number;
  tags: string[];
  description: string;
  recommendedFor: string[];
  notRecommendedFor: string[];
};

const S = (s: Seed) => s;

const SEEDS: Seed[] = [
  S({
    id: "fortune-koi",
    name: "Fortune Koi",
    provider: "Dragonsoft",
    category: "fishing",
    releaseDate: "2026-05-18",
    markets: ["vn", "ph"],
    orientation: "landscape",
    pace: 5, winFrequency: 4, bigWinPotential: 4, bonusRichness: 3, difficulty: 2, mobileExperience: 5,
    tags: ["fast", "animal", "freeDemo", "manyBonus"],
    description: "Rapid-fire fishing arena where boss koi drop chained multipliers.",
    recommendedFor: ["fast", "manyBonus"],
    notRecommendedFor: ["lowVol"],
  }),
  S({
    id: "mega-fisher-9",
    name: "Mega Fisher 9",
    provider: "OceanPlay",
    category: "fishing",
    releaseDate: "2026-03-02",
    markets: ["vn", "ph"],
    orientation: "landscape",
    pace: 4, winFrequency: 4, bigWinPotential: 3, bonusRichness: 3, difficulty: 3, mobileExperience: 4,
    tags: ["skill", "animal", "freeDemo"],
    description: "Aim-and-shoot fishing with weapon upgrades and shared boss events.",
    recommendedFor: ["skill", "social"],
    notRecommendedFor: ["easy"],
  }),
  S({
    id: "candy-blast-deluxe",
    name: "Candy Blast Deluxe",
    provider: "Sweet Reels",
    category: "slot",
    releaseDate: "2026-06-05",
    markets: ["vn", "ph"],
    orientation: "portrait",
    pace: 4, winFrequency: 4, bigWinPotential: 4, bonusRichness: 5, difficulty: 1, mobileExperience: 5,
    tags: ["candy", "cascade", "portrait", "freeDemo", "manyBonus"],
    description: "A cascading candy slot: matches vanish and new symbols tumble in for combo wins.",
    recommendedFor: ["cascade", "manyBonus"],
    notRecommendedFor: ["lowVol"],
  }),
  S({
    id: "god-of-wealth",
    name: "God of Wealth",
    provider: "Dragonsoft",
    category: "slot",
    releaseDate: "2026-02-14",
    markets: ["vn", "ph"],
    orientation: "portrait",
    pace: 3, winFrequency: 3, bigWinPotential: 5, bonusRichness: 4, difficulty: 2, mobileExperience: 4,
    tags: ["fortune", "highVol", "bigWin", "portrait", "freeDemo"],
    description: "Fortune-themed slot with a stacked wild god and a high-multiplier free-spin round.",
    recommendedFor: ["bigWin", "highVol"],
    notRecommendedFor: ["lowVol", "easy"],
  }),
  S({
    id: "pharaohs-path",
    name: "Pharaoh's Path",
    provider: "NileWorks",
    category: "slot",
    releaseDate: "2026-01-20",
    markets: ["vn", "ph"],
    orientation: "portrait",
    pace: 3, winFrequency: 3, bigWinPotential: 5, bonusRichness: 4, difficulty: 3, mobileExperience: 4,
    tags: ["egypt", "adventure", "highVol", "bigWin", "freeDemo"],
    description: "Expanding-symbol Egyptian adventure; one lucky symbol can fill the whole reel.",
    recommendedFor: ["bigWin", "adventure"],
    notRecommendedFor: ["lowVol"],
  }),
  S({
    id: "lucky-lantern",
    name: "Lucky Lantern",
    provider: "Sweet Reels",
    category: "slot",
    releaseDate: "2025-12-08",
    markets: ["vn", "ph"],
    orientation: "portrait",
    pace: 3, winFrequency: 4, bigWinPotential: 3, bonusRichness: 3, difficulty: 1, mobileExperience: 5,
    tags: ["fortune", "lowVol", "easy", "portrait", "freeDemo"],
    description: "Gentle lantern-festival slot with frequent small wins and a friendly pace.",
    recommendedFor: ["lowVol", "easy"],
    notRecommendedFor: ["bigWin"],
  }),
  S({
    id: "safari-riches",
    name: "Safari Riches",
    provider: "WildLine",
    category: "slot",
    releaseDate: "2026-04-11",
    markets: ["vn", "ph"],
    orientation: "both",
    pace: 4, winFrequency: 3, bigWinPotential: 4, bonusRichness: 4, difficulty: 2, mobileExperience: 4,
    tags: ["animal", "adventure", "manyBonus", "freeDemo"],
    description: "Savanna slot with a pick-a-beast bonus and stampede re-spins.",
    recommendedFor: ["adventure", "manyBonus"],
    notRecommendedFor: ["lowVol"],
  }),
  S({
    id: "neon-sevens",
    name: "Neon Sevens",
    provider: "RetroSpin",
    category: "slot",
    releaseDate: "2025-11-02",
    markets: ["vn", "ph"],
    orientation: "portrait",
    pace: 5, winFrequency: 4, bigWinPotential: 3, bonusRichness: 2, difficulty: 1, mobileExperience: 5,
    tags: ["classic", "fast", "easy", "portrait", "freeDemo"],
    description: "Three-reel classic with a modern neon look and lightning-fast rounds.",
    recommendedFor: ["classic", "fast"],
    notRecommendedFor: ["manyBonus"],
  }),
  S({
    id: "manila-bingo-live",
    name: "Manila Bingo Live",
    provider: "BarkadaGames",
    category: "bingo",
    releaseDate: "2026-05-30",
    markets: ["ph", "vn"],
    orientation: "portrait",
    pace: 2, winFrequency: 4, bigWinPotential: 3, bonusRichness: 3, difficulty: 1, mobileExperience: 5,
    tags: ["social", "easy", "portrait", "freeDemo", "liveHost"],
    description: "Community bingo with a live caller and chat; win patterns light up in real time.",
    recommendedFor: ["social", "easy"],
    notRecommendedFor: ["fast"],
  }),
  S({
    id: "barrio-bingo",
    name: "Barrio Bingo",
    provider: "BarkadaGames",
    category: "bingo",
    releaseDate: "2026-02-27",
    markets: ["ph"],
    orientation: "portrait",
    pace: 2, winFrequency: 4, bigWinPotential: 2, bonusRichness: 2, difficulty: 1, mobileExperience: 5,
    tags: ["social", "easy", "lowVol", "portrait", "freeDemo"],
    description: "Neighborhood-style bingo built for barkada nights and easy multi-card play.",
    recommendedFor: ["social", "lowVol"],
    notRecommendedFor: ["bigWin"],
  }),
  S({
    id: "color-quest",
    name: "Color Quest",
    provider: "Perya Studio",
    category: "colorGame",
    releaseDate: "2026-06-12",
    markets: ["ph"],
    orientation: "portrait",
    pace: 5, winFrequency: 4, bigWinPotential: 3, bonusRichness: 2, difficulty: 1, mobileExperience: 5,
    tags: ["fast", "easy", "quickRound", "portrait", "freeDemo"],
    description: "Digital perya color game: pick a color, roll the dice, results in seconds.",
    recommendedFor: ["fast", "easy"],
    notRecommendedFor: ["skill"],
  }),
  S({
    id: "perya-colors-2",
    name: "Perya Colors 2",
    provider: "Perya Studio",
    category: "colorGame",
    releaseDate: "2026-04-22",
    markets: ["ph", "vn"],
    orientation: "portrait",
    pace: 5, winFrequency: 3, bigWinPotential: 4, bonusRichness: 2, difficulty: 1, mobileExperience: 4,
    tags: ["fast", "quickRound", "highVol", "portrait", "freeDemo"],
    description: "A faster, higher-stakes color game with a bonus color that pays extra.",
    recommendedFor: ["fast", "bigWin"],
    notRecommendedFor: ["lowVol"],
  }),
  S({
    id: "live-baccarat-royal",
    name: "Live Baccarat Royal",
    provider: "StudioLux",
    category: "liveCasino",
    releaseDate: "2026-03-19",
    markets: ["vn", "ph"],
    orientation: "landscape",
    pace: 3, winFrequency: 4, bigWinPotential: 3, bonusRichness: 2, difficulty: 2, mobileExperience: 4,
    tags: ["liveHost", "classic", "social", "freeDemo"],
    description: "Real-dealer baccarat streamed in HD with clean side-bet stats.",
    recommendedFor: ["classic", "liveHost"],
    notRecommendedFor: ["fast"],
  }),
  S({
    id: "live-roulette-neo",
    name: "Live Roulette Neo",
    provider: "StudioLux",
    category: "liveCasino",
    releaseDate: "2026-01-09",
    markets: ["vn", "ph"],
    orientation: "landscape",
    pace: 3, winFrequency: 3, bigWinPotential: 4, bonusRichness: 2, difficulty: 2, mobileExperience: 4,
    tags: ["liveHost", "classic", "freeDemo"],
    description: "European roulette with a live host and a heat-map of recent numbers.",
    recommendedFor: ["classic", "liveHost"],
    notRecommendedFor: ["easy"],
  }),
  S({
    id: "dragon-tiger-live",
    name: "Dragon Tiger Live",
    provider: "StudioLux",
    category: "liveCasino",
    releaseDate: "2026-05-05",
    markets: ["vn", "ph"],
    orientation: "landscape",
    pace: 5, winFrequency: 4, bigWinPotential: 3, bonusRichness: 1, difficulty: 1, mobileExperience: 4,
    tags: ["liveHost", "fast", "quickRound", "easy", "freeDemo"],
    description: "One-card-each showdown: the fastest live table to learn and play.",
    recommendedFor: ["fast", "easy"],
    notRecommendedFor: ["manyBonus"],
  }),
  S({
    id: "rocket-cashout",
    name: "Rocket Cashout",
    provider: "SkyBet Labs",
    category: "crash",
    releaseDate: "2026-06-01",
    markets: ["vn", "ph"],
    orientation: "portrait",
    pace: 5, winFrequency: 3, bigWinPotential: 5, bonusRichness: 2, difficulty: 3, mobileExperience: 5,
    tags: ["fast", "highVol", "bigWin", "skill", "portrait", "freeDemo"],
    description: "Cash out before the rocket blows — nerve and timing decide the multiplier.",
    recommendedFor: ["fast", "bigWin", "skill"],
    notRecommendedFor: ["lowVol"],
  }),
  S({
    id: "aviator-skies",
    name: "Aviator Skies",
    provider: "SkyBet Labs",
    category: "crash",
    releaseDate: "2026-02-08",
    markets: ["vn", "ph"],
    orientation: "portrait",
    pace: 5, winFrequency: 3, bigWinPotential: 5, bonusRichness: 1, difficulty: 3, mobileExperience: 5,
    tags: ["fast", "highVol", "bigWin", "skill", "portrait", "freeDemo"],
    description: "Watch the plane climb, grab your win before it flies off. Auto-cashout supported.",
    recommendedFor: ["fast", "highVol"],
    notRecommendedFor: ["lowVol", "easy"],
  }),
  S({
    id: "texas-holdem-club",
    name: "Texas Hold'em Club",
    provider: "CardHouse",
    category: "poker",
    releaseDate: "2026-03-28",
    markets: ["vn", "ph"],
    orientation: "both",
    pace: 2, winFrequency: 3, bigWinPotential: 4, bonusRichness: 2, difficulty: 4, mobileExperience: 4,
    tags: ["skill", "social", "classic", "freeDemo"],
    description: "Ring games and quick tournaments with clear odds hints for learners.",
    recommendedFor: ["skill", "social"],
    notRecommendedFor: ["fast", "easy"],
  }),
  S({
    id: "video-poker-jacks",
    name: "Video Poker Jacks+",
    provider: "CardHouse",
    category: "poker",
    releaseDate: "2025-12-19",
    markets: ["vn", "ph"],
    orientation: "portrait",
    pace: 4, winFrequency: 4, bigWinPotential: 3, bonusRichness: 2, difficulty: 3, mobileExperience: 4,
    tags: ["skill", "classic", "portrait", "freeDemo"],
    description: "Solo Jacks-or-Better with a strategy hint toggle for every hand.",
    recommendedFor: ["skill", "classic"],
    notRecommendedFor: ["social"],
  }),
  S({
    id: "sports-slam-slot",
    name: "Sports Slam Slot",
    provider: "WildLine",
    category: "slot",
    releaseDate: "2026-06-08",
    markets: ["vn", "ph"],
    orientation: "portrait",
    pace: 4, winFrequency: 4, bigWinPotential: 4, bonusRichness: 4, difficulty: 2, mobileExperience: 5,
    tags: ["sport", "fast", "manyBonus", "portrait", "freeDemo"],
    description: "Stadium slot with a penalty-shootout bonus and momentum multipliers.",
    recommendedFor: ["sport", "manyBonus"],
    notRecommendedFor: ["lowVol"],
  }),
  S({
    id: "deep-sea-hunter",
    name: "Deep Sea Hunter",
    provider: "OceanPlay",
    category: "fishing",
    releaseDate: "2026-05-24",
    markets: ["vn", "ph"],
    orientation: "landscape",
    pace: 5, winFrequency: 4, bigWinPotential: 4, bonusRichness: 3, difficulty: 3, mobileExperience: 4,
    tags: ["fast", "animal", "skill", "bigWin", "freeDemo"],
    description: "Deep-water fishing with rare bosses and a laser cannon power-up.",
    recommendedFor: ["fast", "bigWin"],
    notRecommendedFor: ["easy"],
  }),
  S({
    id: "jungle-tumble",
    name: "Jungle Tumble",
    provider: "Sweet Reels",
    category: "slot",
    releaseDate: "2026-06-15",
    markets: ["vn", "ph"],
    orientation: "portrait",
    pace: 4, winFrequency: 5, bigWinPotential: 3, bonusRichness: 4, difficulty: 1, mobileExperience: 5,
    tags: ["animal", "cascade", "easy", "portrait", "freeDemo", "manyBonus"],
    description: "Bright jungle slot with tumbling wins and a growing win-streak meter.",
    recommendedFor: ["cascade", "easy"],
    notRecommendedFor: ["highVol"],
  }),
];

function clampRank(list: Game[], market: MarketId) {
  // Assign 1..N ranks among games that are actually in this market, so each
  // market's ranks form a clean permutation. Games not in the market stay 999.
  const scored = list
    .filter((g) => g.markets.includes(market))
    .map((g) => {
      const rnd = seededRandom(g.id + market);
    const cat = CATEGORY_MAP[g.category as CategoryId];
    const heat =
      cat.weight[market] * 55 +
      g.mobileExperience * 4 +
      g.winFrequency * 2 +
      (g.markets[0] === market ? 6 : 0) +
      rnd() * 22;
    return { g, heat };
  });
  scored.sort((a, b) => b.heat - a.heat);
  scored.forEach(({ g }, i) => {
    if (market === "vn") g.vietnamRank = i + 1;
    else g.philippinesRank = i + 1;
  });
}

function build(): Game[] {
  const games: Game[] = SEEDS.map((s) => {
    const rnd = seededRandom(s.id);
    const rating = +(3.6 + rnd() * 1.25).toFixed(1);
    const replayRate = Math.round(48 + s.winFrequency * 4 + rnd() * 20);
    const popularity = 0.4 + rnd() * 0.6;
    const demoCount24h = Math.round(600 + popularity * 4200 + s.mobileExperience * 120);
    const favoriteCount = Math.round(1200 + popularity * 15000);
    // 7-day heat wave, trending upward-ish but with variation
    const base = 40 + rnd() * 30;
    const trendData = Array.from({ length: 7 }, (_, i) => {
      const wave = Math.sin(i / 2 + rnd() * 3) * 8;
      const drift = (i - 3) * (rnd() * 4 - 1.2);
      return Math.max(8, Math.round(base + wave + drift));
    });
    const themes = deriveThemes(s);
    const mechanics = deriveMechanics(s);
    const experienceTags = deriveExperience(s);
    const ageDays = (NOW - new Date(s.releaseDate).getTime()) / 86400000;
    const demoType: DemoType = rnd() < 0.55 ? "onsite" : "official";
    const demoStatus: DemoStatus = DEMO_STATUS_OVERRIDE[s.id] ?? "ok";
    return {
      id: s.id,
      slug: s.id,
      name: s.name,
      provider: s.provider,
      category: s.category,
      themes,
      mechanics,
      experienceTags,
      releaseDate: s.releaseDate,
      image: "", // procedural thumbnail via <GameThumb />
      previewVideo: null, // demo: static preview via <GameThumb />
      markets: s.markets,
      languages: s.markets.includes("vn") ? ["vi", "en"] : ["en"],
      orientation: s.orientation,
      visualStyle: visualStyleOf(themes),
      mobileFriendly: s.mobileExperience >= 3,
      demoAvailable: true,
      demoType,
      demoUrl: demoType === "official" ? `https://demo.example/${s.provider.toLowerCase().replace(/\s+/g, "-")}/${s.id}` : "",
      demoStatus,
      shortDescription: s.description.split(/[.;]/)[0].trim(),
      quickHighlights: highlightsOf(s, mechanics, themes),
      operationTips: deriveOps(s),
      suitableFor: experienceTags,
      pace: s.pace,
      winFrequency: s.winFrequency,
      bigWinPotential: s.bigWinPotential,
      bonusRichness: s.bonusRichness,
      difficulty: s.difficulty,
      mobileExperience: s.mobileExperience,
      rating,
      replayRate: Math.min(92, replayRate),
      demoCount24h,
      favoriteCount,
      featured: rnd() < 0.2,
      newRelease: ageDays <= 60,
      vietnamRank: 999,
      philippinesRank: 999,
      vietnamTrend: Math.round((rnd() * 2 - 0.7) * 14),
      philippinesTrend: Math.round((rnd() * 2 - 0.7) * 14),
      tags: s.tags,
      description: s.description,
      recommendedFor: s.recommendedFor,
      notRecommendedFor: s.notRecommendedFor,
      trendData,
    } satisfies Game;
  });

  clampRank(games, "vn");
  clampRank(games, "ph");
  return games;
}

export const GAMES: Game[] = build();

export const GAME_MAP: Record<string, Game> = Object.fromEntries(GAMES.map((g) => [g.id, g]));

export function gamesInMarket(market: MarketId): Game[] {
  return GAMES.filter((g) => g.markets.includes(market));
}

export function getGame(id: string): Game | undefined {
  return GAME_MAP[id];
}

// Today's featured game — rotates daily (demo-stable within a day).
export function todaysPick(market: MarketId): Game {
  const pool = gamesInMarket(market);
  const day = Math.floor(Date.now() / 86400000);
  return pool[day % pool.length];
}

// A random currently-playable game (for the "隨機試玩一款" button).
export function randomPlayable(market: MarketId, excludeId?: string): Game {
  const pool = gamesInMarket(market).filter((g) => g.demoStatus === "ok" && g.id !== excludeId);
  const src = pool.length ? pool : gamesInMarket(market);
  return src[Math.floor(Math.random() * src.length)];
}
