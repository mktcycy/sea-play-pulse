import { useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldQuestion, ShieldX, Search, Loader2, AlertTriangle, ChevronDown, Flag } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { useSaved } from "@/context/SavedContext";
import { useToast } from "@/context/ToastContext";
import { runCheck, type CheckResult, CHECKER_RECORDS } from "@/data/checker";
import type { RiskStatus } from "@/lib/types";
import { pick } from "@/i18n";

const RISK_UI: Record<RiskStatus | "notFound", { icon: typeof ShieldCheck; tone: string; zh: string; vi: string; en: string }> = {
  confirmed: { icon: ShieldCheck, tone: "text-up", zh: "已確認資料", vi: "Đã xác nhận", en: "Confirmed info" },
  caution: { icon: ShieldAlert, tone: "text-flame", zh: "需留意", vi: "Cần lưu ý", en: "Use caution" },
  insufficient: { icon: ShieldQuestion, tone: "text-content-muted", zh: "資料不足", vi: "Thiếu dữ liệu", en: "Insufficient data" },
  highRisk: { icon: ShieldX, tone: "text-down", zh: "高風險警示", vi: "Cảnh báo rủi ro cao", en: "High-risk warning" },
  notFound: { icon: ShieldQuestion, tone: "text-content-muted", zh: "資料不足", vi: "Thiếu dữ liệu", en: "Insufficient data" },
};

export default function Checker() {
  const { t, lang } = useMarket();
  const { reportPlatform } = useSaved();
  const { push } = useToast();
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [showBasis, setShowBasis] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [rp, setRp] = useState({ platform: "", url: "", note: "" });

  const run = (query: string) => {
    if (!query.trim()) return;
    setChecking(true); setResult(null); setShowBasis(false);
    window.setTimeout(() => { setResult(runCheck(query)); setChecking(false); }, 900);
  };
  const submit = (e: React.FormEvent) => { e.preventDefault(); run(name || url); };

  const sendReport = () => {
    if (!rp.platform.trim()) return;
    reportPlatform({ ...rp, at: new Date().toISOString().slice(0, 10) });
    setRp({ platform: "", url: "", note: "" }); setReportOpen(false);
    push(t("toast.reportSent"), "success");
  };

  const ui = result ? RISK_UI[result.status] : null;
  const rec = result?.record;

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-2">
        <ShieldCheck size={20} className="text-ph" />
        <h1 className="font-display text-2xl font-bold">{pick(lang, "真實投注平台查核", "Kiểm tra nền tảng cá cược", "Betting-platform check")}</h1>
      </div>
      <p className="mt-1 text-sm text-content-muted">{pick(lang, "依公開資料初步查詢平台的牌照、網域、營運與風險紀錄。", "Tra cứu sơ bộ giấy phép, tên miền, vận hành và rủi ro theo dữ liệu công khai.", "Look up a platform's license, domain, operator and risk records from public info.")}</p>

      <form onSubmit={submit} className="card mt-4 grid gap-3 p-4">
        <Field label={pick(lang, "平台名稱", "Tên nền tảng", "Platform name")} value={name} onChange={setName} placeholder="e.g. LuckyDragon" />
        <Field label={pick(lang, "網站網址", "Địa chỉ web", "Website URL")} value={url} onChange={setUrl} placeholder="https://…" />
        <button type="submit" disabled={checking} className="btn-primary mt-1 h-11">
          {checking ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {checking ? pick(lang, "查核中…", "Đang kiểm tra…", "Checking…") : pick(lang, "開始查核", "Kiểm tra", "Run check")}
        </button>
        <p className="text-[11px] leading-relaxed text-content-faint">
          <AlertTriangle size={11} className="mr-1 inline text-flame" />
          {pick(lang, "本站不提供前往平台、註冊、入金或投注功能。", "Trang không cung cấp truy cập, đăng ký, nạp tiền hay cá cược.", "This site does not offer platform access, sign-up, deposits or betting.")}
        </p>
      </form>

      {checking && (
        <div className="card mt-4 flex items-center gap-3 p-5"><Loader2 className="animate-spin text-content-muted" size={20} /><span className="text-sm text-content-muted">{pick(lang, "查核中…", "Đang kiểm tra…", "Checking…")}</span></div>
      )}

      {result && !checking && ui && (
        <div className="card mt-4 overflow-hidden animate-fade-up">
          <div className="flex items-center gap-3 border-b border-surface-line p-4">
            <span className={ui.tone}><ui.icon size={24} /></span>
            <div>
              <p className="font-display font-bold text-content">{pick(lang, ui.zh, ui.vi, ui.en)}</p>
              <p className="text-xs text-content-muted">"{result.query}"</p>
            </div>
          </div>

          {/* impersonation / same-name alert */}
          {result.impersonationHint && (
            <div className="flex items-start gap-2 border-b border-surface-line bg-flame/5 p-3 text-xs text-flame">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              <span>{pick(lang, "注意：偵測到與已知平台名稱相似或可能的仿冒網址，請仔細核對官方網域。", "Lưu ý: phát hiện tên/miền giống nền tảng đã biết, hãy kiểm tra kỹ tên miền chính thức.", "Note: a look-alike name or possible impersonation domain was detected — verify the official domain carefully.")}</span>
            </div>
          )}

          <div className="grid gap-2.5 p-4 text-sm">
            {rec ? (
              <>
                <Row label={pick(lang, "平台名稱", "Tên", "Platform")} value={rec.platformName} />
                <Row label={pick(lang, "已知網域", "Tên miền", "Domains")} value={rec.domains.join("、")} />
                <Row label={pick(lang, "營運公司", "Công ty vận hành", "Operator")} value={rec.operator} />
                <Row label={pick(lang, "牌照資訊", "Giấy phép", "License")} value={rec.license} />
                <Row label={pick(lang, "牌照狀態", "Trạng thái GP", "License status")} value={rec.licenseStatus} />
                <Row label={pick(lang, "監管機構", "Cơ quan quản lý", "Regulator")} value={rec.regulator} />
                <Row label={pick(lang, "網域建立時間", "Tuổi tên miền", "Domain age")} value={rec.domainAge} />
                <Row label={pick(lang, "公開警示紀錄", "Cảnh báo công khai", "Public warnings")} value={String(rec.publicReports)} />
                <Row label={pick(lang, "玩家回報紀錄", "Báo cáo người chơi", "Player reports")} value={String(rec.playerReports)} />
                <Row label={pick(lang, "最後查核時間", "Kiểm tra lần cuối", "Last checked")} value={rec.lastCheckedAt} />
                <button onClick={() => setShowBasis((v) => !v)} className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-pulse">
                  {pick(lang, "查看查核依據", "Xem căn cứ", "View basis")} <ChevronDown size={13} className={showBasis ? "rotate-180" : ""} />
                </button>
                {showBasis && (
                  <div className="rounded-xl bg-surface-raised p-3 text-xs text-content-muted animate-fade-up">
                    {rec.warnings.length > 0 && (
                      <ul className="mb-2 grid gap-1">
                        {rec.warnings.map((w) => <li key={w} className="flex gap-1.5"><AlertTriangle size={12} className="mt-0.5 shrink-0 text-flame" /> {w}</li>)}
                      </ul>
                    )}
                    <p className="text-content-faint">{pick(lang, "資料來源", "Nguồn", "Sources")}：{rec.sources.map((s) => s.name).join("、")} · {pick(lang, "更新", "Cập nhật", "Updated")} {rec.lastCheckedAt}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-content-muted">{pick(lang, "資料庫中沒有相符的平台紀錄。若你正在查詢的平台不在名單中，建議格外謹慎並確認官方資訊。", "Không tìm thấy bản ghi khớp. Nếu nền tảng không có trong danh sách, hãy đặc biệt thận trọng.", "No matching record. If your platform isn't listed, be extra cautious and verify official info.")}</p>
            )}
            <p className="mt-1 rounded-xl bg-surface-raised p-3 text-[11px] leading-relaxed text-content-muted">
              {pick(lang, "查核結果依公開資料整理，僅供初步參考，不代表平台絕對安全，也不構成註冊、儲值或投注建議。", "Kết quả dựa trên dữ liệu công khai, chỉ để tham khảo sơ bộ; không đảm bảo an toàn tuyệt đối và không phải lời khuyên đăng ký/nạp/cược.", "Results are compiled from public info for initial reference only — not a guarantee of safety, and not advice to register, deposit or bet.")}
            </p>
          </div>
        </div>
      )}

      {/* report suspicious platform */}
      <div className="card mt-4 p-4">
        <button onClick={() => setReportOpen((v) => !v)} className="flex w-full items-center gap-2 text-sm font-semibold">
          <Flag size={15} className="text-flame" /> {pick(lang, "回報可疑平台", "Báo nền tảng đáng ngờ", "Report a suspicious platform")}
          <ChevronDown size={15} className={`ml-auto ${reportOpen ? "rotate-180" : ""}`} />
        </button>
        {reportOpen && (
          <div className="mt-3 grid gap-2.5 animate-fade-up">
            <Field label={pick(lang, "平台名稱", "Tên nền tảng", "Platform name")} value={rp.platform} onChange={(v) => setRp((s) => ({ ...s, platform: v }))} />
            <Field label={pick(lang, "網址", "URL", "URL")} value={rp.url} onChange={(v) => setRp((s) => ({ ...s, url: v }))} placeholder="https://…" />
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-content-muted">{pick(lang, "說明（選填）", "Mô tả (tuỳ chọn)", "Notes (optional)")}</span>
              <textarea value={rp.note} onChange={(e) => setRp((s) => ({ ...s, note: e.target.value }))} rows={2} className="w-full resize-none rounded-xl border border-surface-line bg-ink-800 px-3 py-2 text-sm text-content focus:border-pulse/60 focus:outline-none" />
            </label>
            <button onClick={sendReport} disabled={!rp.platform.trim()} className="btn-primary h-10">{t("action.submit")}</button>
          </div>
        )}
      </div>

      {/* samples */}
      <div className="mt-5">
        <p className="eyebrow mb-2">{pick(lang, "試試範例", "Thử mẫu", "Try a sample")}</p>
        <div className="flex flex-wrap gap-2">
          {CHECKER_RECORDS.map((r) => (
            <button key={r.id} onClick={() => { setName(r.platformName); run(r.platformName); }} className="chip hover:text-content">{r.platformName}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-content-muted">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-surface-line bg-ink-800 px-3 py-2.5 text-sm text-content placeholder:text-content-faint focus:border-pulse/60 focus:outline-none focus:ring-2 focus:ring-pulse/30" />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="shrink-0 text-content-muted">{label}</span>
      <span className="text-right font-medium text-content">{value}</span>
    </div>
  );
}
