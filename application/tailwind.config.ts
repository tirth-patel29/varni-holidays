import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Tactile Voyage Palette (Brand Core)
        ocean: {
          DEFAULT: "#153650",
          dark: "#0B1E2E",
          light: "#24689B",
        },
        sand: {
          DEFAULT: "#F5F2EB",
          light: "#FBF9F5",
          dark: "#E3DCCB",
        },
        gold: {
          DEFAULT: "#E9B95E",
          deep: "#C29033",
          light: "#F7E5BD",
        },

        // Core Palette
        primary: "#002037",
        "primary-container": "#153650",
        "on-primary": "#ffffff",
        "on-primary-container": "#819fbe",
        secondary: "#186393",
        "secondary-container": "#8ccaff",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#005582",
        tertiary: "#2b1c00",
        "tertiary-container": "#453000",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#c1953e",

        // Warm Tactile Surfaces
        surface: "#fbf9f3",
        "on-surface": "#1b1c18",
        "on-surface-variant": "#42474d",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f5f3ed",
        "surface-container": "#f0eee8",
        "surface-container-high": "#eae8e2",
        "surface-container-highest": "#e4e2dd",
        "surface-cream-subtle": "#F1EEE5",
        "surface-sand-tint": "#E8E3D5",

        // Accents & Atmosphere
        "ocean-mist-soft": "#E4EEF5",
        "gold-light": "#F7E5BD",
        "gold-deep": "#C29033",
        "tertiary-fixed-dim": "#f0bf63",
        "tertiary-fixed": "#ffdea7",
        "navy-shadow-tint": "#0C2132",
        error: "#ba1a1a",
      },
      borderRadius: {
        DEFAULT: "1rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      spacing: {
        "margin-mobile": "1.25rem",
        gutter: "1.5rem",
        "space-xl": "3.5rem",
        "space-lg": "2rem",
        margin: "3rem",
        "gutter-mobile": "1rem",
        "space-xs": "0.375rem",
        "space-md": "1.25rem",
        "space-sm": "0.75rem",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        headline: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-jakarta)", "sans-serif"],
        body: ["var(--font-jakarta)", "sans-serif"],
      },
      boxShadow: {
        "clay-card": "8px 16px 28px rgba(21,54,80,0.06), -6px -6px 16px rgba(255,255,255,0.8)",
        "clay-hero": "8px 20px 40px rgba(21,54,80,0.1), -8px -8px 24px rgba(255,255,255,0.95)",
        "clay-inset": "inset 2px 2px 5px rgba(21,54,80,0.06), inset -2px -2px 5px rgba(255,255,255,0.8)",
        "clay-button": "0 8px 18px rgba(21,54,80,0.22)",
        "clay-floating": "16px 32px 48px rgba(21,54,80,0.12), -4px -4px 20px rgba(255,255,255,0.6)",
      },
    },
  },
  plugins: [],
};

export default config;

