/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        nature: {
          50: '#f4f6f4',
          100: '#e5ece5',
          200: '#cbdacb',
          300: '#a5c0a6',
          400: '#779f79',
          500: '#528055',
          600: '#3f6742',
          700: '#335235',
          800: '#2a422c',
          900: '#233725',
          950: '#111e13',
        },
        earth: {
          50: '#faf8f5',
          100: '#f3eee6',
          200: '#e6dcce',
          300: '#d5c4af',
          400: '#bf9e80',
          500: '#ab8465',
          600: '#946f52',
          700: '#775741',
          800: '#614736',
          900: '#4f3b2d',
          950: '#2a1e16',
        },
        stone: {
          850: '#212529',
          925: '#15181b',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
