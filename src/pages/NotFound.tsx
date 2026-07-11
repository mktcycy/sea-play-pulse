import { Link } from "react-router-dom";
import { useMarket } from "@/context/MarketContext";
import { PulseLine } from "@/components/PulseLine";

export default function NotFound() {
  const { t } = useMarket();
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <p className="font-display text-6xl font-bold text-pulse">404</p>
      <PulseLine className="mt-2 h-6 w-48" />
      <p className="mt-4 text-content-muted">這裡沒有你要找的頁面。</p>
      <Link to="/" className="btn-primary mt-5">
        {t("nav.home")}
      </Link>
    </div>
  );
}
