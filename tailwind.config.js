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
        // ألوان ديناميكية (تتغير مع الثيم) — تستخدم CSS Variables
        bg:           'rgb(var(--c-bg)      / <alpha-value>)',
        card:         'rgb(var(--c-card)    / <alpha-value>)',
        'card-hover': 'rgb(var(--c-card-h)  / <alpha-value>)',
        border:       'rgb(var(--c-border)  / <alpha-value>)',
        text:         'rgb(var(--c-text)    / <alpha-value>)',
        muted:        'rgb(var(--c-muted)   / <alpha-value>)',
        'muted-light':'rgb(var(--c-muted-l) / <alpha-value>)',
        // ألوان ثابتة (لا تتغير)
        primary:      '#3B82F6',
        'primary-dark':'#2563EB',
        live:         '#EF4444',
        'live-bg':    'rgba(239,68,68,0.12)',
        green:        '#22C55E',
        'green-bg':   'rgba(34,197,94,0.12)',
        gold:         '#F59E0B',
        'gold-bg':    'rgba(245,158,11,0.12)',
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
