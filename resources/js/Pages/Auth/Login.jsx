import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { Button } from "../../Components/Common/Button";
import { Input } from "../../Components/Common/Input";
import { Alert } from "../../Components/Common/Alert";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [dni, setDni] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (dni.length !== 8 || !/^\d+$/.test(dni)) {
      setError("El DNI debe tener exactamente 8 dígitos");
      return;
    }

    setLoading(true);

    try {
      await login(dni, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Error al iniciar sesión."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: "url('/assets/fondo.jpg')"
      }}
    >
      {/* --- Capa de oscurecimiento con degradado --- */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]"></div>

      {/* --- Shapes decorativos --- */}
      <div className="absolute top-10 right-10 w-[400px] h-[400px] bg-[#DD8A1C]/25 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-20 left-20 w-[350px] h-[350px] bg-[#0C3C60]/30 blur-[130px] rounded-full"></div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="relative z-10 w-full max-w-md px-4">
      
        {/* Logo + Nombre empresa */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="mx-auto w-28 h-28 bg-white/20 backdrop-blur-xl rounded-2xl shadow-xl border border-white/40 p-3 hover:scale-105 transition-all">
            <img
              src="/assets/logo.jpg"
              alt="Importadora Regocijo"
              className="w-full h-full object-contain"
            />
          </div>

          <h1 className="mt-5 text-3xl font-extrabold text-white tracking-wide drop-shadow-lg">
            IMPORTADORA REGOCIJO
          </h1>
          <p className="text-gray-200 mt-1 text-sm">
            Sistema Inteligente de Asistencias
          </p>
        </div>

        {/* TARJETA DEL FORMULARIO ESTILO GLASS */}
        <div className="bg-white/20 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/30 p-8">

          {/* Título */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-[#DD8A1C] rounded-full flex items-center justify-center shadow-lg mr-3">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4 21a8 8 0 0116 0H4z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white drop-shadow">
              Iniciar Sesión
            </h2>
          </div>

          {/* Error */}
          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError("")}
              className="mb-4"
            />
          )}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              label="DNI"
              placeholder="76412311"
              value={dni}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 8);
                setDni(value);
              }}
              required
              maxLength={8}
            />

            <Input
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#DD8A1C] to-[#b96b12] 
                         text-white font-semibold rounded-xl shadow-lg hover:shadow-2xl
                         transition-all duration-300 hover:scale-[1.02]"
              loading={loading}
              disabled={loading}
            >
              {loading ? "Ingresando..." : "Ingresar al Sistema"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-gray-200 text-sm drop-shadow">
          © 2025 Importadora Regocijo — Gestión Logística
        </p>
      </div>
    </div>
  );
};

export default Login;
