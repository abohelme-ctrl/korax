/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0A0E1A',
        card: '#111827',
        'card-hover': '#1a2234',
        border: '#1F2937',
        primary: '#3B82F6',
        'primary-dark': '#2563EB',
        live: '#EF4444',
        'live-bg': 'rgba(239,68,68,0.12)',
        green: '#22C55E',
        'green-bg': 'rgba(34,197,94,0.12)',
        gold: '#F59E0B',
        'gold-bg': 'rgba(245,158,11,0.12)',
        text: '#F9FAFB',
        muted: '#6B7280',
        'muted-light': '#9CA3AF',
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'pulse-live': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
