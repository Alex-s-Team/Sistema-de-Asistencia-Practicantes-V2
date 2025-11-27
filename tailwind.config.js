// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.jsx",
    "./resources/**/*.js",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#3484A5', // Azul principal
          600: '#256985',
          700: '#1e5469',
          800: '#164454',
          900: '#0d3747',
        },
        secondary: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#2CA792', // Verde principal
          600: '#218571',
          700: '#1a6c5b',
          800: '#145346',
          900: '#0d3a31',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#F0C84F', // Amarillo principal
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'pulse-soft': 'pulse 3s infinite',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        'medium': '0 8px 30px -6px rgba(0, 0, 0, 0.12)',
        'large': '0 20px 50px -12px rgba(0, 0, 0, 0.18)',
      }
    },
  },
  plugins: [],
}