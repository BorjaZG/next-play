/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          purple: '#A855F7',
          fuchsia: '#D946EF',
          orange: '#F97316',
        },
        dark: {
          bg: '#0F0F0F',
          card: '#1A1A1A',
          hover: '#2A2A2A',
        }
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #A855F7 0%, #D946EF 50%, #F97316 100%)',
      }
    },
  },
  plugins: [],
}