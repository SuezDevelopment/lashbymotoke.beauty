import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'sd': { 'min': '760px', 'max': '1282px' },
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
    keyframes: {
      scroll: {
        "0%": { transform: "translateX(0)" },
        '100%': { transform: 'translateX(-50%)' },
      },
    },
    animation: {
      scroll: "scroll 30s linear infinite",
      'infinite-scroll': 'scroll 25s linear infinite',
    },
  },
  plugins: [],
};
export default config;
