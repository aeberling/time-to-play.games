import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Configure Laravel Echo for WebSocket communication with Reverb
 */
window.Pusher = Pusher;

// Enable Pusher logging for debugging
Pusher.logToConsole = true;

console.log('[Bootstrap] Configuring Echo with:', {
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    scheme: import.meta.env.VITE_REVERB_SCHEME,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
});

const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'https';
const useTLS = scheme === 'https';

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
    forceTLS: useTLS,
    encrypted: useTLS,
    disableStats: true,
    enabledTransports: useTLS ? ['wss'] : ['ws'],
    authEndpoint: '/broadcasting/auth',
    auth: {
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
    },
});

console.log('[Bootstrap] Echo initialized:', window.Echo);
