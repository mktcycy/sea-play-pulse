import type { Game, Lang } from "@/lib/types";
import { categoryLabel } from "./categories";
import { tokenLabel } from "./vocab";
import { mockReviews } from "./reviews";

// Factual, localized page content derived from the game data (no invented
// facts). Shared by the detail page (client) and the prerenderer (static HTML)
// so on-page content and structured data always match.

const P = (lang: Lang, zh: string, vi: string, en: string) => (lang === "vi" ? vi : lang === "en" ? en : zh);

export function gameIntro(g: Game, lang: Lang): string {
  const cat = categoryLabel(g.category, lang);
  const mech = g.mechanics.map((m) => tokenLabel(m, lang)).join("、");
  const theme = g.themes[0] ? tokenLabel(g.themes[0], lang) : "";
  const pace = g.pace >= 4 ? P(lang, "快節奏", "nhịp nhanh", "fast-paced") : g.pace <= 2 ? P(lang, "慢節奏", "nhịp chậm", "relaxed") : P(lang, "節奏適中", "nhịp vừa", "balanced-pace");
  const mobile = g.mobileFriendly ? P(lang, "手機與電腦皆可遊玩", "chơi được trên di động và máy tính", "playable on mobile and desktop") : P(lang, "建議使用電腦遊玩", "nên chơi trên máy tính", "best on desktop");
  return P(
    lang,
    `《${g.name}》是由 ${g.provider} 推出的${cat}遊戲，主打${mech}玩法，走${theme}主題、${pace}。${mobile}。本站提供免費試玩，可先體驗玩法與畫面，無需註冊或真實金錢。`,
    `${g.name} là game ${cat} của ${g.provider}, nổi bật với lối chơi ${mech}, chủ đề ${theme}, ${pace}. ${mobile}. Trang cung cấp chơi thử miễn phí để trải nghiệm lối chơi và hình ảnh, không cần đăng ký hay tiền thật.`,
    `${g.name} is a ${cat} game by ${g.provider}, built around ${mech} gameplay with a ${theme} theme and a ${pace} feel. It is ${mobile}. This site offers a free demo so you can try the gameplay and visuals — no sign-up or real money.`,
  );
}

export function gameFeatures(g: Game, lang: Lang): { title: string; body: string }[] {
  const feats: { title: string; body: string }[] = [];
  if (g.mechanics[0]) feats.push({ title: tokenLabel(g.mechanics[0], lang), body: P(lang, `核心玩法為${tokenLabel(g.mechanics[0], lang)}，是這款遊戲的主要特色。`, `Lối chơi cốt lõi là ${tokenLabel(g.mechanics[0], lang)}.`, `Its core mechanic is ${tokenLabel(g.mechanics[0], lang)}.`) });
  if (g.bonusRichness >= 4) feats.push({ title: P(lang, "玩法豐富", "Phong phú", "Rich gameplay"), body: P(lang, "含多種獎勵與 Bonus 環節，變化較多。", "Nhiều vòng thưởng và Bonus.", "Multiple reward and bonus rounds add variety.") });
  else if (g.difficulty <= 1) feats.push({ title: P(lang, "簡單易上手", "Dễ chơi", "Easy to pick up"), body: P(lang, "規則直覺，新手也能快速理解。", "Luật đơn giản, người mới dễ hiểu.", "Intuitive rules that beginners grasp quickly.") });
  if (g.pace >= 4) feats.push({ title: P(lang, "快節奏", "Nhịp nhanh", "Fast pace"), body: P(lang, "單局時間短，一局接一局。", "Mỗi ván ngắn, chơi liên tục.", "Short rounds, one after another.") });
  else feats.push({ title: P(lang, "節奏舒適", "Nhịp thoải mái", "Comfortable pace"), body: P(lang, "步調較從容，適合慢慢體驗。", "Nhịp thong thả, hợp trải nghiệm từ từ.", "A more relaxed pace to enjoy slowly.") });
  return feats.slice(0, 3);
}

export function gameHowToPlay(g: Game, lang: Lang): string {
  return g.demoType === "onsite"
    ? P(lang, "可直接在本站免費試玩，點「在本站試玩」即可，無需離開網站。", "Chơi thử miễn phí ngay tại trang bằng nút “Chơi thử tại trang”, không cần rời khỏi trang.", "Play the free demo right here via “Play on our site” — no need to leave the site.")
    : P(lang, "此遊戲的免費試玩由遊戲商提供，點「前往官方 Demo」會開啟遊戲商官方試玩頁面。", "Bản chơi thử do nhà cung cấp cung cấp; nhấn “Đến Demo chính thức” để mở trang chơi thử chính thức.", "The free demo is provided by the game studio; “Go to official Demo” opens the provider's official demo page.");
}

export function gameSuitableFor(g: Game, lang: Lang): string {
  const pace = g.pace >= 4 ? P(lang, "喜歡快節奏", "thích nhịp nhanh", "who like a fast pace") : P(lang, "喜歡從容節奏", "thích nhịp thong thả", "who prefer a relaxed pace");
  const diff = g.difficulty <= 2 ? P(lang, "偏好簡單操作", "thích thao tác đơn giản", "and simple controls") : P(lang, "能接受較多操作", "chấp nhận thao tác nhiều hơn", "and more involved controls");
  const cat = categoryLabel(g.category, lang);
  return P(lang, `適合${pace}、${diff}，並對「${cat}」類型有興趣的玩家。`, `Hợp người ${pace}, ${diff}, và quan tâm thể loại ${cat}.`, `Best for players ${pace} ${diff}, interested in ${cat} games.`);
}

export function gameFAQ(g: Game, lang: Lang): { q: string; a: string }[] {
  const demoWhere = g.demoType === "onsite" ? P(lang, "站內試玩", "chơi tại trang", "on-site") : P(lang, "前往遊戲商官方 Demo", "Demo chính thức của nhà cung cấp", "the provider's official demo");
  return [
    { q: P(lang, "是否可以免費試玩？", "Có thể chơi thử miễn phí không?", "Can I play a free demo?"), a: P(lang, `可以，本站提供免費試玩（${demoWhere}）。`, `Có, trang cung cấp chơi thử miễn phí (${demoWhere}).`, `Yes — a free demo is available (${demoWhere}).`) },
    { q: P(lang, "是否需要註冊？", "Có cần đăng ký không?", "Do I need to register?"), a: P(lang, "不需要，免費試玩無需註冊或登入。", "Không, chơi thử miễn phí không cần đăng ký hay đăng nhập.", "No — the free demo needs no sign-up or login.") },
    { q: P(lang, "是否涉及真實金錢？", "Có liên quan tiền thật không?", "Is real money involved?"), a: P(lang, "否，本站僅提供遊戲資訊與免費試玩，不涉及儲值、投注或真實金錢獎勵。", "Không, trang chỉ cung cấp thông tin và chơi thử; không nạp tiền, cá cược hay thưởng tiền thật.", "No — this site only offers game info and free demos, with no deposits, betting or real-money rewards.") },
    { q: P(lang, "支援手機嗎？", "Có hỗ trợ di động không?", "Does it work on mobile?"), a: g.mobileFriendly ? P(lang, "支援，手機與電腦皆可遊玩。", "Có, chơi được trên cả di động và máy tính.", "Yes — it works on both mobile and desktop.") : P(lang, "建議使用電腦，手機體驗較有限。", "Nên dùng máy tính; trải nghiệm di động hạn chế.", "Best on desktop; the mobile experience is limited.") },
  ];
}

export function reviewCount(g: Game): number {
  return mockReviews(g.id).length;
}

export function seoTitle(g: Game, lang: Lang): string {
  return P(lang, `${g.name} 免費試玩｜玩法、特色與玩家心得`, `${g.name} chơi thử miễn phí | Lối chơi, đặc điểm & cảm nhận`, `${g.name} free demo | gameplay, features & player feedback`);
}

export function seoDescription(g: Game, lang: Lang): string {
  return P(lang, `查看「${g.name}」的玩法、特色、玩家試玩心得與免費 Demo，無須註冊或儲值。`, `Xem lối chơi, đặc điểm, cảm nhận người chơi và bản Demo miễn phí của ${g.name} — không cần đăng ký hay nạp tiền.`, `See ${g.name}'s gameplay, features, player feedback and free demo — no sign-up or deposit.`);
}
