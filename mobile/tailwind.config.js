/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#07070a',
        card: 'rgba(18, 18, 25, 0.7)',
        cardHover: 'rgba(25, 25, 35, 0.8)',
        textPrimary: '#f0f0f5',
        textMuted: '#8b8b9f',
        accent: '#8b6aff',
        accentGlow: 'rgba(139, 106, 255, 0.3)',
        border: 'rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        heading: ['Cormorant Garamond', 'serif'],
        body: ['DM Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

