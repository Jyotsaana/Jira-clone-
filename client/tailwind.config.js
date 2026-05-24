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
          50:  '#EEEDFE',
          100: '#CECBF6',
          200: '#AFA9EC',
          300: '#9088E0',
          400: '#7F77DD',
          500: '#6E6EDA',
          600: '#534AB7',
          700: '#483EA8',
          800: '#3C3489',
          900: '#26215C',
        }
      }
    },
  },
  plugins: [],
}
