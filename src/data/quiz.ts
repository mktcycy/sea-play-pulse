import type { Game, Lang, PlayerType, QuizAxis, QuizQuestion } from "@/lib/types";

// Questions use plain-language options; each maps onto game attributes.
export const QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    options: [
      { value: "q1.a", weight: { pace: 5, shortSession: 3 } },
      { value: "q1.b", weight: { pace: 1 } },
      { value: "q1.c", weight: { pace: 3 } },
    ],
  },
  {
    id: "q2",
    options: [
      { value: "q2.a", weight: { winFrequency: 5, bigWinPotential: 2 } },
      { value: "q2.b", weight: { bigWinPotential: 5, winFrequency: 1 } },
      { value: "q2.c", weight: { bonusRichness: 5 } },
    ],
  },
  {
    id: "q3", // theme / category preference — options are categories
    options: [
      { value: "slot", weight: {}, tag: "slot" },
      { value: "bingo", weight: { winFrequency: 4 }, tag: "bingo" },
      { value: "liveCasino", weight: {}, tag: "liveCasino" },
      { value: "fishing", weight: { pace: 4 }, tag: "fishing" },
      { value: "crash", weight: { pace: 5, bigWinPotential: 4 }, tag: "crash" },
      { value: "colorGame", weight: { pace: 5 }, tag: "colorGame" },
      { value: "poker", weight: { difficulty: 4 }, tag: "poker" },
    ],
  },
  {
    id: "q4",
    options: [
      { value: "q4.a", weight: { difficulty: 1 } },
      { value: "q4.b", weight: { difficulty: 3 } },
      { value: "q4.c", weight: { difficulty: 5, bonusRichness: 3 } },
    ],
  },
  {
    id: "q5",
    options: [
      { value: "q5.a", weight: { shortSession: 5, pace: 4 } },
      { value: "q5.b", weight: { shortSession: 3 } },
      { value: "q5.c", weight: { shortSession: 1 } },
    ],
  },
  {
    id: "q6", // preferred theme -> tag
    options: [
      { value: "candy", weight: {}, tag: "candy" },
      { value: "fortune", weight: {}, tag: "fortune" },
      { value: "animal", weight: {}, tag: "animal" },
      { value: "egypt", weight: {}, tag: "egypt" },
      { value: "adventure", weight: {}, tag: "adventure" },
      { value: "sport", weight: {}, tag: "sport" },
      { value: "classic", weight: {}, tag: "classic" },
    ],
  },
];

// Question 3 & 6 option labels are localized here (dynamic option lists).
export const QUIZ_OPTION_LABELS: Record<string, Record<Lang, string>> = {
  slot: { zh: "Slot", vi: "Slot", en: "Slot" },
  bingo: { zh: "Bingo", vi: "Bingo", en: "Bingo" },
  liveCasino: { zh: "真人遊戲", vi: "Casino trực tiếp", en: "Live Casino" },
  fishing: { zh: "捕魚", vi: "Bắn cá", en: "Fishing" },
  crash: { zh: "Crash", vi: "Crash", en: "Crash" },
  colorGame: { zh: "Color Game", vi: "Color Game", en: "Color Game" },
  poker: { zh: "Poker", vi: "Poker", en: "Poker" },
  candy: { zh: "糖果", vi: "Kẹo ngọt", en: "Candy" },
  fortune: { zh: "財神", vi: "Thần tài", en: "Fortune" },
  animal: { zh: "動物", vi: "Động vật", en: "Animals" },
  egypt: { zh: "古埃及", vi: "Ai Cập", en: "Ancient Egypt" },
  adventure: { zh: "冒險", vi: "Phiêu lưu", en: "Adventure" },
  sport: { zh: "運動", vi: "Thể thao", en: "Sports" },
  classic: { zh: "經典 Casino", vi: "Casino cổ điển", en: "Classic Casino" },
};

export const PLAYER_TYPES: Record<string, PlayerType & { label: Record<Lang, string>; desc: Record<Lang, string> }> = {
  highRoller: {
    id: "highRoller",
    tags: ["bigWin", "highVol"],
    fingerprint: { bigWinPotential: 5, winFrequency: 2, pace: 4 },
    label: { zh: "高倍獵人", vi: "Thợ săn nổ hũ", en: "High-Multiplier Hunter" },
    desc: {
      zh: "你追求那一次大爆發，願意承受起伏換取高倍時刻。",
      vi: "Bạn theo đuổi cú nổ lớn và chấp nhận biến động để đổi lấy khoảnh khắc bội số cao.",
      en: "You chase the big hit and accept swings for those high-multiplier moments.",
    },
  },
  steadyCollector: {
    id: "steadyCollector",
    tags: ["lowVol", "easy"],
    fingerprint: { winFrequency: 5, bigWinPotential: 2, difficulty: 1 },
    label: { zh: "穩定收集家", vi: "Người chơi ổn định", en: "Steady Collector" },
    desc: {
      zh: "你喜歡穩穩地中小獎，節奏平順、心情放鬆。",
      vi: "Bạn thích thắng nhỏ đều đặn, nhịp độ nhẹ nhàng và thư giãn.",
      en: "You like steady small wins with a relaxed, even pace.",
    },
  },
  bonusExplorer: {
    id: "bonusExplorer",
    tags: ["manyBonus", "cascade"],
    fingerprint: { bonusRichness: 5, winFrequency: 3 },
    label: { zh: "Bonus 探險家", vi: "Nhà thám hiểm Bonus", en: "Bonus Explorer" },
    desc: {
      zh: "你最愛觸發各種 Bonus 機制，玩法越多層越開心。",
      vi: "Bạn thích kích hoạt nhiều cơ chế Bonus, càng nhiều lớp càng vui.",
      en: "You love triggering bonus mechanics — the more layers, the better.",
    },
  },
  fastPlayer: {
    id: "fastPlayer",
    tags: ["fast", "quickRound"],
    fingerprint: { pace: 5, shortSession: 5 },
    label: { zh: "快節奏玩家", vi: "Người chơi nhịp nhanh", en: "Fast-Paced Player" },
    desc: {
      zh: "你想要一局接一局，短時間就有結果。",
      vi: "Bạn muốn ván này nối ván kia, có kết quả trong thời gian ngắn.",
      en: "You want round after round with quick results.",
    },
  },
  classicPlayer: {
    id: "classicPlayer",
    tags: ["classic", "liveHost"],
    fingerprint: { difficulty: 2, pace: 3, bonusRichness: 2 },
    label: { zh: "經典派玩家", vi: "Người chơi cổ điển", en: "Classic Player" },
    desc: {
      zh: "你偏好熟悉、規則清楚的經典玩法。",
      vi: "Bạn thích lối chơi cổ điển quen thuộc, luật rõ ràng.",
      en: "You prefer familiar classics with clear rules.",
    },
  },
  newExplorer: {
    id: "newExplorer",
    tags: ["adventure", "manyBonus"],
    fingerprint: { bonusRichness: 4, pace: 4, difficulty: 3 },
    label: { zh: "新遊體驗家", vi: "Người thích game mới", en: "New-Game Explorer" },
    desc: {
      zh: "你喜歡嘗鮮，總想第一時間玩到新上市的遊戲。",
      vi: "Bạn thích thử cái mới, luôn muốn chơi game vừa ra mắt.",
      en: "You love trying the newest releases first.",
    },
  },
};

const AXES: QuizAxis[] = ["pace", "winFrequency", "bigWinPotential", "bonusRichness", "difficulty", "shortSession"];

export type QuizResult = {
  typeId: string;
  preferredTags: string[];
  fingerprint: Partial<Record<QuizAxis, number>>;
};

// Turn a map of answers into a player type + preferred tags/categories.
export function scoreQuiz(answers: Record<string, string>): QuizResult {
  const acc: Record<QuizAxis, { sum: number; n: number }> = Object.fromEntries(
    AXES.map((a) => [a, { sum: 0, n: 0 }]),
  ) as Record<QuizAxis, { sum: number; n: number }>;
  const preferredTags: string[] = [];

  for (const q of QUESTIONS) {
    const chosen = answers[q.id];
    const opt = q.options.find((o) => o.value === chosen);
    if (!opt) continue;
    if (opt.tag) preferredTags.push(opt.tag);
    for (const [axis, val] of Object.entries(opt.weight)) {
      const a = axis as QuizAxis;
      acc[a].sum += val as number;
      acc[a].n += 1;
    }
  }

  const fingerprint: Partial<Record<QuizAxis, number>> = {};
  for (const a of AXES) if (acc[a].n) fingerprint[a] = acc[a].sum / acc[a].n;

  // Pick the closest player type by fingerprint distance.
  let best = "steadyCollector";
  let bestDist = Infinity;
  for (const [id, t] of Object.entries(PLAYER_TYPES)) {
    let d = 0;
    for (const a of AXES) {
      const target = t.fingerprint[a];
      const got = fingerprint[a];
      if (target != null && got != null) d += (target - got) ** 2;
    }
    if (d < bestDist) {
      bestDist = d;
      best = id;
    }
  }
  return { typeId: best, preferredTags, fingerprint };
}

// Rank games by fit to a quiz result, for the given market.
export function recommendGames(result: QuizResult, games: Game[]): Game[] {
  const wanted = new Set(result.preferredTags);
  const fp = result.fingerprint;
  return [...games]
    .map((g) => {
      let score = 0;
      if (wanted.has(g.category)) score += 8;
      for (const tag of g.tags) if (wanted.has(tag)) score += 3;
      const axisMap: Record<string, number> = {
        pace: g.pace,
        winFrequency: g.winFrequency,
        bigWinPotential: g.bigWinPotential,
        bonusRichness: g.bonusRichness,
        difficulty: g.difficulty,
      };
      for (const [a, target] of Object.entries(fp)) {
        const got = axisMap[a];
        if (got != null) score += 3 - Math.abs((target as number) - got);
      }
      score += g.rating; // gentle tie-break toward better-rated
      return { g, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((x) => x.g);
}
