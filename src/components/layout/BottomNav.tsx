import { NavLink } from "react-router-dom";
import { Home, Flame, Search, Heart, LayoutGrid } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { useSaved } from "@/context/SavedContext";

const ITEMS = [
  { to: "/", key: "nav.home", Icon: Home, end: true },
  { to: "/pulse", key: "nav.hot", Icon: Flame },
  { to: "/discover", key: "nav.discover", Icon: Search },
  { to: "/saved", key: "nav.saved", Icon: Heart, badge: true },
  { to: "/more", key: "nav.more", Icon: LayoutGrid },
];

export function BottomNav() {
  const { t } = useMarket();
  const { saved } = useSaved();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-line bg-ink/95 backdrop-blur-lg lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map(({ to, key, Icon, end, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition ${
                isActive ? "text-pulse" : "text-content-faint"
              }`
            }
          >
            <span className="relative">
              <Icon size={21} />
              {badge && saved.length > 0 && (
                <span className="tnum absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-vn px-1 text-[9px] font-bold text-white">
                  {saved.length}
                </span>
              )}
            </span>
            {t(key)}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
