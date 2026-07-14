// Shared domain types for SEA Play Pulse.

export type MarketId = "vn" | "ph";
export type Lang = "zh" | "vi" | "en";

export type Orientation = "portrait" | "landscape" | "both";

// How a game can be tried, and whether it's currently playable.
export type DemoType = "onsite" | "official"; // 站內試玩 / 前往官方 Demo
export type DemoStatus =
  | "ok" // 可正常試玩
  | "maintenance" // 維護中
  | "mobileUnsupported" // 手機不支援
  | "regionLocked" // 地區限制
  | "linkBroken"; // 外部連結失效

// Game shape — original brief fields plus optimization fields (all derived in
// build(), so the curated SEEDS stay small and there is one source of truth).
export type Game = {
  id: string;
  slug: string;
  name: string;
  provider: string;
  category: string;
  themes: string[]; // theme tokens (animal/fortune/adventure/egypt/candy/pirate…)
  mechanics: string[]; // gameplay-mechanic tokens (holdWin/megaways/cluster…)
  experienceTags: string[]; // experience tokens (newbie/simple/fast/special/rich)
  releaseDate: string;
  image: string;
  previewVideo: string | null; // placeholder for a 15-30s preview clip
  markets: string[];
  languages: string[];
  orientation: Orientation;
  visualStyle: string; // visual-style token
  mobileFriendly: boolean;
  demoAvailable: boolean;
  demoType: DemoType;
  demoUrl: string; // official demo URL when demoType === "official"
  demoStatus: DemoStatus;
  shortDescription: string; // one-line gameplay hook
  quickHighlights: string[]; // "3 個特色快速看懂"
  operationTips: string[]; // 操作方式 tokens
  suitableFor: string[]; // experience tokens a game suits
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
  featured: boolean;
  newRelease: boolean;
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

// Player feedback + AI-style summary (mock; structured for a future API).
export type Sentiment = "good" | "ok" | "bad";
export type Review = {
  id: string;
  gameId: string;
  rating: number; // 1-5 derived from sentiment
  sentiment: Sentiment;
  tags: string[]; // feedback tokens (niceVisuals/simpleControls/fastPace…)
  comment: string;
  createdAt: string;
  status: "published";
};
export type ReviewSummary = {
  gameId: string;
  generated: boolean; // false when < MIN reviews
  overall: string;
  oftenMentioned: string[];
  watchOut: string[];
  suitableFor: string;
  basedOn: number;
  updatedAt: string;
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

// Real betting-platform checker (public-info lookup — NOT a game demo check).
export type RiskStatus = "confirmed" | "caution" | "insufficient" | "highRisk";
export type CheckerSource = { name: string; url?: string };
export type CheckerRecord = {
  id: string;
  platformName: string;
  domains: string[]; // official / known domains
  aliases: string[]; // alternate names for matching
  operator: string; // operating company
  license: string; // license number / name
  licenseStatus: string; // e.g. 有效 / 已過期 / 未知
  regulator: string; // regulator body
  domainAge: string; // when the domain was created
  warnings: string[]; // public warning notes
  impersonationRisk: boolean; // known look-alike / impersonation domains exist
  publicReports: number; // public warning-record count
  playerReports: number; // player-submitted report count
  lastCheckedAt: string;
  sources: CheckerSource[];
  riskStatus: RiskStatus;
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
