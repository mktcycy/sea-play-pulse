import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Game, MarketId } from "@/lib/types";

// Aggregate 7-day market heat across the market's games — the "pulse" of demand.
export function MarketTrendChart({ games, market }: { games: Game[]; market: MarketId }) {
  const accent = market === "vn" ? "#F43F5E" : "#38BDF8";
  const days = 7;
  const data = Array.from({ length: days }, (_, i) => {
    const sum = games.reduce((acc, g) => acc + (g.trendData[i] ?? 0), 0);
    return { day: `D-${days - i}`, heat: Math.round(sum / Math.max(1, games.length)) };
  });
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, left: -22, bottom: 0 }}>
          <defs>
            <linearGradient id="mkt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.5} />
              <stop offset="100%" stopColor={accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            tick={{ fill: "#5F6C80", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis tick={{ fill: "#5F6C80", fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            cursor={{ stroke: accent, strokeOpacity: 0.3 }}
            contentStyle={{
              background: "#0F1420",
              border: "1px solid #26303F",
              borderRadius: 12,
              fontSize: 12,
              color: "#E7ECF3",
            }}
            labelStyle={{ color: "#93A1B5" }}
          />
          <Area
            type="monotone"
            dataKey="heat"
            stroke={accent}
            strokeWidth={2.4}
            fill="url(#mkt)"
            dot={false}
            activeDot={{ r: 4, fill: accent }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
