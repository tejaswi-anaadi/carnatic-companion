/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        crimson: {
          DEFAULT: '#9B1C1C',
          dark: '#6B0F0F',
          light: '#C03030',
        },
        gold: {
          DEFAULT: '#D4A24C',
          dark: '#A67D32',
          light: '#E8C078',
        },
        saffron: {
          DEFAULT: '#E07A1F',
          dark: '#B85E0F',
        },
        cream: {
          DEFAULT: '#FBF5E9',
          dark: '#F0E8D2',
        },
        ink: '#1C1410',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        temple: '0 2px 0 0 #D4A24C, 0 6px 16px -8px rgba(28,20,16,0.25)',
        glow: '0 0 0 3px rgba(212,162,76,0.5), 0 0 24px rgba(224,122,31,0.4)',
      },
      keyframes: {
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(212,162,76,0.6)' },
          '50%': { boxShadow: '0 0 0 8px rgba(212,162,76,0)' },
        },
      },
      animation: {
        pulseGold: 'pulseGold 0.6s ease-out',
      },
    },
  },
  plugins: [],
}
