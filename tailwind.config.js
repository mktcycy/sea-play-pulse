/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0B0F17", // page base
          800: "#0F1420",
          700: "#141B29",
        },
        surface: {
          DEFAULT: "#161C28", // card
          raised: "#1C2432",
          line: "#26303F", // hairline borders
        },
        content: {
          DEFAULT: "#E7ECF3",
          muted: "#93A1B5",
          faint: "#5F6C80",
        },
        pulse: {
          // brand energy accent (market-neutral)
          DEFAULT: "#26E0C0",
          soft: "#7BEFDA",
          deep: "#0E9E88",
        },
        up: "#34D399",
        down: "#FB7185",
        // market accents — used only for local identity, never full-page
        vn: {
          DEFAULT: "#F43F5E",
          soft: "#FB7185",
          deep: "#9F1239",
        },
        ph: {
          DEFAULT: "#38BDF8",
          soft: "#7DD3FC",
          deep: "#0369A1",
        },
        flame: "#FBBF24",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      boxShadow: {
        card: "0 1px 0 0 rgba(255,255,255,0.03) inset, 0 12px 30px -18px rgba(0,0,0,0.8)",
        glow: "0 0 0 1px rgba(38,224,192,0.35), 0 8px 30px -8px rgba(38,224,192,0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "market-flash": {
          "0%": { opacity: "0" },
          "35%": { opacity: "0.5" },
          "100%": { opacity: "0" },
        },
        "pulse-dash": {
          to: { strokeDashoffset: "0" },
        },
        "toast-in": {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease both",
        "market-flash": "market-flash 0.6s ease forwards",
        "pulse-dash": "pulse-dash 1.6s ease forwards",
        "toast-in": "toast-in 0.22s cubic-bezier(0.2,0.9,0.3,1) both",
        shimmer: "shimmer 1.4s infinite",
      },
    },
  },
  plugins: [],
};
