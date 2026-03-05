/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#0a0f1e",
        surface: "#111827",
        card: "#1a2235",
        border: "#1e3a5f",
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#06b6d4",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
