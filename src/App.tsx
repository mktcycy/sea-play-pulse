import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { DemoProvider } from "./context/DemoContext";
import Home from "./pages/Home";
import Pulse from "./pages/Pulse";
import Discover from "./pages/Discover";
import Categories from "./pages/Categories";
import Compare from "./pages/Compare";
import Saved from "./pages/Saved";
import Checker from "./pages/Checker";
import More from "./pages/More";
import GameDetail from "./pages/GameDetail";
import Match from "./pages/Match";
import Duel from "./pages/Duel";
import NotFound from "./pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <DemoProvider>
      <ScrollToTop />
      <AppShell>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pulse" element={<Pulse />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/check" element={<Checker />} />
          <Route path="/more" element={<More />} />
          <Route path="/game/:id" element={<GameDetail />} />
          <Route path="/match" element={<Match />} />
          <Route path="/duel" element={<Duel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppShell>
    </DemoProvider>
  );
}
