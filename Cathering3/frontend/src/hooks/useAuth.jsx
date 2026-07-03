import React, { createContext, useCallback, useContext, useMemo } from 'react';
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

        let platformRoles = [];
        try {
            // Decodificar manualmente la carga útil del JWT (Access Token)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decodedToken = JSON.parse(jsonPayload);
            platformRoles = extractCatheringRoles(decodedToken);
        } catch (e) {
            console.error("Error decodificando access_token", e);
        }

        const profile = oidc.user.profile;

        let role = 'estudiante'; // default
        if (platformRoles.includes('admin')) {
            role = 'admin';
        } else if (platformRoles.includes('cafeteria')) {
            role = 'cafeteria';
        } else if (platformRoles.includes('personal_academico')) {
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

    const login = useCallback((returnTo) => {
        const safeReturnTo = normalizeLocalReturnUrl(returnTo || `${window.location.pathname}${window.location.search}`);
        if (safeReturnTo) {
            sessionStorage.setItem('cathering_post_login_return_url', safeReturnTo);
        }

        return oidc.signinRedirect({
            state: safeReturnTo ? { returnTo: safeReturnTo } : undefined
        });
    }, [oidc]);

    const register = useCallback((returnTo) => {
        const safeReturnTo = normalizeLocalReturnUrl(returnTo || `${window.location.pathname}${window.location.search}`);
        if (safeReturnTo) {
            sessionStorage.setItem('cathering_post_login_return_url', safeReturnTo);
        }

        return oidc.signinRedirect({
            state: safeReturnTo ? { returnTo: safeReturnTo } : undefined,
            extraQueryParams: { kc_action: 'register' }
        });
    }, [oidc]);

    const logout = useCallback(() => {
        oidc.removeUser();
        oidc.signoutRedirect();
    }, [oidc]);

    const contextValue = useMemo(() => ({
        token,
        user,
        isAuthenticated: oidc.isAuthenticated,
        loading: oidc.isLoading,
        login,
        register,
        logout,
        userService,
        colegioService,
        productService,
        orderService,
        walletService
    }), [
        token, user, oidc.isAuthenticated, oidc.isLoading, login, register, logout,
        userService, colegioService, productService, orderService, walletService
    ]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

function extractCatheringRoles(decodedToken) {
    const roles = new Set([
        ...(decodedToken.realm_access?.roles || []),
        ...(decodedToken.resource_access?.['cathering-react']?.roles || []),
        ...(decodedToken.resource_access?.['cathering-backend']?.roles || [])
    ]);

    if (roles.has('cathering_admin')) {
        roles.add('admin');
    }
    if (roles.has('cathering_estudiante')) {
        roles.add('estudiante');
    }
    if (roles.has('cathering_cafeteria')) {
        roles.add('cafeteria');
    }
    if (roles.has('cathering_personal_academico')) {
        roles.add('personal_academico');
    }

    return Array.from(roles);
}

function normalizeLocalReturnUrl(url) {
    if (!url || typeof url !== 'string') return null;
    if (!url.startsWith('/') || url.startsWith('//')) return null;

    const path = url.split('#')[0];
    if (path === '/login' || path === '/register' || path.startsWith('/login?') || path.startsWith('/register?')) {
        return null;
    }

    return url;
}
