/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // تعريف الخطوط هنا لتسهيل استخدامها
      fontFamily: {
        arabic: ['"IBM Plex Sans Arabic"', 'sans-serif'],
        english: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}