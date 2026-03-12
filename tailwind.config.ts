import type { Config } from "tailwindcss";
import daisyui from "daisyui";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#172c3c",
          navy: "#274862",
          wine: "#995052",
          orange: "#d96831",
          gold: "#e6b33d",
        },
      },
    },
  },
  plugins: [daisyui], // Importação direta como módulo ES
  daisyui: {
    themes: [
      {
        cincopila: {
          "primary": "#172c3c",
          "secondary": "#274862",
          "accent": "#d96831",
          "neutral": "#995052",
          "base-100": "#ffffff",
          "info": "#274862",
          "success": "#172c3c",
          "warning": "#e6b33d",
          "error": "#995052",
        },
      },
    ],
  },
} satisfies Config;