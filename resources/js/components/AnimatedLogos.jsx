import React from 'react';

const AnimatedLogos = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{background: 'linear-gradient(to bottom right, #1a202c, #2d3748)'}}>
      <div className="flex items-center justify-center space-x-8 md:space-x-16 mb-12">
        {/* Logo de Laravel */}
        <div className="float-animation">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center neon-glow" style={{backgroundColor: '#ef4444'}}>
            <span className="text-white text-2xl font-bold">LARAVEL</span>
          </div>
          <p className="mt-4 text-center text-red-400 font-bold">Laravel</p>
        </div>

        {/* Logo de React */}
        <div className="float-animation" style={{animationDelay: '0.5s'}}>
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center neon-glow" style={{backgroundColor: '#3b82f6'}}>
            <span className="text-white text-2xl font-bold">REACT</span>
          </div>
          <p className="mt-4 text-center text-blue-400 font-bold">React</p>
        </div>

        {/* Logo de Tailwind */}
        <div className="float-animation" style={{animationDelay: '1s'}}>
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center neon-glow" style={{backgroundColor: '#06b6d4'}}>
            <span className="text-white text-2xl font-bold">TAILWIND</span>
          </div>
          <p className="mt-4 text-center text-cyan-400 font-bold">Tailwind</p>
        </div>
      </div>

      {/* Texto animado */}
      <div className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{background: 'linear-gradient(to right, #ef4444, #3b82f6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
          ¡Ya se pudo el Laravel con React xddd
        </h1>
        <div className="mt-8 flex justify-center space-x-4">
          <div className="h-1 w-16 rounded-full" style={{backgroundColor: '#ef4444', animation: 'pulse 2s infinite'}}></div>
          <div className="h-1 w-16 rounded-full" style={{backgroundColor: '#3b82f6', animation: 'pulse 2s infinite', animationDelay: '0.2s'}}></div>
          <div className="h-1 w-16 rounded-full" style={{backgroundColor: '#33e0ffff', animation: 'pulse 2s infinite', animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedLogos;