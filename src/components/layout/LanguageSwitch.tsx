import { Languages } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import type { Lang } from "@/lib/types";

const LANGS: { id: Lang; label: string }[] = [
  { id: "zh", label: "中" },
  { id: "vi", label: "VI" },
  { id: "en", label: "EN" },
];

// Manual language override (market switch still auto-selects a default).
export function LanguageSwitch() {
  const { lang, setLang } = useMarket();
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-surface-line bg-ink-800 px-1.5 py-1">
      <Languages size={14} className="text-content-faint" aria-hidden />
      {LANGS.map((l) => (
        <button
          key={l.id}
          onClick={() => setLang(l.id)}
          aria-pressed={lang === l.id}
          className={`rounded-full px-1.5 py-0.5 text-[11px] font-semibold transition ${
            lang === l.id ? "bg-surface-raised text-pulse" : "text-content-faint hover:text-content"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
