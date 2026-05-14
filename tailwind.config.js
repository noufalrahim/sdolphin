/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f1115",
        surface: "#1a1d23",
        primary: "#3b82f6",
        secondary: "#64748b",
        border: "#2d3139",
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}
