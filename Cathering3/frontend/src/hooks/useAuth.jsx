import React, { createContext, useContext, useMemo } from 'react';
import { useAuth as useOidcAuth } from 'react-oidc-context';

import UserService from '../services/UserService';
import ColegioService from '../services/ColegioService';
import ProductService from '../services/ProductService';
import OrderService from '../services/OrderService';
import WalletService from '../services/WalletService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const oidc = useOidcAuth();

    // 1. Extraer el token de Keycloak
    const token = oidc.user?.access_token || null;

    // 2. Extraer y mapear el perfil del usuario
    const user = useMemo(() => {
        if (!oidc.user || !token) return null;

        let realmRoles = [];
        try {
            // Decodificar manualmente la carga útil del JWT (Access Token)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decodedToken = JSON.parse(jsonPayload);
            realmRoles = decodedToken.realm_access?.roles || [];
        } catch (e) {
            console.error("Error decodificando access_token", e);
        }

        const profile = oidc.user.profile;

        let role = 'estudiante'; // default
        if (realmRoles.includes('admin')) {
            role = 'admin';
        } else if (realmRoles.includes('cafeteria')) {
            role = 'cafeteria';
        } else if (realmRoles.includes('personal_academico')) {
            role = 'personal_academico';
        }

        // BYPASS SOLICITADO: Forzar siempre colegio_id: 1 fijo localmente para el ADMIN
        let colegioId = profile.colegio_id || null;
        if (role === 'admin' || role === 'cafeteria') {
            colegioId = 1;
        }

        return {
            id: profile.sub,
            username: profile.preferred_username || profile.given_name || 'Usuario',
            email: profile.email,
            role: role,
            colegio_id: colegioId
        };
    }, [oidc.user, token]);

    // 3. Inicialización de servicios (Solo si hay token válido)
    const userService = useMemo(() => token ? new UserService(token) : null, [token]);
    const colegioService = useMemo(() => token ? new ColegioService(token) : null, [token]);
    const productService = useMemo(() => token ? new ProductService(token) : null, [token]);
    const orderService = useMemo(() => token ? OrderService : null, [token]);
    const walletService = useMemo(() => token ? WalletService : null, [token]);

    const contextValue = useMemo(() => ({
        token,
        user,
        isAuthenticated: oidc.isAuthenticated,
        loading: oidc.isLoading,
        login: () => oidc.signinRedirect(),
        register: () => oidc.signinRedirect({ extraQueryParams: { kc_action: 'register' } }), // Opcional, delega a Keycloak
        logout: () => {
            oidc.removeUser();
            oidc.signoutRedirect();
        },
        userService,
        colegioService,
        productService,
        orderService,
        walletService
    }), [
        token, user, oidc.isAuthenticated, oidc.isLoading, oidc,
        userService, colegioService, productService, orderService, walletService
    ]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);