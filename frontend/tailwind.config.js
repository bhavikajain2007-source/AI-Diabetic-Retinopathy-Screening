/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10222B",
        muted: "#5B6E75",
        faint: "#8B9BA0",
        line: "#DCE3E1",
        teal: "#0E7C74",
        "teal-dark": "#0A5E58",
        "teal-tint": "#E3F1EF",
        navy: "#122633",
        "navy-2": "#1B3648",
        g0: "#2E9E6B",
        g1: "#C9A227",
        g2: "#E08B2C",
        g3: "#D6542B",
        g4: "#A32332"
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "ui-sans-serif", "system-ui"],
        serif: ["Source Serif 4", "Georgia", "serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"]
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,34,43,.05), 0 4px 14px rgba(16,34,43,.04)"
      }
    }
  },
  plugins: []
};
