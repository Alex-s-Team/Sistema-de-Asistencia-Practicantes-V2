/** @type {import('tailwindcss').Config} */
export default { // <-- EL ÚNICO CAMBIO ESTÁ AQUÍ
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.jsx",
  ],
  theme: {
    extend: {
      colors: {
          'brand': {
              'blue': '#3484A5',   // Azul acero
              'teal': '#2CA792',   // Verde azulado
              'yellow': '#F0C84F', // Amarillo dorado
          },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
    },
  },
  plugins: [],
};