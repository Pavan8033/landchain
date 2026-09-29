/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: "#101827",
          50: "#1a2538",
          100: "#141e30",
          200: "#101827",
          300: "#0c1320",
          400: "#080c14",
        },
        slate: {
          navy: "#202D40",
          light: "#2C3E55",
          dark: "#172231",
        },
        ivory: {
          DEFAULT: "#F5F3EE",
          50: "#FAF9F6",
          100: "#F5F3EE",
          200: "#ECE7DD",
          300: "#DFD7C7",
        },
        gold: {
          DEFAULT: "#C6A66B",
          light: "#D8BF8F",
          dark: "#A6864C",
          hover: "#B5955A",
        },
        muted: {
          blue: "#5278A5",
          slate: "#64748B",
        },
        status: {
          success: "#24845D",
          warning: "#B77A2F",
          error: "#C34D4D",
          info: "#5278A5",
        }
      },
      fontFamily: {
        sans: ["Manrope", "Inter", "system-ui", "sans-serif"],
        serif: ["'DM Serif Display'", "'Playfair Display'", "Georgia", "serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(16, 24, 39, 0.07), 0 4px 6px -2px rgba(16, 24, 39, 0.04)",
        card: "0 4px 20px -2px rgba(16, 24, 39, 0.08)",
        gold: "0 4px 14px 0 rgba(198, 166, 107, 0.3)",
      }
    },
  },
  plugins: [],
}
