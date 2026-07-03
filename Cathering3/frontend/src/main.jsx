import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider as OidcProvider } from 'react-oidc-context';

import App from './App.jsx';
import { AuthProvider as LocalAuthProvider } from './hooks/useAuth'; 
import { BrowserRouter as Router } from 'react-router-dom';
import './styles.css';
import { CartProvider } from './context/CartContext';

const oidcConfig = {
  authority: "http://localhost:8080/realms/proyecto-seguro",
  client_id: "cathering-react",
  redirect_uri: `${window.location.origin}/`,
  response_type: "code",
  scope: "openid profile email",
  onSigninCallback: (user) => {
    const storedReturnTo = sessionStorage.getItem('cathering_post_login_return_url');
    const oidcReturnTo = user?.state?.returnTo;
    const returnTo = normalizeLocalReturnUrl(oidcReturnTo) || normalizeLocalReturnUrl(storedReturnTo) || defaultRouteForRoles(user);

    sessionStorage.removeItem('cathering_post_login_return_url');
    window.history.replaceState({}, document.title, returnTo);
  }
};

function normalizeLocalReturnUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (!url.startsWith('/') || url.startsWith('//')) return null;

  const path = url.split('#')[0];
  if (path === '/login' || path === '/register' || path.startsWith('/login?') || path.startsWith('/register?')) {
    return null;
  }

  return url;
}

function defaultRouteForRoles(user) {
  const roles = rolesFromAccessToken(user?.access_token);

  if (roles.includes('admin')) return '/manage-users';
  if (roles.includes('cafeteria')) return '/manage-menu';
  if (roles.includes('personal_academico') || roles.includes('estudiante')) return '/menu';

  return '/';
}

function rolesFromAccessToken(token) {
  if (!token) return [];

  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    const roles = new Set([
      ...(payload.realm_access?.roles || []),
      ...(payload.resource_access?.['cathering-react']?.roles || []),
      ...(payload.resource_access?.['cathering-backend']?.roles || [])
    ]);

    if (roles.has('cathering_admin')) roles.add('admin');
    if (roles.has('cathering_estudiante')) roles.add('estudiante');
    if (roles.has('cathering_cafeteria')) roles.add('cafeteria');
    if (roles.has('cathering_personal_academico')) roles.add('personal_academico');

    return Array.from(roles);
  } catch {
    return [];
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <OidcProvider {...oidcConfig}>
      <Router> 
        <LocalAuthProvider>
          <CartProvider>
              <App />
          </CartProvider> 
        </LocalAuthProvider>
      </Router>
    </OidcProvider>
  </React.StrictMode>,
);
