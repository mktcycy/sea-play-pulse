import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useMarket } from "@/context/MarketContext";

export function Section({
  title,
  eyebrow,
  to,
  children,
}: {
  title: string;
  eyebrow?: string;
  to?: string;
  children: React.ReactNode;
}) {
  const { t } = useMarket();
  return (
    <section className="mt-7 first:mt-0">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h2 className="section-title">{title}</h2>
        </div>
        {to && (
          <Link to={to} className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-pulse hover:text-pulse-soft">
            {t("home.viewAll")} <ChevronRight size={14} />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
