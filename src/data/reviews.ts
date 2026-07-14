import type { Game, Lang, Review, ReviewSummary, Sentiment } from "@/lib/types";
import { seededRandom } from "@/lib/format";
import { GAMES } from "./games";
import { REVIEW_TAG } from "./vocab";

export const MIN_REVIEWS = 5;

// AI summaries may ONLY describe these aspects (compliance guardrail).
const POSITIVE = ["niceVisuals", "simpleControls", "fastPace", "specialGameplay", "funBonus", "easyUnderstand"];
const CAUTION = ["slowLoad", "complexControls", "repetitive"];

// A couple of games intentionally have < MIN_REVIEWS to show the empty state.
const LOW: Record<string, number> = { "barrio-bingo": 3, "video-poker-jacks": 2 };

function sentimentFor(rnd: () => number, rating: number): Sentiment {
  const good = 0.45 + (rating - 3.6) * 0.25; // higher rating -> more "good"
  const r = rnd();
  if (r < good) return "good";
  if (r < good + 0.32) return "ok";
  return "bad";
}

function tagsFor(g: Game, sentiment: Sentiment, rnd: () => number): string[] {
  const pos: string[] = [];
  if (g.visualStyle === "cute" || g.visualStyle === "luxe" || g.visualStyle === "epic") pos.push("niceVisuals");
  if (g.difficulty <= 2) { pos.push("simpleControls"); pos.push("easyUnderstand"); }
  if (g.pace >= 4) pos.push("fastPace");
  if (["fishing", "liveCasino", "crash"].includes(g.category)) pos.push("specialGameplay");
  if (g.bonusRichness >= 3) pos.push("funBonus");
  const caution: string[] = [];
  if (g.mobileExperience < 4) caution.push("slowLoad");
  if (g.difficulty >= 3) caution.push("complexControls");
  if (g.bonusRichness <= 2) caution.push("repetitive");
  const pool = sentiment === "bad" ? (caution.length ? caution : ["repetitive"]) : sentiment === "ok" ? [...pos, ...caution] : pos.length ? pos : ["easyUnderstand"];
  const n = 1 + Math.floor(rnd() * 2);
  const picked = new Set<string>();
  for (let i = 0; i < 6 && picked.size < n; i++) picked.add(pool[Math.floor(rnd() * pool.length)]);
  return [...picked];
}

function buildFor(g: Game): Review[] {
  const rnd = seededRandom(g.id + "rev");
  const count = LOW[g.id] ?? Math.round(6 + rnd() * 26);
  const out: Review[] = [];
  for (let i = 0; i < count; i++) {
    const sentiment = sentimentFor(rnd, g.rating);
    const rating = sentiment === "good" ? 5 : sentiment === "ok" ? 3 : 2;
    const daysAgo = Math.round(rnd() * 40);
    out.push({
      id: `${g.id}-r${i}`,
      gameId: g.id,
      rating,
      sentiment,
      tags: tagsFor(g, sentiment, rnd),
      comment: "", // mock has no free text; user submissions do
      createdAt: new Date(Date.parse("2026-07-14") - daysAgo * 86400000).toISOString().slice(0, 10),
      status: "published",
    });
  }
  return out;
}

export const MOCK_REVIEWS: Review[] = GAMES.flatMap(buildFor);

const BY_GAME: Record<string, Review[]> = {};
for (const r of MOCK_REVIEWS) (BY_GAME[r.gameId] ??= []).push(r);

export function mockReviews(gameId: string): Review[] {
  return BY_GAME[gameId] ?? [];
}

// Headline feedback-trend line, e.g. "72% 認為操作容易" (sample data).
export function feedbackTrend(gameId: string, lang: Lang): string | null {
  const reviews = mockReviews(gameId);
  if (reviews.length < MIN_REVIEWS) return null;
  const top = topByFreq(reviews, POSITIVE, 1)[0];
  if (!top || top.pct < 30) return null;
  const label = REVIEW_TAG[top.token][lang];
  return lang === "vi" ? `${top.pct}% nhắc đến "${label}"` : lang === "en" ? `${top.pct}% mention "${label}"` : `${top.pct}% 提到「${label}」`;
}

// Compose a readable comment from a review's tags when no free text exists.
export function reviewText(r: Review, lang: Lang): string {
  if (r.comment) return r.comment;
  const labels = r.tags.map((t) => REVIEW_TAG[t]?.[lang] ?? t);
  const sep = lang === "en" ? ", " : "、";
  return labels.join(sep);
}

function topByFreq(reviews: Review[], allowed: string[], n: number): { token: string; pct: number }[] {
  const counts: Record<string, number> = {};
  for (const r of reviews) for (const t of r.tags) if (allowed.includes(t)) counts[t] = (counts[t] ?? 0) + 1;
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([token, c]) => ({ token, pct: Math.round((c / reviews.length) * 100) }));
}

// Fixed, compliant summary logic. Structured so a real AI API could later
// replace `overall` without changing callers.
export function buildSummary(gameId: string, reviews: Review[], lang: Lang): ReviewSummary {
  const basedOn = reviews.length;
  const updatedAt = "2026-07-14";
  if (basedOn < MIN_REVIEWS) {
    return { gameId, generated: false, overall: "", oftenMentioned: [], watchOut: [], suitableFor: "", basedOn, updatedAt };
  }
  const pos = topByFreq(reviews, POSITIVE, 3);
  const caution = topByFreq(reviews, CAUTION, 2);
  const often = pos.map((p) => REVIEW_TAG[p.token][lang]);
  const watch = caution.map((c) => REVIEW_TAG[c.token][lang]);
  const goodPct = Math.round((reviews.filter((r) => r.sentiment === "good").length / basedOn) * 100);

  const L = (zh: string, vi: string, en: string) => ({ zh, vi, en })[lang];
  const first = often[0] ?? L("整體體驗", "trải nghiệm", "the experience");
  const overall =
    L(
      `多數玩家對「${first}」給予正面回饋（約 ${goodPct}% 表示好玩）。` + (watch.length ? `部分玩家提到「${watch[0]}」，第一次試玩可先熟悉一下。` : `整體上手門檻不高。`),
      `Đa số người chơi phản hồi tích cực về "${first}" (khoảng ${goodPct}% thấy vui).` + (watch.length ? ` Một số nhắc đến "${watch[0]}", lần đầu nên làm quen trước.` : ` Nhìn chung dễ bắt đầu.`),
      `Most players gave positive feedback on "${first}" (about ${goodPct}% found it fun).` + (watch.length ? ` Some mentioned "${watch[0]}" — worth a quick warm-up on first try.` : ` Overall it's easy to pick up.`),
    );
  const suitableFor = L(
    "喜歡" + (often.slice(0, 2).join("、") || "娛樂體驗") + "的玩家",
    "Người thích " + (often.slice(0, 2).join(", ") || "trải nghiệm giải trí"),
    "Players who enjoy " + (often.slice(0, 2).join(", ") || "the experience"),
  );
  return { gameId, generated: true, overall, oftenMentioned: often, watchOut: watch, suitableFor, basedOn, updatedAt };
}
