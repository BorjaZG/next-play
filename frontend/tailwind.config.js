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
          green: '#00e054',
        },
        dark: {
          bg: '#14181c',
          card: '#1c2228',
          hover: '#2c3440',
          border: '#2c3440',
          elevated: '#242c36',
          elevated2: '#1e252e',
        }
      },
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, #A855F7 0%, #D946EF 50%, #F97316 100%)',
      }
    },
  },
  plugins: [],
}
