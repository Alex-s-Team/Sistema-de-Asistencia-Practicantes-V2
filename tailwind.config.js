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
            50: '#f0f7fa',
            100: '#daedf5',
            200: '#b8e0ed',
            300: '#8bcfe2',
            400: '#5fbcd6',
            500: '#3484A5', // Azul principal
            600: '#2a6d89',
            700: '#22586d',
            800: '#1b4652',
            900: '#163641',
          },
          secondary: {
            50: '#eef9f6',
            100: '#dbf2ea',
            200: '#b6e7d4',
            300: '#86d8b7',
            400: '#55c79b',
            500: '#2CA792', // Verde principal
            600: '#248a78',
            700: '#1d6e5f',
            800: '#17544a',
            900: '#124038',
          },
          accent: {
            50: '#fdf8e6',
            100: '#fbf1cc',
            200: '#f7e49a',
            300: '#f2d663',
            400: '#f0c84f', // Amarillo principal
            500: '#e6b527',
            600: '#c99a20',
            700: '#a27f1a',
            800: '#826617',
            900: '#685015',
          },
        },
        fontFamily: {
          sans: ['Inter', 'system-ui', 'sans-serif'],
        },
        animation: {
          'fade-in': 'fadeIn 0.5s ease-in-out',
          'slide-up': 'slideUp 0.3s ease-out',
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        keyframes: {
          fadeIn: {
            '0%': { opacity: '0' },
            '100%': { opacity: '1' },
          },
          slideUp: {
            '0%': { transform: 'translateY(10px)', opacity: '0' },
            '100%': { transform: 'translateY(0)', opacity: '1' },
          },
        },
      },
    },
    plugins: [],
  }
