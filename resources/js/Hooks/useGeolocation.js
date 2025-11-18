// resources/js/Hooks/useGeolocation.js
import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 MODO TESTING - Coordenadas por defecto
  // Cambia estas coordenadas cuando estés en producción
  const TESTING_MODE = true; // Cambiar a false en producción
  const DEFAULT_COORDINATES = {
    latitude: -13.532403,  // Coordenadas de tu oficina
    longitude: -77.0428,
    accuracy: 100
  };

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada por este navegador');
      setLoading(false);
      
      // En modo testing, usar coordenadas por defecto
      if (TESTING_MODE) {
        setLocation(DEFAULT_COORDINATES);
      }
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        
        // En modo testing, usar coordenadas por defecto incluso si hay error
        if (TESTING_MODE) {
          console.log('🧪 MODO TESTING: Usando coordenadas por defecto');
          setLocation(DEFAULT_COORDINATES);
          setError(null);
        } else {
          setError(getErrorMessage(err.code));
        }
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case 1:
        return 'Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación.';
      case 2:
        return 'No se pudo obtener tu ubicación. Verifica tu conexión.';
      case 3:
        return 'Tiempo de espera agotado al obtener ubicación.';
      default:
        return 'Error desconocido al obtener ubicación.';
    }
  };

  useEffect(() => {
    getCurrentPosition();
  }, []);

  return { location, error, loading, getCurrentPosition };
};