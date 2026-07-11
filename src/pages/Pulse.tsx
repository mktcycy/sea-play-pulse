import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useMarket } from "@/context/MarketContext";
import { gamesInMarket } from "@/data/games";
import { BOARDS, BOARD_ORDER, rankedFor } from "@/data/boards";
import type { BoardId } from "@/lib/types";
import { RankRow } from "@/components/GameCard";
import { RowSkeleton } from "@/components/Skeleton";
import { EmptyState } from "@/components/EmptyState";
import { useSimulatedLoading } from "@/lib/useLoading";
import { heatScore, weekHeatDelta } from "@/lib/format";

export default function Pulse() {
  const { t, market, accent } = useMarket();
  const [board, setBoard] = useState<BoardId>("todayDemo");
  const loading = useSimulatedLoading(450, [market, board]);
  const games = gamesInMarket(market);
  const ranked = rankedFor(BOARDS[board], games, market);
  const leader = ranked[0];

  const chartData = leader ? leader.trendData.map((v, i) => ({ day: `D-${7 - i}`, heat: v })) : [];

  return (
    <div>
      <div className="flex items-center gap-2">
        <h1 className="font-display text-2xl font-bold tracking-tight">{t("nav.pulse")}</h1>
        <span className="chip">{t(`market.${market}`)}</span>
      </div>
      <p className="mt-1 text-sm text-content-muted">
        看看你所在的市場，今天大家都在玩什麼 · {t("misc.disclaimerShort")}
      </p>

      {/* Board tabs */}
      <div className="rail mt-4 -mx-1 px-1">
        {BOARD_ORDER.map((id) => (
          <button
            key={id}
            onClick={() => setBoard(id)}
            aria-pressed={board === id}
            className={`btn h-9 shrink-0 snap-start whitespace-nowrap text-xs ${
              board === id ? "bg-pulse text-ink" : "btn-ghost"
            }`}
          >
            {t(`board.${id}`)}
          </button>
        ))}
      </div>

      {/* Leader spotlight with 7-day heat chart */}
      {leader && !loading && (
        <div className="card mt-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">{t("board." + board)} · #1</p>
              <p className="font-display text-lg font-bold">{leader.name}</p>
              <p className="text-xs text-content-muted">{leader.provider}</p>
            </div>
            <div className="text-right">
              <p className="tnum font-display text-2xl font-bold text-flame">🔥 {heatScore(leader, market)}</p>
              <p className="tnum text-xs text-up">
                {weekHeatDelta(leader) >= 0 ? "+" : ""}
                {weekHeatDelta(leader)}% · 7d
              </p>
            </div>
          </div>
          <div className="mt-3 h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 6, left: 6, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fill: "#5F6C80", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis hide domain={["dataMin - 6", "dataMax + 6"]} />
                <Tooltip
                  contentStyle={{
                    background: "#0F1420",
                    border: "1px solid #26303F",
                    borderRadius: 12,
                    fontSize: 12,
                    color: "#E7ECF3",
                  }}
                />
                <Line type="monotone" dataKey="heat" stroke={accent} strokeWidth={2.4} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Ranked list */}
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
