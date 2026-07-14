import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, RotateCcw, Share2, ArrowLeft } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { useSaved } from "@/context/SavedContext";
import { useToast } from "@/context/ToastContext";
import { QUESTIONS, QUIZ_OPTION_LABELS, PLAYER_TYPES, scoreQuiz, recommendGames, type QuizResult } from "@/data/quiz";
import { gamesInMarket } from "@/data/games";
import { categoryLabel } from "@/data/categories";
import { tagLabel } from "@/data/tags";
import { GameThumb } from "@/components/GameThumb";
import { Stars } from "@/components/Bits";
import { DemoButton, SaveButton } from "@/components/GameActions";
import { rankOf } from "@/lib/format";
import { pick } from "@/i18n";

function optionLabel(value: string, t: (k: string) => string, lang: "zh" | "vi" | "en") {
  if (value.includes(".")) return t(value); // e.g. q1.a
  return QUIZ_OPTION_LABELS[value]?.[lang] ?? value;
}

export default function Match() {
  const { t, lang, market } = useMarket();
  const { setQuiz, quiz } = useSaved();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(quiz);

  const total = QUESTIONS.length;

  const choose = (qid: string, value: string) => {
    const next = { ...answers, [qid]: value };
    setAnswers(next);
    if (step + 1 < total) {
      setStep(step + 1);
    } else {
      const r = scoreQuiz(next);
      setResult(r);
      setQuiz(r);
    }
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setResult(null);
  };

  if (result) return <Result result={result} onRestart={restart} />;

  const q = QUESTIONS[step];
  const progress = ((step) / total) * 100;

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-2">
        <Sparkles size={18} className="text-pulse" />
        <h1 className="font-display text-xl font-bold">{t("quiz.title")}</h1>
      </div>
      <p className="mt-1 text-sm text-content-muted">{t("quiz.intro")}</p>

      {/* progress */}
      <div className="mt-5 flex items-center gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} className="btn-ghost h-8 w-8 p-0" aria-label={t("action.back")}>
            <ArrowLeft size={16} />
          </button>
        )}
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-line">
          <div className="h-full rounded-full bg-pulse transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="tnum shrink-0 text-xs font-semibold text-content-muted">
          {t("quiz.step", { n: step + 1, total })}
        </span>
      </div>

      <div key={q.id} className="mt-6 animate-fade-up">
        <h2 className="font-display text-lg font-bold">{t(`${q.id}.title`)}</h2>
        <div className="mt-4 grid gap-2.5">
          {q.options.map((o) => {
            const selected = answers[q.id] === o.value;
            return (
              <button
                key={o.value}
                onClick={() => choose(q.id, o.value)}
                className={`card flex items-center justify-between gap-3 p-4 text-left transition hover:border-pulse/50 ${
                  selected ? "border-pulse ring-1 ring-pulse/40" : ""
                }`}
              >
                <span className="font-medium text-content">{optionLabel(o.value, t, lang)}</span>
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-surface-line">
                  {selected && <span className="h-2.5 w-2.5 rounded-full bg-pulse" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-6 text-center text-[11px] text-content-faint">
        {market === "vn" ? "🇻🇳" : "🇵🇭"} {t(`market.${market}`)} · {t("misc.disclaimerShort")}
      </p>
    </div>
  );
}

function Result({ result, onRestart }: { result: QuizResult; onRestart: () => void }) {
  const { t, lang, market } = useMarket();
  const { push } = useToast();
  const type = PLAYER_TYPES[result.typeId];
  const recs = useMemo(
    () => recommendGames(result, gamesInMarket(market)).slice(0, 5),
    [result, market],
  );

  const share = async () => {
    const text = `${t("quiz.resultTitle")}: ${type.label[lang]} — SEA Play Pulse`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard may be unavailable in some contexts */
    }
    push(t("toast.shared"), "success");
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-br from-pulse/20 to-surface p-5">
          <p className="eyebrow">{t("quiz.resultTitle")}</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-content">{type.label[lang]}</h1>
          <p className="mt-2 text-sm leading-relaxed text-content-muted">{type.desc[lang]}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {type.tags.map((tg) => (
              <span key={tg} className="chip text-pulse">
                {tagLabel(tg, lang)}
              </span>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={share} className="btn-ghost h-9">
              <Share2 size={15} /> {t("action.share")}
            </button>
            <button onClick={onRestart} className="btn-ghost h-9">
              <RotateCcw size={15} /> {t("action.retake")}
            </button>
          </div>
        </div>
      </div>

      <h2 className="section-title mt-6">{t("quiz.recommend")}</h2>
      <div className="mt-3 grid gap-2.5">
        {recs.slice(0, 3).map((g, i) => {
          const matched = [
            ...(result.preferredTags.includes(g.category) ? [categoryLabel(g.category, lang)] : []),
            ...g.tags.filter((tag) => result.preferredTags.includes(tag)).map((tag) => tagLabel(tag, lang)),
          ].slice(0, 3);
          const tier = pick(lang, ["最符合", "次符合", "可以嘗試"][i], ["Hợp nhất", "Khá hợp", "Có thể thử"][i], ["Best match", "Good match", "Worth a try"][i]);
          const tierTone = i === 0 ? "bg-pulse text-ink" : i === 1 ? "bg-pulse/20 text-pulse" : "bg-surface-raised text-content-muted";
          return (
            <div key={g.id} className="card p-3">
              <div className="flex items-center gap-3">
                <Link to={`/game/${g.id}`} className="shrink-0"><GameThumb game={g} className="w-16" /></Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${tierTone}`}>{tier}</span>
                    <Link to={`/game/${g.id}`} className="truncate font-display text-sm font-semibold hover:text-pulse">{g.name}</Link>
                  </div>
                  <div className="mt-0.5"><Stars value={g.rating} /></div>
                  <p className="mt-1 truncate text-[11px] text-content-muted">{t("quiz.reason")}：{matched.length ? matched.join("·") : g.provider}</p>
                  <p className="text-[11px] text-content-faint">{t("quiz.marketRank")}：#{rankOf(g, market)}</p>
                </div>
                <SaveButton game={g} />
              </div>
              <div className="mt-2 flex items-center gap-1.5 border-t border-surface-line pt-2">
                <DemoButton game={g} label="auto" />
                <Link to={`/game/${g.id}`} className="btn-ghost h-9 text-xs">{t("action.viewDetail")}</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
