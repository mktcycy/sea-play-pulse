import { useMemo, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Clock } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import type { Game } from "@/lib/types";
import { gamesInMarket } from "@/data/games";
import { RankRow } from "@/components/GameCard";
import { RowSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useSimulatedLoading } from "@/lib/useLoading";
import { heatScore, rankOf, trendOf, weekHeatDelta } from "@/lib/format";
import { pick } from "@/i18n";

type Tab = "hot" | "rising" | "new";
type Range = "today" | "d7" | "d30";

export default function Pulse() {
  const { t, lang, market, accent } = useMarket();
  const [tab, setTab] = useState<Tab>("hot");
  const [range, setRange] = useState<Range>("d7");
  const loading = useSimulatedLoading(400, [market, tab, range]);
  const games = gamesInMarket(market);

  const ranked = useMemo(() => {
    let list = [...games];
    if (tab === "rising") list = list.filter((g) => trendOf(g, market) > 0).sort((a, b) => trendOf(b, market) - trendOf(a, market));
    else if (tab === "new") list = list.filter((g) => g.newRelease).sort((a, b) => rankOf(a, market) - rankOf(b, market));
    else {
      // hot — ranking basis depends on time range
      const key = (g: Game) => (range === "today" ? g.demoCount24h : range === "d30" ? g.favoriteCount : heatScore(g, market) * 100);
      list = list.sort((a, b) => key(b) - key(a));
    }
    return list;
  }, [games, tab, range, market]);

  const leader = ranked[0];
  const chartData = leader ? leader.trendData.map((v, i) => ({ day: `D-${7 - i}`, heat: v })) : [];

  const basis = tab === "rising"
    ? pick(lang, "依近 7 日排名升幅", "Theo mức tăng hạng 7 ngày", "By 7-day rank climb")
    : tab === "new"
      ? pick(lang, "依新進榜與排名", "Theo game mới & hạng", "By new entries & rank")
      : range === "today"
        ? pick(lang, "依今日試玩次數", "Theo lượt chơi thử hôm nay", "By demo plays today")
        : range === "d30"
          ? pick(lang, "依近 30 日收藏數", "Theo lượt lưu 30 ngày", "By 30-day favorites")
          : pick(lang, "依近 7 日熱度", "Theo nhiệt 7 ngày", "By 7-day heat");

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("nav.pulse")}</h1>
        <span className="chip">{t(`market.${market}`)}</span>
        <span className="chip text-flame">{t("misc.sampleData")}</span>
      </div>
      <p className="mt-1 text-sm text-content-muted">{t("app.tagline")}</p>

      {/* primary tabs */}
      <div className="mt-4 inline-flex rounded-full border border-surface-line bg-ink-800 p-0.5">
        {(["hot", "rising", "new"] as Tab[]).map((id) => (
          <button key={id} onClick={() => setTab(id)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${tab === id ? "bg-pulse text-ink" : "text-content-muted hover:text-content"}`}>
            {pick(lang, { hot: "熱門排行", rising: "上升最快", new: "本週新進榜" }[id], { hot: "Thịnh hành", rising: "Tăng nhanh", new: "Mới vào bảng" }[id], { hot: "Top", rising: "Rising", new: "New entries" }[id])}
          </button>
        ))}
      </div>

      {/* time range (only meaningful for hot) */}
      {tab === "hot" && (
        <div className="mt-3 flex gap-1.5">
          {(["today", "d7", "d30"] as Range[]).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`rounded-full px-3 py-1 text-[11px] font-semibold ${range === r ? "bg-surface-raised text-pulse" : "text-content-faint hover:text-content"}`}>
              {pick(lang, { today: "今日", d7: "近 7 日", d30: "近 30 日" }[r], { today: "Hôm nay", d7: "7 ngày", d30: "30 ngày" }[r], { today: "Today", d7: "7 days", d30: "30 days" }[r])}
            </button>
          ))}
        </div>
      )}

      {/* basis + updated */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-content-faint">
        <span>{pick(lang, "排行依據", "Xếp theo", "Ranked by")}：{basis}</span>
        <span className="inline-flex items-center gap-1"><Clock size={11} /> {pick(lang, "最後更新", "Cập nhật", "Updated")} 2026-07-14</span>
      </div>

      {/* leader spotlight */}
      {leader && !loading && (
        <div className="card mt-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">#1</p>
              <p className="font-display text-lg font-bold">{leader.name}</p>
              <p className="text-xs text-content-muted">{leader.provider}</p>
            </div>
            <div className="text-right">
              <p className="tnum font-display text-2xl font-bold text-flame">🔥 {heatScore(leader, market)}</p>
              <p className="tnum text-xs text-up">{weekHeatDelta(leader) >= 0 ? "+" : ""}{weekHeatDelta(leader)}% · 7d</p>
            </div>
          </div>
          <div className="mt-3 h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 6, left: 6, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: "#5F6C80", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis hide domain={["dataMin - 6", "dataMax + 6"]} />
                <Tooltip contentStyle={{ background: "#0F1420", border: "1px solid #26303F", borderRadius: 12, fontSize: 12, color: "#E7ECF3" }} />
                <Line type="monotone" dataKey="heat" stroke={accent} strokeWidth={2.4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ranked list */}
      <div className="mt-4 grid gap-2.5">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <RowSkeleton key={i} />)
        ) : ranked.length === 0 ? (
          <EmptyState icon="Inbox" title={t("state.empty")} />
        ) : (
          ranked.map((g, i) => <RankRow key={g.id} game={g} rank={i + 1} />)
        )}
      </div>
    </div>
  );
}
