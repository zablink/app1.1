// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}", // 👈 เพิ่มตรงนี้
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)'],
        header: ['var(--font-header)'],
      },
    },
  },
  plugins: [],
}
