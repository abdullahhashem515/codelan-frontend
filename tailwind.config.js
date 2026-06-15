/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // تعريف الخطوط هنا لتسهيل استخدامها
      fontFamily: {
        arabic:  ['var(--font-ar)', 'sans-serif'],
        english: ['var(--font-en)', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}