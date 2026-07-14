import { useEffect } from "react";

type Seo = {
  title: string;
  description: string;
  path?: string; // route path, e.g. "/game/fortune-koi"
  image?: string;
};

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

// Keeps title / description / canonical / Open Graph in sync on client nav.
export function useSeo({ title, description, path, image }: Seo) {
  useEffect(() => {
    document.title = title;
    setMeta("name", "description", description);
    const base = import.meta.env.BASE_URL.replace(/\/$/, "");
    const url = path ? `${window.location.origin}${base}${path}` : window.location.href;
    setLink("canonical", url);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", "website");
    setMeta("property", "og:url", url);
    if (image) setMeta("property", "og:image", image);
  }, [title, description, path, image]);
}
