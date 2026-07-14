import type { CheckerRecord, RiskStatus } from "@/lib/types";

// DEMO ONLY. Fictional platform names, mock data. This checker helps a player
// look up PUBLIC info about real betting platforms — it does NOT call any real
// registry/PAGCOR API, never links out to platforms, and never claims a
// platform is safe or recommends registering / depositing / betting.
export const CHECKER_RECORDS: CheckerRecord[] = [
  {
    id: "chk-luckydragon",
    platformName: "LuckyDragon",
    domains: ["luckydragon.example", "luckydragon.ph.example"],
    aliases: ["lucky dragon", "ld play"],
    operator: "LD Interactive Ltd.（示意）",
    license: "DEMO-LIC-2043",
    licenseStatus: "有效（示意）",
    regulator: "示範監管機構 A",
    domainAge: "約 4 年（示意）",
    warnings: [],
    impersonationRisk: true, // look-alike domains exist
    publicReports: 1,
    playerReports: 3,
    lastCheckedAt: "2026-07-05",
    sources: [{ name: "示範登記快照" }, { name: "示範監管公告" }],
    riskStatus: "confirmed",
  },
  {
    id: "chk-goldenpeso",
    platformName: "GoldenPeso Live",
    domains: ["goldenpeso.example"],
    aliases: ["goldenpeso", "golden peso"],
    operator: "Golden Peso Gaming（示意）",
    license: "DEMO-LIC-1180",
    licenseStatus: "有效（示意）",
    regulator: "示範監管機構 A",
    domainAge: "約 3 年（示意）",
    warnings: [],
    impersonationRisk: false,
    publicReports: 0,
    playerReports: 1,
    lastCheckedAt: "2026-07-02",
    sources: [{ name: "示範登記快照" }],
    riskStatus: "confirmed",
  },
  {
    id: "chk-megawin88",
    platformName: "MegaWin88",
    domains: ["megawin88.example"],
    aliases: ["megawin", "mega win 88"],
    operator: "資料不足（示意）",
    license: "—",
    licenseStatus: "未知",
    regulator: "—",
    domainAge: "約 8 個月（示意）",
    warnings: ["牌照資訊未能核實", "網域註冊時間較短"],
    impersonationRisk: false,
    publicReports: 2,
    playerReports: 6,
    lastCheckedAt: "2026-06-20",
    sources: [{ name: "示範警示紀錄" }],
    riskStatus: "caution",
  },
  {
    id: "chk-skyarena",
    platformName: "SkyBet Arena",
    domains: ["skybetarena.example"],
    aliases: ["skybet arena", "sky arena"],
    operator: "資料不足（示意）",
    license: "—",
    licenseStatus: "未知",
    regulator: "—",
    domainAge: "約 3 個月（示意）",
    warnings: ["多筆玩家出金爭議回報（示意）", "與已知平台名稱高度相似"],
    impersonationRisk: true,
    publicReports: 5,
    playerReports: 14,
    lastCheckedAt: "2026-06-18",
    sources: [{ name: "示範警示紀錄" }, { name: "示範玩家回報" }],
    riskStatus: "highRisk",
  },
  {
    id: "chk-barrioplay",
    platformName: "BarrioPlay",
    domains: ["barrioplay.example"],
    aliases: ["barrio play"],
    operator: "Barrio Interactive（示意）",
    license: "DEMO-LIC-0777",
    licenseStatus: "有效（示意）",
    regulator: "示範監管機構 B",
    domainAge: "約 2 年（示意）",
    warnings: [],
    impersonationRisk: false,
    publicReports: 0,
    playerReports: 0,
    lastCheckedAt: "2026-06-28",
    sources: [{ name: "示範登記快照" }],
    riskStatus: "confirmed",
  },
  {
    id: "chk-newbrand",
    platformName: "NovaBet",
    domains: ["novabet.example"],
    aliases: ["nova bet", "novabet"],
    operator: "資料不足（示意）",
    license: "—",
    licenseStatus: "未知",
    regulator: "—",
    domainAge: "資料不足",
    warnings: ["公開資料有限，尚無法完整核實"],
    impersonationRisk: false,
    publicReports: 0,
    playerReports: 1,
    lastCheckedAt: "2026-06-10",
    sources: [{ name: "示範登記快照" }],
    riskStatus: "insufficient",
  },
];

export type CheckResult = {
  query: string;
  matched: boolean;
  record?: CheckerRecord;
  status: RiskStatus | "notFound";
  impersonationHint?: boolean; // query looked like a known brand but domain differs
};

export function runCheck(query: string): CheckResult {
  const q = query.trim().toLowerCase();
  if (!q) return { query, matched: false, status: "notFound" };
  const rec = CHECKER_RECORDS.find(
    (r) =>
      r.platformName.toLowerCase() === q ||
      r.platformName.toLowerCase().includes(q) ||
      r.domains.some((d) => d.toLowerCase().includes(q)) ||
      r.aliases.some((a) => a === q || a.includes(q)),
  );
  if (!rec) {
    // If the query resembles a known brand name but no exact domain matches,
    // hint at possible impersonation / typo domains.
    const looksLike = CHECKER_RECORDS.some((r) => r.platformName.toLowerCase().slice(0, 4) === q.slice(0, 4) && q.length >= 4);
    return { query, matched: false, status: "notFound", impersonationHint: looksLike };
  }
  return { query, matched: true, record: rec, status: rec.riskStatus, impersonationHint: rec.impersonationRisk };
}
