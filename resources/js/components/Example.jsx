import React from "react";

/*
========================================================
💡 Proyecto: Laravel + React + Vite + TailwindCSS
--------------------------------------------------------
🧱 Stack tecnológico:
- Laravel (PHP) → Backend y rutas.
- React (JSX) → Interfaz dinámica del usuario.
- Vite → Compilador moderno y rápido (hot reload).
- TailwindCSS → Framework de estilos utilitarios.
--------------------------------------------------------
📂 Flujo general:
1️⃣ Laravel sirve "welcome.blade.php"
2️⃣ Ese HTML tiene <div id="app"></div>
3️⃣ React se monta dentro de ese div.
4️⃣ Vite compila Tailwind + React.
========================================================
*/

const Example = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8">
      {/* Contenedor principal */}
      <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-white/20 max-w-2xl w-full text-center text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg animate-fade-in">
          Laravel + React + TailwindCSS 🤙
        </h1>
        <p className="text-lg text-gray-200 mb-8">
          porfin se pudo xdxd 
        </p>

        {/* Logos animados */}
        <div className="flex justify-center gap-10 flex-wrap">
          {/* Laravel */}
          <div className="group relative flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-xl shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 animate-bounce">
              L
            </div>
            <span className="mt-3 text-red-300 font-semibold group-hover:text-red-100 transition-all">Laravel</span>
          </div>

          {/* React */}
          <div className="group relative flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:-rotate-6 animate-pulse">
              R
            </div>
            <span className="mt-3 text-blue-200 font-semibold group-hover:text-blue-50 transition-all">React</span>
          </div>

          {/* Tailwind */}
          <div className="group relative flex flex-col items-center">
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-bold text-xl shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 animate-spin-slow">
              T
            </div>
            <span className="mt-3 text-cyan-200 font-semibold group-hover:text-cyan-50 transition-all">Tailwind</span>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-sm text-gray-200">
            💨 Todo esto está estilizado con <strong>TailwindCSS</strong>, sin escribir ni una sola línea de CSS manual.
          </p>
        </div>
      </div>

      {/* Pie informativo */}
      <div className="mt-8 text-center text-white/80 text-sm">
        ⚙️ Compilado con <strong>Vite</strong> y <strong>PostCSS</strong> – Integrado en <strong>Laravel</strong>.
      </div>
    </div>
  );
};

export default Example;

/*
========================================================
📘 Clases destacadas de Tailwind usadas:
- bg-gradient-to-br → gradiente diagonal (azul → morado → rosa)
- backdrop-blur-md → efecto glassmorphism
- animate-bounce / animate-pulse / animate-spin-slow → animaciones integradas
- group-hover → transiciones suaves al pasar el mouse
- text-white/80 → opacidad controlada en texto
========================================================
*/
