import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { 
  HomeIcon,
  ClockIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isStaff, isIntern } = useAuth();

  const navigation = {
    admin: [
      { name: 'Dashboard', href: '/', icon: HomeIcon },
      { name: 'Validar Asistencias', href: '/validate-attendance', icon: CheckCircleIcon },
      { name: 'Gestión de Usuarios', href: '/users', icon: UserGroupIcon },
      { name: 'Gestión de Tareas', href: '/tasks', icon: ClipboardDocumentListIcon },
      { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
    ],
    staff: [
      { name: 'Dashboard', href: '/', icon: HomeIcon },
      { name: 'Gestión de Usuarios', href: '/users', icon: UserGroupIcon },
      { name: 'Gestión de Tareas', href: '/tasks', icon: ClipboardDocumentListIcon },
      { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
    ],
    intern: [
      { name: 'Dashboard', href: '/', icon: HomeIcon },
      { name: 'Marcar Asistencia', href: '/mark-attendance', icon: ClockIcon },
      { name: 'Mis Tareas', href: '/my-tasks', icon: ClipboardDocumentListIcon },
      { name: 'Chat', href: '/chat', icon: ChatBubbleLeftRightIcon },
    ],
  };

  const links = navigation[user?.role] || [];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {links.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info Card */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

