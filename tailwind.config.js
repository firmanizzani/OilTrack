/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background:  'var(--background)',
        surface:     'var(--surface)',
        surfaceHigh: 'var(--surface-high)',
        border:      'var(--border)',
        accent:      '#F97316',
        danger:      '#EF4444',
        warning:     '#EAB308',
        success:     '#22C55E',
        muted:       'var(--muted)',
        foreground:  'var(--foreground)',
      },
      borderRadius: {
        card: '12px',
        lg: '10px',
        md: '8px',
        sm: '6px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: 'var(--card-shadow)',
        glow: '0 0 20px rgba(249,115,22,0.15)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
