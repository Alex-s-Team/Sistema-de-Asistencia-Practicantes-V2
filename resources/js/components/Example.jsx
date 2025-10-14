import React from 'react';

const Example = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">
          ¡Hola, equipo!
        </h1>
        <div className="text-center">
          <p className="text-gray-600 mb-6">
            React está funcionando correctamente con Laravel ✅
          </p>
          <div className="flex justify-center space-x-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl">
              L
            </div>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
              R
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Example;