/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#080b12',
      },
      animation: {
        'float-slow': 'float 12s ease-in-out infinite',
        'float-mid': 'float 9s ease-in-out infinite reverse',
        'float-fast': 'float 7s ease-in-out infinite',
        'slide-up': 'slideUp 0.25s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -40px) scale(1.08)' },
          '66%': { transform: 'translate(-30px, 25px) scale(0.92)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
