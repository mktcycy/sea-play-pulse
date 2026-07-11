import { Link, NavLink } from "react-router-dom";
import { useMarket } from "@/context/MarketContext";
import { PulseLine } from "@/components/PulseLine";
import { MarketSwitch } from "./MarketSwitch";
import { LanguageSwitch } from "./LanguageSwitch";

const NAV = [
  { to: "/", key: "nav.home", end: true },
  { to: "/pulse", key: "nav.pulse" },
  { to: "/discover", key: "nav.discover" },
  { to: "/categories", key: "nav.categories" },
  { to: "/compare", key: "nav.compare" },
  { to: "/saved", key: "nav.saved" },
  { to: "/check", key: "nav.checker" },
];

export function TopBar() {
  const { t, accent } = useMarket();
  return (
    <header className="sticky top-0 z-40 border-b border-surface-line/70 bg-ink/85 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
        <Link to="/" className="group flex items-center gap-2" aria-label="SEA Play Pulse">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-pulse text-ink">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
              <path
                d="M2 12h4l1.6-5 3 10 2-7 1.4 2H22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-sm font-bold tracking-tight">
              SEA Play <span className="text-pulse">Pulse</span>
            </span>
            <span className="mt-0.5 h-2 w-24 overflow-hidden">
              <PulseLine className="h-2 w-24" color={accent} />
            </span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-0.5 lg:flex">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  isActive ? "bg-surface-raised text-content" : "text-content-muted hover:text-content"
                }`
              }
            >
              {t(n.key)}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <LanguageSwitch />
          </div>
          <MarketSwitch />
        </div>
      </div>
    </header>
  );
}
