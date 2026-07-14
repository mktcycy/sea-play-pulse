// Post-build prerender: emits static HTML per game + list pages with readable
// content, JSON-LD, and per-page meta so Google / AI crawlers can read and cite
// pages without running JS. Run with bun after `vite build`.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { GAMES } from "@/data/games";
import { CATEGORIES, categoryLabel } from "@/data/categories";
import { gameOneLiner } from "@/data/vocab";
import { gameIntro, gameFeatures, gameHowToPlay, gameSuitableFor, gameFAQ, reviewCount, seoTitle, seoDescription } from "@/data/seo";
import type { Game } from "@/lib/types";

const DIST = "dist";
const BASE = "/sea-play-pulse"; // Pages project base (no trailing slash)
const ORIGIN = "https://mktcycy.github.io";
const LANG = "en" as const; // static baseline language (universally crawlable)
const OG_IMG = `${ORIGIN}${BASE}/pulse.svg`;

const template = readFileSync(join(DIST, "index.html"), "utf8");
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const jsonld = (obj: unknown) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`;
const abs = (p: string) => `${ORIGIN}${BASE}${p}`;

// Compose a full HTML page from head-extras (meta+jsonld) and #root content.
function page(opts: { title: string; description: string; canonical: string; head: string; body: string }): string {
  const head =
    `<title>${esc(opts.title)}</title>` +
    `<meta name="description" content="${esc(opts.description)}">` +
    `<link rel="canonical" href="${opts.canonical}">` +
    `<meta property="og:title" content="${esc(opts.title)}">` +
    `<meta property="og:description" content="${esc(opts.description)}">` +
    `<meta property="og:type" content="website">` +
    `<meta property="og:url" content="${opts.canonical}">` +
    `<meta property="og:image" content="${OG_IMG}">` +
    opts.head;
  return template
    .replace(/<title>[^<]*<\/title>/, head)
    .replace('<div id="root"></div>', `<div id="root">${opts.body}</div>`);
}

function similar(game: Game): Game[] {
  return GAMES.filter((g) => g.id !== game.id && (g.category === game.category || g.mechanics.some((m) => game.mechanics.includes(m)))).slice(0, 6);
}

function gamePage(g: Game): string {
  const title = seoTitle(g, LANG);
  const description = seoDescription(g, LANG);
  const canonical = abs(`/game/${g.id}`);
  const cat = categoryLabel(g.category, LANG);
  const faq = gameFAQ(g, LANG);
  const features = gameFeatures(g, LANG);
  const sim = similar(g);

  const videoGame = {
    "@context": "https://schema.org", "@type": "VideoGame",
    name: g.name, description: gameIntro(g, LANG), genre: cat, gamePlatform: g.mobileFriendly ? ["Web browser", "Mobile"] : ["Web browser"],
    applicationCategory: "GameApplication",
    author: { "@type": "Organization", name: g.provider },
    publisher: { "@type": "Organization", name: g.provider },
    url: canonical,
    aggregateRating: { "@type": "AggregateRating", ratingValue: g.rating, bestRating: 5, worstRating: 1, ratingCount: reviewCount(g) },
  };
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "Categories", item: abs("/categories") },
      { "@type": "ListItem", position: 3, name: g.name, item: canonical },
    ],
  };
  const faqPage = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const body =
    `<main>` +
    `<nav aria-label="breadcrumb"><a href="${BASE}/">Home</a> › <a href="${BASE}/categories">Categories</a> › <span>${esc(g.name)}</span></nav>` +
    `<h1>${esc(g.name)}</h1>` +
    `<p>${esc(g.provider)} · ${esc(gameOneLiner(g, LANG))}</p>` +
    `<h2>About this game</h2><p>${esc(gameIntro(g, LANG))}</p>` +
    `<h2>Features</h2><ul>${features.map((f) => `<li><strong>${esc(f.title)}</strong> — ${esc(f.body)}</li>`).join("")}</ul>` +
    `<h2>Free demo</h2><p>${esc(gameHowToPlay(g, LANG))}</p>` +
    `<h2>Who it's for</h2><p>${esc(gameSuitableFor(g, LANG))}</p>` +
    `<h2>Player feedback</h2><p>Player feedback summary based on ${reviewCount(g)} reviews. Last updated 2026-07-14.</p>` +
    `<h2>FAQ</h2><dl>${faq.map((f) => `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`).join("")}</dl>` +
    `<h2>Similar games</h2><ul>${sim.map((s) => `<li><a href="${BASE}/game/${s.id}">${esc(s.name)}</a></li>`).join("")}</ul>` +
    `<p><small>This site only offers game info and free demos — no deposits, betting or real-money rewards. Data shown is sample/demo data.</small></p>` +
    `</main>`;

  const head = jsonld(videoGame) + jsonld(breadcrumb) + jsonld(faqPage);
  return page({ title, description, canonical, head, body });
}

function listPage(opts: { path: string; title: string; description: string; heading: string; games: Game[]; collection?: boolean }): string {
  const canonical = abs(opts.path);
  const itemList = {
    "@context": "https://schema.org", "@type": opts.collection ? "CollectionPage" : "ItemList",
    name: opts.heading, url: canonical,
    ...(opts.collection
      ? { mainEntity: { "@type": "ItemList", itemListElement: opts.games.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/game/${g.id}`), name: g.name })) } }
      : { itemListElement: opts.games.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/game/${g.id}`), name: g.name })) }),
  };
  const body =
    `<main>` +
    `<h1>${esc(opts.heading)}</h1>` +
    `<p>${esc(opts.description)}</p>` +
    `<ul>${opts.games.map((g) => `<li><a href="${BASE}/game/${g.id}">${esc(g.name)}</a> — ${esc(gameOneLiner(g, LANG))}</li>`).join("")}</ul>` +
    `</main>`;
  return page({ title: opts.title, description: opts.description, canonical, head: jsonld(itemList), body });
}

function write(routePath: string, htmlOut: string) {
  const dir = join(DIST, routePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), htmlOut);
}

// ---- write game pages ----
for (const g of GAMES) write(`game/${g.id}`, gamePage(g));

// ---- write list pages ----
const topGames = [...GAMES].sort((a, b) => b.rating - a.rating).slice(0, 20);
write("pulse", listPage({ path: "/pulse", title: "Game rankings | SEA Play Pulse", description: "Trending free-demo games in Vietnam and the Philippines. No sign-up, no deposit.", heading: "Game rankings", games: topGames }));
write("discover", listPage({ path: "/discover", title: "Find games | SEA Play Pulse", description: "Discover free-demo games by type, mechanic and theme.", heading: "Find games", games: topGames, collection: true }));
write("categories", listPage({ path: "/categories", title: "Game categories | SEA Play Pulse", description: "Browse free-demo games by type, mechanic and theme.", heading: "Game categories", games: topGames, collection: true }));

// enhance the root index.html with a WebSite + ItemList + readable intro
const rootBody =
  `<main><h1>SEA Play Pulse</h1>` +
  `<p>See what players in Vietnam and the Philippines are playing today. Discover, match and try games for free — no sign-up, no deposit, no real money.</p>` +
  `<h2>Trending games</h2><ul>${topGames.slice(0, 12).map((g) => `<li><a href="${BASE}/game/${g.id}">${esc(g.name)}</a></li>`).join("")}</ul>` +
  `<nav><a href="${BASE}/pulse">Rankings</a> · <a href="${BASE}/discover">Find games</a> · <a href="${BASE}/categories">Categories</a></nav></main>`;
const website = { "@context": "https://schema.org", "@type": "WebSite", name: "SEA Play Pulse", url: abs("/"), description: "Game discovery and free-demo site for Vietnam and the Philippines." };
const rootItemList = { "@context": "https://schema.org", "@type": "ItemList", name: "Trending games", itemListElement: topGames.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/game/${g.id}`), name: g.name })) };
writeFileSync(join(DIST, "index.html"), page({ title: "SEA Play Pulse | Game discovery & free demos (Vietnam & Philippines)", description: "Discover trending games in Vietnam and the Philippines and try them free. No sign-up, no deposit, no real money.", canonical: abs("/"), head: jsonld(website) + jsonld(rootItemList), body: rootBody }));

// ---- 404.html = SPA fallback for app-only routes ----
writeFileSync(join(DIST, "404.html"), readFileSync(join(DIST, "index.html"), "utf8"));

// ---- sitemap.xml ----
const urls = [abs("/"), abs("/pulse"), abs("/discover"), abs("/categories"), ...GAMES.map((g) => abs(`/game/${g.id}`))];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u}</loc><lastmod>2026-07-14</lastmod></url>`).join("\n")}\n</urlset>\n`;
writeFileSync(join(DIST, "sitemap.xml"), sitemap);

// ---- robots.txt (allow Googlebot + OAI-SearchBot; avoid indexing query/filter pages) ----
const robots = [
  "User-agent: *", "Allow: /", "Disallow: /*?", "",
  "User-agent: Googlebot", "Allow: /", "",
  "User-agent: OAI-SearchBot", "Allow: /", "",
  "User-agent: GPTBot", "Allow: /", "",
  `Sitemap: ${abs("/sitemap.xml")}`, "",
].join("\n");
writeFileSync(join(DIST, "robots.txt"), robots);

if (!existsSync(join(DIST, "index.html"))) throw new Error("dist/index.html missing");
console.log(`prerendered ${GAMES.length} game pages + 4 list pages, sitemap (${urls.length} urls), robots.txt`);
