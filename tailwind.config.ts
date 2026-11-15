import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#FAFAF9",
        surface: "#F5F4F0",
        ink: "#18181B",
        graphite: "#57534E",
        forest: {
          DEFAULT: "#0F4C3A",
          dark: "#0B3B2D",
          light: "#E6F2EE",
        },
        clay: {
          DEFAULT: "#D95D39",
          hover: "#BF4B28",
          light: "#FFF1EC",
        },
        line: "#E7E5E4",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
      },
      boxShadow: {
        bento:
          "0 1px 3px rgba(24, 24, 27, 0.03), 0 10px 30px -5px rgba(24, 24, 27, 0.05)",
        "bento-hover":
          "0 4px 12px rgba(15, 76, 58, 0.06), 0 20px 40px -10px rgba(24, 24, 27, 0.10)",
      },
    },
  },
  plugins: [],
};
export default config;
