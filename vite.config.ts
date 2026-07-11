import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vitejs.dev/config/
// `base` is only applied for the production build so assets resolve under the
// GitHub Pages project path; local `dev` stays at "/".
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/sea-play-pulse/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
}));
