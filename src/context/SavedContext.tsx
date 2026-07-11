import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { QuizResult } from "@/data/quiz";

type Vote = "A" | "B";

type SavedState = {
  saved: string[];
  recent: string[];
  compare: string[];
  votes: Record<string, Vote>;
  ratings: Record<string, number>;
  quiz: QuizResult | null;
};

type SavedCtx = SavedState & {
  toggleSave: (id: string) => boolean; // returns new isSaved
  isSaved: (id: string) => boolean;
  addRecent: (id: string) => void;
  toggleCompare: (id: string) => "added" | "removed" | "full";
  inCompare: (id: string) => boolean;
  clearCompare: () => void;
  vote: (duelId: string, choice: Vote) => void;
  hasVoted: (duelId: string) => Vote | undefined;
  rate: (id: string, value: number) => void;
  setQuiz: (r: QuizResult) => void;
};

const LS = "spp.saved.v1";
const MAX_COMPARE = 3;
const MAX_RECENT = 12;

const empty: SavedState = {
  saved: [],
  recent: [],
  compare: [],
  votes: {},
  ratings: {},
  quiz: null,
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
      return { ...s, saved: has ? s.saved.filter((x) => x !== id) : [id, ...s.saved] };
    });
    return next;
  }, []);

  const isSaved = useCallback((id: string) => state.saved.includes(id), [state.saved]);

  const addRecent = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      recent: [id, ...s.recent.filter((x) => x !== id)].slice(0, MAX_RECENT),
    }));
  }, []);

  const toggleCompare = useCallback((id: string): "added" | "removed" | "full" => {
    let result: "added" | "removed" | "full" = "added";
    setState((s) => {
      if (s.compare.includes(id)) {
        result = "removed";
        return { ...s, compare: s.compare.filter((x) => x !== id) };
      }
      if (s.compare.length >= MAX_COMPARE) {
        result = "full";
        return s;
      }
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

  const value = useMemo<SavedCtx>(
    () => ({
      ...state,
      toggleSave,
      isSaved,
      addRecent,
      toggleCompare,
      inCompare,
      clearCompare,
      vote,
      hasVoted,
      rate,
      setQuiz,
    }),
    [state, toggleSave, isSaved, addRecent, toggleCompare, inCompare, clearCompare, vote, hasVoted, rate, setQuiz],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSaved(): SavedCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
