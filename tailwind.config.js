/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Mono"', 'monospace'],
        body: ['Nunito', 'sans-serif'],
      },
      colors: {
        bg: '#0c0e14',
        surface: '#161924',
        'surface-2': '#1e2333',
        border: '#2a3045',
        text: '#e8ecf5',
        muted: '#6b7a9e',
        vending: '#22d3a5',
        pool: '#a78bfa',
        washing: '#38bdf8',
        liquid: '#fb923c',
        warehouse: '#f59e0b',
        addons: '#f472b6',
        mpesa: '#4caf50',
      },
    },
  },
  plugins: [],
}
