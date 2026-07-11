import { useMarket } from "@/context/MarketContext";
import { tagLabel } from "@/data/tags";

export function Tag({ token }: { token: string }) {
  const { lang } = useMarket();
  return <span className="chip">{tagLabel(token, lang)}</span>;
}
