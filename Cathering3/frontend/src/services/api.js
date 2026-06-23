import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

// Interceptor para inyectar el token Bearer dinámicamente
api.interceptors.request.use(
    (config) => {
        // oidc-client-ts guarda el usuario en sessionStorage por defecto
        const oidcStorageKey = 'oidc.user:http://localhost:8080/realms/proyecto-seguro:cathering-react';
        const oidcStorage = sessionStorage.getItem(oidcStorageKey);

        if (oidcStorage) {
            try {
                const parsed = JSON.parse(oidcStorage);
                if (parsed && parsed.access_token) {
                    config.headers.Authorization = `Bearer ${parsed.access_token}`;
                }
            } catch (e) {
                console.error("Error parsing OIDC session storage", e);
            }
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
