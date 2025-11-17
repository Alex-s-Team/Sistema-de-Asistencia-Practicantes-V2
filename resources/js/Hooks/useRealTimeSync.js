// resources/js/Hooks/useRealTimeSync.js
import { useEffect, useCallback } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Configurar Echo (Laravel Broadcasting)
window.Echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST || 'localhost',
  wsPort: import.meta.env.VITE_REVERB_PORT || 8080,
  wssPort: import.meta.env.VITE_REVERB_PORT || 8080,
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME || 'http') === 'https',
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
});

/**
 * Hook para sincronización en tiempo real
 * @param {string} dataType - Tipo de dato a escuchar: 'user', 'attendance', 'task', 'justification'
 * @param {function} onUpdate - Callback cuando hay actualización
 */
export const useRealTimeSync = (dataType, onUpdate) => {
  const handleDataUpdate = useCallback((event) => {
    console.log('Real-time update:', event);
    
    // Si el tipo de dato coincide, ejecutar callback
    if (event.type === dataType) {
      onUpdate(event);
    }
  }, [dataType, onUpdate]);

  useEffect(() => {
    // Suscribirse al canal de actualizaciones del sistema
    const channel = window.Echo.channel('system-updates');
    
    channel.listen('.data.updated', handleDataUpdate);

    // Cleanup al desmontar
    return () => {
      channel.stopListening('.data.updated', handleDataUpdate);
      window.Echo.leaveChannel('system-updates');
    };
  }, [handleDataUpdate]);
};

/**
 * Hook para múltiples tipos de datos
 */
export const useMultipleSync = (config) => {
  useEffect(() => {
    const channel = window.Echo.channel('system-updates');
    
    const handleUpdate = (event) => {
      console.log('Multi-sync update:', event);
      
      // Ejecutar el callback correspondiente según el tipo
      const handler = config[event.type];
      if (handler && typeof handler === 'function') {
        handler(event);
      }
    };

    channel.listen('.data.updated', handleUpdate);

    return () => {
      channel.stopListening('.data.updated', handleUpdate);
      window.Echo.leaveChannel('system-updates');
    };
  }, [config]);
};

export default useRealTimeSync;