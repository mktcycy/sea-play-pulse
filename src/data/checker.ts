import type { CheckStatus, CheckerRecord } from "@/lib/types";

// Mock platform records. NOTE: this is a demo only — it does NOT call any real
// PAGCOR/registry API and never claims a platform is 100% safe.
export const CHECKER_RECORDS: CheckerRecord[] = [
  {
    brand: "LuckyDragon",
    aliases: ["lucky dragon", "luckydragon.ph", "ld play"],
    url: "https://example-official-source.test/luckydragon",
    status: "found",
    source: "Demo registry snapshot",
    lastChecked: "2026-07-05",
  },
  {
    brand: "BarrioPlay",
    aliases: ["barrio play", "barrioplay.com"],
    url: "https://example-official-source.test/barrioplay",
    status: "found",
    source: "Demo registry snapshot",
    lastChecked: "2026-07-02",
  },
  {
    brand: "GoldenPeso Live",
    aliases: ["goldenpeso", "golden peso"],
    url: "https://example-official-source.test/goldenpeso",
    status: "found",
    source: "Demo registry snapshot",
    lastChecked: "2026-06-28",
  },
  {
    brand: "MegaWin88",
    aliases: ["megawin", "mega win 88"],
    status: "review",
    source: "Demo registry snapshot",
    lastChecked: "2026-06-20",
  },
  {
    brand: "SkyBet Arena",
    aliases: ["skybet arena", "sky arena"],
    status: "review",
    source: "Demo registry snapshot",
    lastChecked: "2026-06-18",
  },
];

export type CheckResult =
  | { status: CheckStatus; record?: CheckerRecord; query: string };

export function runCheck(query: string): CheckResult {
  const q = query.trim().toLowerCase();
  if (!q) return { status: "notFound", query };
  const match = CHECKER_RECORDS.find(
    (r) =>
      r.brand.toLowerCase() === q ||
      r.brand.toLowerCase().includes(q) ||
      r.aliases.some((a) => a === q || a.includes(q)),
  );
  if (!match) return { status: "notFound", query };
  return { status: match.status, record: match, query };
}
