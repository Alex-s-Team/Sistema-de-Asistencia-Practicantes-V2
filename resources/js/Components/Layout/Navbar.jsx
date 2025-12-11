import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 shadow-md bg-gradient-to-r from-[#0C3C60] via-[#13527f] to-[#0C3C60]">
      <div className="px-4 h-16 flex items-center justify-between">
        
        {/* --- IZQUIERDA: LOGO + TÍTULO --- */}
        <div className="flex items-center gap-4">
          {/* Botón de menú (solo móvil) */}
          <button
            onClick={onMenuClick}
            className="lg:hidden text-white hover:text-gray-200 hover:scale-110 transition"
          >
            <Bars3Icon className="h-7 w-7" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-xl backdrop-blur-md shadow-sm">
              <img
                src="/assets/logo.jpg"
                alt="Logo"
                className="h-10 w-10 rounded-lg object-contain"
              />
            </div>

            {/* Texto del sistema */}
            <div className="hidden md:block leading-tight">
              <h1 className="text-lg font-bold text-white tracking-wide">
                Sistema Inteligente de Asistencias
              </h1>
              <p className="text-xs text-gray-200">IMPORTADORA REGOCIJO</p>
            </div>
          </div>
        </div>

        {/* --- DERECHA: NOTIFICACIONES + USUARIO --- */}
        <div className="flex items-center gap-4">

          {/* Notificación bell */}
          <button className="relative bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur transition shadow-md">
            <BellIcon className="h-6 w-6 text-white" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-[#F0C84F] rounded-full"></span>
          </button>

          {/* Menú usuario */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl backdrop-blur text-white transition shadow-sm">
              <UserCircleIcon className="h-8 w-8" />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-200 capitalize">{user?.role}</p>
              </div>
            </Menu.Button>

            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Menu.Items className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl py-2 border border-gray-100 overflow-hidden">
                
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={handleLogout}
                      className={`${
                        active ? "bg-gray-100" : ""
                      } flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 transition`}
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 text-gray-600" />
                      Cerrar Sesión
                    </button>
                  )}
                </Menu.Item>

              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
