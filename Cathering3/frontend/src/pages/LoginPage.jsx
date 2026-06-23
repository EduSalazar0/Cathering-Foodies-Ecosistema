import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirigir automáticamente si lo deseamos, o simplemente mostrar el botón
    if (!isAuthenticated) {
      login();
    }
  }, [isAuthenticated, login]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Acceso a la Plataforma</h1>
      <p>Redirigiendo al servidor de autenticación seguro...</p>
      <button onClick={() => login()} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Ir a Iniciar Sesión (Keycloak)
      </button>
    </div>
  );
};

export default LoginPage;