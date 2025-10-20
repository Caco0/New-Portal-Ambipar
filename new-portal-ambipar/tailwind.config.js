/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <- adiciona isso
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
