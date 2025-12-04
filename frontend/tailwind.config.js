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
          DEFAULT: '#f59e0b',
          hover: '#d97706',
        },
        'base-light': '#f8fafc',
        'base-dark': '#0f172a',
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',
        'text-muted': '#94a3b8',
        'bg-card': '#ffffff',
        border: {
          DEFAULT: '#e2e8f0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
