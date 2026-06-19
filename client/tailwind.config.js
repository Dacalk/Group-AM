/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: '#1a1d3a',
        sidebarLight: '#23275a',
        primary: '#5b5fc7',
        primaryDark: '#4a4eb5',
      }
    }
  },
  plugins: [],
}
