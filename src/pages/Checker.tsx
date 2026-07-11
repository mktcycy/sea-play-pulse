import { useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldQuestion, Search, Loader2, ExternalLink, AlertTriangle } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { runCheck, type CheckResult, CHECKER_RECORDS } from "@/data/checker";
import type { CheckStatus } from "@/lib/types";

const STATUS_UI: Record<CheckStatus, { icon: React.ReactNode; tone: string; key: string }> = {
  found: { icon: <ShieldCheck size={22} />, tone: "text-up", key: "checker.found" },
  notFound: { icon: <ShieldAlert size={22} />, tone: "text-down", key: "checker.notFound" },
  review: { icon: <ShieldQuestion size={22} />, tone: "text-flame", key: "checker.review" },
};

export default function Checker() {
  const { t } = useMarket();
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [url, setUrl] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = (brand || name || url).trim();
    if (!query) return;
    setChecking(true);
    setResult(null);
    window.setTimeout(() => {
      setResult(runCheck(query));
      setChecking(false);
    }, 900);
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="flex items-center gap-2">
        <ShieldCheck size={20} className="text-ph" />
        <h1 className="font-display text-2xl font-bold">{t("checker.title")}</h1>
      </div>
      <p className="mt-1 text-sm text-content-muted">{t("checker.subtitle")}</p>

      <form onSubmit={submit} className="card mt-4 grid gap-3 p-4">
        <Field label={t("checker.inputName")} value={name} onChange={setName} placeholder={t("checker.placeholder")} />
        <Field label={t("checker.inputBrand")} value={brand} onChange={setBrand} placeholder="e.g. LuckyDragon" />
        <Field label={t("checker.inputUrl")} value={url} onChange={setUrl} placeholder="https://…" />
        <button type="submit" disabled={checking} className="btn-primary mt-1 h-11">
          {checking ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {checking ? t("checker.checking") : t("action.check")}
        </button>
        <p className="text-[11px] leading-relaxed text-content-faint">
          <AlertTriangle size={11} className="mr-1 inline text-flame" />
          {t("checker.note")}
        </p>
      </form>

      {/* result */}
      {checking && (
        <div className="card mt-4 flex items-center gap-3 p-5">
          <Loader2 className="animate-spin text-content-muted" size={20} />
          <span className="text-sm text-content-muted">{t("checker.checking")}</span>
        </div>
      )}

      {result && !checking && (
        <div className="card mt-4 overflow-hidden animate-fade-up">
          <div className="flex items-center gap-3 border-b border-surface-line p-4">
            <span className={STATUS_UI[result.status].tone}>{STATUS_UI[result.status].icon}</span>
            <div>
              <p className="font-display font-bold text-content">{t(STATUS_UI[result.status].key)}</p>
              <p className="text-xs text-content-muted">"{result.query}"</p>
            </div>
          </div>
          <div className="grid gap-2.5 p-4 text-sm">
            {result.record && (
              <>
                <Row label={t("checker.inputBrand")} value={result.record.brand} />
                <Row label={t("checker.status")} value={t(STATUS_UI[result.status].key)} />
                <Row label={t("checker.source")} value={result.record.source} />
                <Row label={t("checker.lastChecked")} value={result.record.lastChecked} />
                {result.record.url && (
                  <a
                    href={result.record.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost mt-1 h-9"
                    onClick={(e) => {
                      // demo links are placeholders
                      e.preventDefault();
                    }}
                  >
                    <ExternalLink size={15} /> {t("action.viewSource")}
                  </a>
                )}
              </>
            )}
            <p className="mt-1 rounded-xl bg-surface-raised p-3 text-[11px] leading-relaxed text-content-muted">
              {t("checker.note")}
            </p>
          </div>
        </div>
      )}

      {/* try examples */}
      <div className="mt-5">
        <p className="eyebrow mb-2">Try a sample</p>
        <div className="flex flex-wrap gap-2">
          {CHECKER_RECORDS.map((r) => (
            <button
              key={r.brand}
              onClick={() => {
                setBrand(r.brand);
                setChecking(true);
                setResult(null);
                window.setTimeout(() => {
                  setResult(runCheck(r.brand));
                  setChecking(false);
                }, 700);
              }}
              className="chip hover:text-content"
            >
              {r.brand}
            </button>
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
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-surface-line bg-ink-800 px-3 py-2.5 text-sm text-content placeholder:text-content-faint focus:border-pulse/60 focus:outline-none focus:ring-2 focus:ring-pulse/30"
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-content-muted">{label}</span>
      <span className="font-medium text-content">{value}</span>
    </div>
  );
}
