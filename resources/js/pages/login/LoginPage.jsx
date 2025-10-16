import React from 'react';
import GalaxyAnimation from '../../components/GalaxyAnimation.jsx'; // Asegúrate de que la ruta es correcta

const BackArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
            
            <GalaxyAnimation className="absolute inset-0 z-0" density={1.6} glowIntensity={0.6}/>

            <div className="w-full max-w-4xl mx-auto bg-slate-800/60 backdrop-blur-sm rounded-2xl shadow-2xl flex flex-col lg:flex-row relative z-10 border border-slate-700">
                
                {/* COLUMNA IZQUIERDA: Actualizada con el nuevo degradado */}
                <div className="w-full lg:w-1/2 p-8 flex flex-col justify-center items-center bg-gradient-to-br from-brand-blue to-brand-teal rounded-t-2xl lg:rounded-l-2xl lg:rounded-tr-none">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-2">Sistema de Asistencia</h2>
                        <p className="text-blue-100">Bienvenido. Por favor, inicie sesión para continuar.</p>
                    </div>
                </div>

                {/* COLUMNA DERECHA: Actualizada con el color de acento amarillo */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12">
                    <button className="text-slate-400 hover:text-white mb-6">
                        <BackArrowIcon />
                    </button>
                    
                    <h1 className="text-3xl font-bold mb-2 text-slate-100">Login to system</h1>
                    <p className="text-slate-400 mb-8">
                        Please enter your login information or{' '}
                        {/* El enlace ahora es amarillo */}
                        <a href="#" className="text-brand-yellow hover:underline font-medium">
                            click here to registration
                        </a>
                    </p>

                    <form action="#" method="POST">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="correo" className="block text-sm font-medium text-slate-300">
                                    Username
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="correo"
                                        name="correo"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        // El color de foco ahora es amarillo
                                        className="appearance-none block w-full px-3 py-2 bg-slate-700/80 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        // El color de foco ahora es amarillo
                                        className="appearance-none block w-full px-3 py-2 bg-slate-700/80 border border-slate-600 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        // El color del checkbox ahora es amarillo
                                        className="h-4 w-4 text-brand-yellow focus:ring-brand-yellow border-slate-500 rounded bg-slate-700"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                                        Remember me
                                    </label>
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    // El botón ahora es amarillo con texto oscuro para mejor contraste
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-slate-900 bg-brand-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow focus:ring-offset-slate-900"
                                >
                                    Log In
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}