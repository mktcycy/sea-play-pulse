import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Lang, MarketId } from "@/lib/types";
import { translate } from "@/i18n";

type MarketCtx = {
  market: MarketId;
  lang: Lang;
  switching: boolean;
  setMarket: (m: MarketId) => void;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  accent: string; // market identity color, for local accents only
};

const DEFAULT_LANG: Record<MarketId, Lang> = { vn: "vi", ph: "en" };
const ACCENT: Record<MarketId, string> = { vn: "#F43F5E", ph: "#38BDF8" };

const Ctx = createContext<MarketCtx | null>(null);

const LS_MARKET = "spp.market";
const LS_LANG = "spp.lang";

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [market, setMarketState] = useState<MarketId>(
    () => (localStorage.getItem(LS_MARKET) as MarketId) || "vn",
  );
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem(LS_LANG) as Lang) || DEFAULT_LANG[
      (localStorage.getItem(LS_MARKET) as MarketId) || "vn"
    ],
  );
  const [switching, setSwitching] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    localStorage.setItem(LS_MARKET, market);
    document.documentElement.style.setProperty("--accent", ACCENT[market]);
  }, [market]);
  useEffect(() => {
    localStorage.setItem(LS_LANG, lang);
  }, [lang]);

  const setMarket = useCallback(
    (m: MarketId) => {
      setMarketState((prev) => {
        if (prev === m) return prev;
        // Market switch auto-selects that market's default language.
        setLangState(DEFAULT_LANG[m]);
        setSwitching(true);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setSwitching(false), 650);
        return m;
      });
    },
    [],
  );

  const setLang = useCallback((l: Lang) => setLangState(l), []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(lang, key, vars),
    [lang],
  );

  const value = useMemo<MarketCtx>(
    () => ({ market, lang, switching, setMarket, setLang, t, accent: ACCENT[market] }),
    [market, lang, switching, setMarket, setLang, t],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMarket(): MarketCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMarket must be used within MarketProvider");
  return ctx;
}
