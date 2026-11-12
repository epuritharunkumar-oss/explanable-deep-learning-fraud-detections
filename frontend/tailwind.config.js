/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060B19',
          900: '#0A1329',
          800: '#0F1E3D',
          700: '#172A54',
          600: '#203B75',
        },
        brand: {
          blue: '#2563EB',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          orange: '#F97316',
          rose: '#EF4444',
        }
      }
    },
  },
  plugins: [],
}
