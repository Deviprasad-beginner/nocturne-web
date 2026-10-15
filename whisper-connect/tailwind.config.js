/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        backgroundTwo: '#050505',
        surface: 'rgba(16, 17, 29, 0.90)',
        surfaceLight: 'rgba(25, 25, 43, 0.80)',
        surfaceGlow: 'rgba(121, 88, 255, 0.06)',
        border: 'rgba(178, 158, 255, 0.13)',
        borderBright: 'rgba(157, 128, 255, 0.38)',
        borderGlow: 'rgba(185, 167, 255, 0.55)',
        text: '#f5f2ff',
        muted: '#88869b',
        mutedTwo: '#636174',
        purple: '#7958ff',
        purpleLight: '#b9a7ff',
        purpleDim: 'rgba(121, 88, 255, 0.18)',
        pink: '#db83ff',
        blue: '#70d8ff',
        green: '#70dca0',
        // Mood palette
        moodLonely: '#7b9cff',
        moodRestless: '#ff8c70',
        moodNostalgic: '#c9a96e',
        moodInspired: '#70dca0',
        moodAnxious: '#ff70b0',
        moodGrateful: '#f5d97a',

      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },
    },
  },
  plugins: [],
}
