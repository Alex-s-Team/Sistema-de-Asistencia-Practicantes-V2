import React from 'react';

const AnimatedLogos = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex flex-col items-center justify-center p-4">
      <div className="flex items-center justify-center space-x-8 md:space-x-16 mb-12">
        {/* Logo de Laravel */}
        <div className="animate-float">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500 blur-xl opacity-70 rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-red-500 to-red-700 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
              <svg className="w-16 h-16 text-white" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h128v128H0V0zm64 128C99.346 128 128 99.346 128 64S99.346 0 64 0 0 28.654 0 64s28.654 64 64 64z" fill="currentColor"/>
                <path d="M64 8c30.928 0 56 25.072 56 56s-25.072 56-56 56S8 94.928 8 64 33.072 8 64 8zm0 8c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48z" fill="#fff"/>
                <path d="M64 16c26.51 0 48 21.49 48 48s-21.49 48-48 48-48-21.49-48-48 21.49-48 48-48zm0 8c-22.091 0-40 17.909-40 40s17.909 40 40 40 40-17.909 40-40-17.909-40-40-40z" fill="currentColor"/>
                <path d="M64 24c22.091 0 40 17.909 40 40s-17.909 40-40 40-40-17.909-40-40 17.909-40 40-40zm0 8c-17.673 0-32 14.327-32 32s14.327 32 32 32 32-14.327 32-32-14.327-32-32-32z" fill="#fff"/>
                <path d="M64 32c17.673 0 32 14.327 32 32s-14.327 32-32 32-32-14.327-32-32 14.327-32 32-32zm0 8c-13.255 0-24 10.745-24 24s10.745 24 24 24 24-10.745 24-24-10.745-24-24-24z" fill="currentColor"/>
                <path d="M64 40c13.255 0 24 10.745 24 24s-10.745 24-24 24-24-10.745-24-24 10.745-24 24-24zm0 8c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16z" fill="#fff"/>
                <path d="M64 48c8.837 0 16 7.163 16 16s-7.163 16-16 16-16-7.163-16-16 7.163-16 16-16z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <p className="mt-4 text-center text-red-400 font-bold">Laravel</p>
        </div>

        {/* Logo de React */}
        <div className="animate-float" style={{ animationDelay: '0.5s' }}>
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-70 rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-blue-400 to-blue-600 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
              <svg className="w-16 h-16 text-white" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="64" cy="64" r="12" fill="currentColor"/>
                <path d="M64 32c-7.732 0-14 6.268-14 14s6.268 14 14 14 14-6.268 14-14-6.268-14-14-14zm0 8c3.314 0 6 2.686 6 6s-2.686 6-6 6-6-2.686-6-6 2.686-6 6-6z" fill="currentColor"/>
                <path d="M64 68c-7.732 0-14 6.268-14 14s6.268 14 14 14 14-6.268 14-14-6.268-14-14-14zm0 8c3.314 0 6 2.686 6 6s-2.686 6-6 6-6-2.686-6-6 2.686-6 6-6z" fill="currentColor"/>
                <path d="M32 64c0-7.732 6.268-14 14-14s14 6.268 14 14-6.268 14-14 14-14-6.268-14-14zm8 0c0 3.314 2.686 6 6 6s6-2.686 6-6-2.686-6-6-6-6 2.686-6 6z" fill="currentColor"/>
                <path d="M68 64c0-7.732 6.268-14 14-14s14 6.268 14 14-6.268 14-14 14-14-6.268-14-14zm8 0c0 3.314 2.686 6 6 6s6-2.686 6-6-2.686-6-6-6-6 2.686-6 6z" fill="currentColor"/>
                <path d="M64 16c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm0 8c22.091 0 40 17.909 40 40s-17.909 40-40 40-40-17.909-40-40 17.909-40 40-40z" fill="currentColor"/>
                <path d="M64 24c-22.091 0-40 17.909-40 40s17.909 40 40 40 40-17.909 40-40-17.909-40-40-40zm0 8c17.673 0 32 14.327 32 32s-14.327 32-32 32-32-14.327-32-32 14.327-32 32-32z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <p className="mt-4 text-center text-blue-400 font-bold">React</p>
        </div>

        {/* Logo de Tailwind */}
        <div className="animate-float" style={{ animationDelay: '1s' }}>
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-70 rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-cyan-400 to-cyan-600 w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/50">
              <svg className="w-16 h-16 text-white" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M64 8c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zm0 8c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z" fill="currentColor"/>
                <path d="M64 48c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zm0 8c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z" fill="currentColor"/>
                <path d="M64 88c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zm0 8c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z" fill="currentColor"/>
                <path d="M32 32c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zm0 8c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z" fill="currentColor"/>
                <path d="M96 32c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zm0 8c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z" fill="currentColor"/>
                <path d="M32 72c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zm0 8c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z" fill="currentColor"/>
                <path d="M96 72c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zm0 8c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8z" fill="currentColor"/>
                <path d="M64 16c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm0 8c22.091 0 40 17.909 40 40s-17.909 40-40 40-40-17.909-40-40 17.909-40 40-40z" fill="currentColor"/>
              </svg>
            </div>
          </div>
          <p className="mt-4 text-center text-cyan-400 font-bold">Tailwind</p>
        </div>
      </div>

      {/* Texto animado */}
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-blue-500 to-cyan-500 animate-pulse">
          ¡Ya se pudo el Laravel con React xddd!
        </h1>
        <div className="mt-8 flex justify-center space-x-4">
          <div className="h-1 w-16 bg-red-500 rounded-full animate-pulse"></div>
          <div className="h-1 w-16 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="h-1 w-16 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>

      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20"
            style={{
              width: `${Math.random() * 20 + 5}px`,
              height: `${Math.random() * 20 + 5}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedLogos;