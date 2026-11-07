/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        serif: ["var(--font-serif)", "Newsreader", "Georgia", "serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      colors: {
        brand: {
          50: "#f0fdf4",
          100: "#dcfce7",
          500: "#16a34a",
          700: "#146e52",
          800: "#0f573f",
        },
        paper: {
          50: "#fdfbf7",
          100: "#f9f6f0",
          200: "#f1ebe1",
          300: "#e6decfa",
        },
        ink: {
          900: "#0f1f24",
          800: "#172b31",
          700: "#223d45",
          600: "#34535d",
          500: "#55747e",
        },
        terracotta: {
          DEFAULT: "#c25e3e",
          50: "#faf2ee",
          100: "#f5e2d9",
          500: "#c25e3e",
          600: "#a94c2d",
        },
        sage: {
          DEFAULT: "#1e6056",
          50: "#f0f6f4",
          100: "#dbeae5",
          500: "#1e6056",
          600: "#164b43",
          700: "#0e342e",
        },
      },
    },
  },
  plugins: [],
};
