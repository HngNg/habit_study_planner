/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Atomic Minimalism Palette
        base: {
          light: '#f8fafc', // slate-50
          dark: '#020617', // slate-950
        },
        primary: {
          DEFAULT: '#f59e0b', // amber-500 (Energy/Spark)
          hover: '#d97706', // amber-600
        },
        success: {
          DEFAULT: '#10b981', // emerald-500 (Growth)
          light: '#d1fae5', // emerald-100
        },
        focus: {
          DEFAULT: '#4f46e5', // indigo-600 (Depth)
          light: '#e0e7ff', // indigo-100
        },
        text: {
          primary: '#1e293b', // slate-800
          secondary: '#64748b', // slate-500
          muted: '#94a3b8', // slate-400
        },
        border: {
          DEFAULT: '#e2e8f0', // slate-200
          dark: '#334155', // slate-700
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
      },
    },
  },
  plugins: [],
}

