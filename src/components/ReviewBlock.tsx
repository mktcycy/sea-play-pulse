import { useMemo, useState } from "react";
import { Sparkles, ThumbsUp, Meh, ThumbsDown, ChevronDown, MessagesSquare } from "lucide-react";
import type { Game, Review, Sentiment } from "@/lib/types";
import { useMarket } from "@/context/MarketContext";
import { useSaved } from "@/context/SavedContext";
import { useToast } from "@/context/ToastContext";
import { mockReviews, buildSummary, reviewText, MIN_REVIEWS } from "@/data/reviews";
import { REVIEW_TAG } from "@/data/vocab";
import { pick } from "@/i18n";

const FORM_TAGS = ["niceVisuals", "simpleControls", "fastPace", "specialGameplay", "funBonus", "easyUnderstand", "slowLoad", "complexControls", "repetitive"];
const SENTS: { id: Sentiment; icon: typeof ThumbsUp }[] = [
  { id: "good", icon: ThumbsUp },
  { id: "ok", icon: Meh },
  { id: "bad", icon: ThumbsDown },
];

export function ReviewBlock({ game }: { game: Game }) {
  const { t, lang } = useMarket();
  const { userReviewsFor, addFeedback } = useSaved();
  const { push } = useToast();
  const [showAll, setShowAll] = useState(false);
  const [sentiment, setSentiment] = useState<Sentiment | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  const userReviews = userReviewsFor(game.id);
  const all: Review[] = useMemo(() => [...userReviews, ...mockReviews(game.id)], [userReviews, game.id]);
  const summary = useMemo(() => buildSummary(game.id, all, lang), [all, game.id, lang]);

  const sentLabel = (s: Sentiment) => pick(lang, { good: "好玩", ok: "普通", bad: "不喜歡" }[s], { good: "Vui", ok: "Bình thường", bad: "Không thích" }[s], { good: "Fun", ok: "Okay", bad: "Not for me" }[s]);

  const submit = () => {
    if (!sentiment) return;
    addFeedback({
      id: `${game.id}-u${Date.now()}`,
      gameId: game.id,
      rating: sentiment === "good" ? 5 : sentiment === "ok" ? 3 : 2,
      sentiment,
      tags,
      comment: comment.trim(),
      createdAt: new Date().toISOString().slice(0, 10),
      status: "published",
    });
    setSentiment(null); setTags([]); setComment("");
    push(t("toast.feedbackThanks"), "success");
  };

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2">
        <MessagesSquare size={18} className="text-pulse" />
        <h2 className="font-display text-lg font-bold">{pick(lang, "玩家試玩心得", "Cảm nhận người chơi", "Player feedback")}</h2>
        <span className="ml-1 inline-flex items-center gap-1 rounded-full bg-pulse/15 px-2 py-0.5 text-[10px] font-semibold text-pulse">
          <Sparkles size={11} /> {pick(lang, "AI 整理", "AI tổng hợp", "AI summary")}
        </span>
      </div>

      {summary.generated ? (
        <div className="mt-3">
          <p className="text-sm leading-relaxed text-content">{summary.overall}</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <SummaryCol title={pick(lang, "玩家常提到", "Thường nhắc đến", "Often mentioned")} items={summary.oftenMentioned} tone="pulse" />
            <SummaryCol title={pick(lang, "需要留意", "Cần lưu ý", "Watch out")} items={summary.watchOut} tone="flame" />
            <div>
              <p className="eyebrow mb-1">{pick(lang, "適合玩家", "Hợp với", "Suits")}</p>
              <p className="text-xs text-content-muted">{summary.suitableFor}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-content-faint">
            <span>{pick(lang, `根據 ${summary.basedOn} 則回饋整理`, `Tổng hợp từ ${summary.basedOn} phản hồi`, `Based on ${summary.basedOn} reviews`)}</span>
            <span>· {pick(lang, "最後更新", "Cập nhật", "Updated")} {summary.updatedAt}</span>
            <button onClick={() => setShowAll((v) => !v)} className="inline-flex items-center gap-0.5 font-semibold text-pulse">
              {pick(lang, "查看所有心得", "Xem tất cả", "View all")} <ChevronDown size={13} className={showAll ? "rotate-180" : ""} />
            </button>
          </div>
          <p className="mt-2 rounded-lg bg-surface-raised p-2 text-[11px] leading-relaxed text-content-faint">
            {pick(lang, "AI 摘要依玩家回饋自動整理，內容可能不完全準確。", "Tóm tắt AI tự động từ phản hồi, có thể chưa hoàn toàn chính xác.", "AI summary is auto-generated from feedback and may not be fully accurate.")}
          </p>
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-surface-line p-4 text-center text-sm text-content-muted">
          {pick(lang, `目前回饋數量不足（少於 ${MIN_REVIEWS} 則），累積更多玩家心得後將提供 AI 摘要。`, `Chưa đủ phản hồi (dưới ${MIN_REVIEWS}); sẽ có tóm tắt AI khi tích luỹ thêm.`, `Not enough feedback yet (under ${MIN_REVIEWS}). An AI summary will appear once more accumulates.`)}
        </p>
      )}

      {/* raw reviews */}
      {showAll && (
        <div className="mt-3 grid max-h-72 gap-2 overflow-auto">
          {all.slice(0, 40).map((r) => (
            <div key={r.id} className="rounded-lg bg-surface-raised p-2.5">
              <div className="flex items-center gap-2 text-xs">
                <span className={`font-semibold ${r.sentiment === "good" ? "text-up" : r.sentiment === "bad" ? "text-down" : "text-content-muted"}`}>{sentLabel(r.sentiment)}</span>
                <span className="text-content-faint">{r.createdAt}</span>
              </div>
              <p className="mt-1 text-xs text-content-muted">{reviewText(r, lang)}</p>
            </div>
          ))}
        </div>
      )}

      {/* feedback form */}
      <div className="mt-4 border-t border-surface-line pt-4">
        <p className="mb-2 text-sm font-semibold">{pick(lang, "分享你試玩後的感受", "Chia sẻ cảm nhận của bạn", "Share your take")}</p>
        <div className="flex gap-2">
          {SENTS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSentiment(s.id)}
              className={`btn h-9 flex-1 text-xs ${sentiment === s.id ? "bg-pulse text-ink" : "btn-ghost"}`}
            >
              <s.icon size={14} /> {sentLabel(s.id)}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FORM_TAGS.map((tk) => {
            const on = tags.includes(tk);
            return (
              <button
                key={tk}
                onClick={() => setTags((p) => (on ? p.filter((x) => x !== tk) : [...p, tk]))}
                className={`chip ${on ? "border-pulse/50 text-pulse" : "hover:text-content"}`}
              >
                {REVIEW_TAG[tk][lang]}
              </button>
            );
          })}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={pick(lang, "選填：分享你試玩後的感受", "Tuỳ chọn: chia sẻ cảm nhận", "Optional: share your experience")}
          rows={2}
          className="mt-2 w-full resize-none rounded-xl border border-surface-line bg-ink-800 px-3 py-2 text-sm text-content placeholder:text-content-faint focus:border-pulse/60 focus:outline-none"
        />
        <button onClick={submit} disabled={!sentiment} className="btn-primary mt-2 h-10 w-full">
          {pick(lang, "送出試玩心得", "Gửi cảm nhận", "Submit feedback")}
        </button>
      </div>
    </div>
  );
}

function SummaryCol({ title, items, tone }: { title: string; items: string[]; tone: "pulse" | "flame" }) {
  if (items.length === 0) return (
    <div>
      <p className="eyebrow mb-1">{title}</p>
      <p className="text-xs text-content-faint">—</p>
    </div>
  );
  return (
    <div>
      <p className="eyebrow mb-1">{title}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((x) => (
          <span key={x} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tone === "pulse" ? "bg-pulse/12 text-pulse" : "bg-flame/12 text-flame"}`}>{x}</span>
        ))}
      </div>
    </div>
  );
}
