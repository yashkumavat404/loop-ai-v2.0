import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",

  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        ink: "var(--text-primary)",
        muted: "var(--text-muted)",
        line: "var(--border)",
        surface: "var(--surface-soft)",
        brand: "var(--brand)",
      },

      boxShadow: {
        card: "var(--shadow-card)",
      },
    },
  },

  plugins: [],
};

export default config;
