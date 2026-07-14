import { MonitorPlay, ExternalLink, Wrench, Globe, Smartphone, LinkIcon } from "lucide-react";
import type { DemoStatus, DemoType } from "@/lib/types";
import { useMarket } from "@/context/MarketContext";
import { pick } from "@/i18n";

// 站內試玩 / 官方 Demo
export function PlayTypeBadge({ type, className = "" }: { type: DemoType; className?: string }) {
  const { t } = useMarket();
  const onsite = type === "onsite";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        onsite ? "bg-pulse/15 text-pulse" : "bg-ph/15 text-ph"
      } ${className}`}
    >
      {onsite ? <MonitorPlay size={11} /> : <ExternalLink size={11} />}
      {t(onsite ? "playType.onsite" : "playType.official")}
    </span>
  );
}

const STATUS_META: Record<Exclude<DemoStatus, "ok">, { icon: typeof Wrench; zh: string; vi: string; en: string }> = {
  maintenance: { icon: Wrench, zh: "維護中", vi: "Bảo trì", en: "Maintenance" },
  mobileUnsupported: { icon: Smartphone, zh: "手機不支援", vi: "Chưa hỗ trợ ĐT", en: "No mobile" },
  regionLocked: { icon: Globe, zh: "地區限制", vi: "Giới hạn KV", en: "Region-locked" },
  linkBroken: { icon: LinkIcon, zh: "連結失效", vi: "Liên kết lỗi", en: "Link down" },
};

// Shows only for non-ok demo status.
export function DemoStatusBadge({ status, className = "" }: { status: DemoStatus; className?: string }) {
  const { lang } = useMarket();
  if (status === "ok") return null;
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-flame/15 px-2 py-0.5 text-[10px] font-semibold text-flame ${className}`}>
      <m.icon size={11} /> {pick(lang, m.zh, m.vi, m.en)}
    </span>
  );
}
