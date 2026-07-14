import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { QuizResult } from "@/data/quiz";
import type { Review } from "@/lib/types";

type Vote = "A" | "B";
export type Bucket = "want" | "played" | "liked"; // 想玩 / 已試玩 / 喜歡
export type PlatformReport = { platform: string; url: string; note: string; at: string };

type SavedState = {
  saved: string[];
  category: Record<string, Bucket>; // saved-game collection bucket
  recent: string[]; // recently viewed
  recentPlayed: string[]; // recently played (demo)
  compare: string[];
  votes: Record<string, Vote>;
  ratings: Record<string, number>;
  quiz: QuizResult | null;
  userReviews: Review[]; // player-submitted feedback
  platformReports: PlatformReport[];
  brokenReports: string[]; // game ids with a reported broken demo link
};

type SavedCtx = SavedState & {
  toggleSave: (id: string) => boolean;
  isSaved: (id: string) => boolean;
  setCategory: (id: string, bucket: Bucket) => void;
  addRecent: (id: string) => void;
  addRecentPlayed: (id: string) => void;
  clearRecent: () => void;
  toggleCompare: (id: string) => "added" | "removed" | "full";
  inCompare: (id: string) => boolean;
  clearCompare: () => void;
  vote: (duelId: string, choice: Vote) => void;
  hasVoted: (duelId: string) => Vote | undefined;
  rate: (id: string, value: number) => void;
  setQuiz: (r: QuizResult) => void;
  addFeedback: (r: Review) => void;
  userReviewsFor: (gameId: string) => Review[];
  reportPlatform: (r: PlatformReport) => void;
  reportBroken: (gameId: string) => void;
};

const LS = "spp.saved.v2";
const MAX_COMPARE = 3;
const MAX_RECENT = 12;

const empty: SavedState = {
  saved: [], category: {}, recent: [], recentPlayed: [], compare: [],
  votes: {}, ratings: {}, quiz: null, userReviews: [], platformReports: [], brokenReports: [],
};

function load(): SavedState {
  try {
    const raw = localStorage.getItem(LS);
    if (!raw) return empty;
    return { ...empty, ...JSON.parse(raw) };
  } catch {
    return empty;
  }
}

const Ctx = createContext<SavedCtx | null>(null);

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SavedState>(load);

  useEffect(() => {
    localStorage.setItem(LS, JSON.stringify(state));
  }, [state]);

  const toggleSave = useCallback((id: string) => {
    let next = false;
    setState((s) => {
      const has = s.saved.includes(id);
      next = !has;
      if (has) {
        const { [id]: _drop, ...cat } = s.category;
        return { ...s, saved: s.saved.filter((x) => x !== id), category: cat };
      }
      return { ...s, saved: [id, ...s.saved], category: { ...s.category, [id]: s.category[id] ?? "want" } };
    });
    return next;
  }, []);

  const isSaved = useCallback((id: string) => state.saved.includes(id), [state.saved]);
  const setCategory = useCallback((id: string, bucket: Bucket) => {
    setState((s) => ({
      ...s,
      saved: s.saved.includes(id) ? s.saved : [id, ...s.saved],
      category: { ...s.category, [id]: bucket },
    }));
  }, []);

  const addRecent = useCallback((id: string) => {
    setState((s) => ({ ...s, recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, MAX_RECENT) }));
  }, []);
  const addRecentPlayed = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      recentPlayed: [id, ...s.recentPlayed.filter((x) => x !== id)].slice(0, MAX_RECENT),
      // auto-mark saved games as "played"
      category: s.saved.includes(id) ? { ...s.category, [id]: s.category[id] === "liked" ? "liked" : "played" } : s.category,
    }));
  }, []);
  const clearRecent = useCallback(() => setState((s) => ({ ...s, recent: [], recentPlayed: [] })), []);

  const toggleCompare = useCallback((id: string): "added" | "removed" | "full" => {
    let result: "added" | "removed" | "full" = "added";
    setState((s) => {
      if (s.compare.includes(id)) { result = "removed"; return { ...s, compare: s.compare.filter((x) => x !== id) }; }
      if (s.compare.length >= MAX_COMPARE) { result = "full"; return s; }
      result = "added";
      return { ...s, compare: [...s.compare, id] };
    });
    return result;
  }, []);
  const inCompare = useCallback((id: string) => state.compare.includes(id), [state.compare]);
  const clearCompare = useCallback(() => setState((s) => ({ ...s, compare: [] })), []);

  const vote = useCallback((duelId: string, choice: Vote) => {
    setState((s) => (s.votes[duelId] ? s : { ...s, votes: { ...s.votes, [duelId]: choice } }));
  }, []);
  const hasVoted = useCallback((duelId: string) => state.votes[duelId], [state.votes]);
  const rate = useCallback((id: string, value: number) => {
    setState((s) => ({ ...s, ratings: { ...s.ratings, [id]: value } }));
  }, []);
  const setQuiz = useCallback((r: QuizResult) => setState((s) => ({ ...s, quiz: r })), []);

  const addFeedback = useCallback((r: Review) => {
    setState((s) => ({ ...s, userReviews: [r, ...s.userReviews] }));
  }, []);
  const userReviewsFor = useCallback((gameId: string) => state.userReviews.filter((r) => r.gameId === gameId), [state.userReviews]);
  const reportPlatform = useCallback((r: PlatformReport) => setState((s) => ({ ...s, platformReports: [r, ...s.platformReports] })), []);
  const reportBroken = useCallback((gameId: string) => {
    setState((s) => (s.brokenReports.includes(gameId) ? s : { ...s, brokenReports: [gameId, ...s.brokenReports] }));
  }, []);

  const value = useMemo<SavedCtx>(
    () => ({
      ...state, toggleSave, isSaved, setCategory, addRecent, addRecentPlayed, clearRecent,
      toggleCompare, inCompare, clearCompare, vote, hasVoted, rate, setQuiz,
      addFeedback, userReviewsFor, reportPlatform, reportBroken,
    }),
    [state, toggleSave, isSaved, setCategory, addRecent, addRecentPlayed, clearRecent, toggleCompare, inCompare, clearCompare, vote, hasVoted, rate, setQuiz, addFeedback, userReviewsFor, reportPlatform, reportBroken],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSaved(): SavedCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
