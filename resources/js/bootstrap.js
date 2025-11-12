import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// 🔹 Configurar Axios
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// 🔹 Agregar token de autenticación si existe en localStorage
const token = localStorage.getItem('token');
if (token) {
    window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// 🔹 Configurar Laravel Echo con Reverb
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],

    // URL de autenticación para canales privados
    authEndpoint: `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/broadcasting/auth`,

    auth: {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        },
    },
});

// 🔹 Logs para depuración de la conexión
window.Echo.connector.pusher.connection.bind('connected', () => {
    console.log('✅ WebSocket conectado correctamente');
});

window.Echo.connector.pusher.connection.bind('error', (err) => {
    console.error('❌ Error en WebSocket:', err);
});

window.Echo.connector.pusher.connection.bind('disconnected', () => {
    console.log('🔌 WebSocket desconectado');
});

export default window.Echo;
