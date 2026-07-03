import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const { login, isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const returnTo = normalizeLocalReturnUrl(location.state?.returnTo)
      || normalizeLocalReturnUrl(sessionStorage.getItem('cathering_post_login_return_url'));

    if (isAuthenticated) {
      sessionStorage.removeItem('cathering_post_login_return_url');
      navigate(returnTo || defaultRouteForUser(user), { replace: true });
      return;
    }

    login(returnTo || undefined);
  }, [isAuthenticated, login, location.state, navigate, user]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Acceso a la Plataforma</h1>
      <p>Redirigiendo al servidor de autenticacion seguro...</p>
      <button onClick={() => login(location.state?.returnTo)} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Ir a Iniciar Sesion (Keycloak)
      </button>
    </div>
  );
};

function defaultRouteForUser(user) {
  if (user?.role === 'admin') return '/manage-users';
  if (user?.role === 'cafeteria') return '/manage-menu';
  if (user?.role === 'estudiante' || user?.role === 'personal_academico') return '/menu';
  return '/';
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

export default LoginPage;
