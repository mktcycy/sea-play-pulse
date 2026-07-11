// Shared domain types for SEA Play Pulse.

export type MarketId = "vn" | "ph";
export type Lang = "zh" | "vi" | "en";

export type Orientation = "portrait" | "landscape" | "both";

// Game shape — matches the product brief exactly.
export type Game = {
  id: string;
  name: string;
  provider: string;
  category: string;
  releaseDate: string;
  image: string;
  markets: string[];
  languages: string[];
  orientation: Orientation;
  mobileFriendly: boolean;
  demoAvailable: boolean;
  pace: number; // 1-5, how fast a round feels
  winFrequency: number; // 1-5
  bigWinPotential: number; // 1-5
  bonusRichness: number; // 1-5
  difficulty: number; // 1-5, higher = harder
  mobileExperience: number; // 1-5
  rating: number; // 0-5 player rating
  replayRate: number; // 0-100 (%)
  demoCount24h: number;
  favoriteCount: number;
  vietnamRank: number;
  philippinesRank: number;
  vietnamTrend: number; // rank change vs last week (+ = climbed)
  philippinesTrend: number;
  tags: string[];
  description: string;
  recommendedFor: string[];
  notRecommendedFor: string[];
  trendData: number[]; // last 7 days heat
};

// A named ranking board on the Pulse page.
export type BoardId =
  | "todayDemo"
  | "weekRising"
  | "mostFavorited"
  | "highestReplay"
  | "mobileHot"
  | "newHot"
  | "vnHot"
  | "phHot";

export type Board = {
  id: BoardId;
  // sort/derive the ranked games for a given market
  sort: (a: Game, b: Game, market: MarketId) => number;
  filter?: (g: Game, market: MarketId) => boolean;
};

// Quiz
export type QuizOption = {
  value: string;
  // maps a player answer onto game attribute preferences
  weight: Partial<Record<QuizAxis, number>>;
  tag?: string; // preferred category or tag
};
export type QuizAxis =
  | "pace"
  | "winFrequency"
  | "bigWinPotential"
  | "bonusRichness"
  | "difficulty"
  | "shortSession";
export type QuizQuestion = {
  id: string;
  options: QuizOption[];
};
export type PlayerType = {
  id: string;
  tags: string[];
  // rough attribute fingerprint used to score games (1-5 space)
  fingerprint: Partial<Record<QuizAxis, number>>;
};

// Platform checker (PH)
export type CheckStatus = "found" | "notFound" | "review";
export type CheckerRecord = {
  brand: string;
  aliases: string[];
  url?: string;
  status: CheckStatus;
  source: string;
  lastChecked: string;
};

// Daily duel
export type Duel = {
  id: string;
  date: string;
  gameA: string; // game id
  gameB: string;
  votesA: number;
  votesB: number;
  vnSplitA: number; // % preferring A among VN players
  phSplitA: number;
};
