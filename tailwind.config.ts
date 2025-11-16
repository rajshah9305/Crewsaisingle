import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: "#FF6B35",
          hover: "#E85A2A",
        },
        black: {
          DEFAULT: "#1A1A1A",
          5: "#F7F7F7",
          10: "#E6E6E6",
          20: "#CCCCCC",
          40: "#999999",
          60: "#666666",
          80: "#333333",
        },
        white: {
          DEFAULT: "#FFFFFF",
          subtle: "#FAFAFA",
          secondary: "#F5F5F5",
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
