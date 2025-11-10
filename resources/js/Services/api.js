// resources/js/Services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true, // Para incluir cookies en las requests
});

// Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Debug: ver qué se está enviando
        console.log('Request:', {
            method: config.method,
            url: config.url,
            data: config.data,
            headers: config.headers
        });
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Debug: ver qué error se recibió
        console.error('Response Error:', {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers
        });

        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            
            // Redirigir al login si no estamos ya ahí
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        if (error.response?.status === 422) {
            // Error de validación
            console.error('Errores de validación:', error.response.data.errors);
        }

        return Promise.reject(error);
    }
);

export default api;