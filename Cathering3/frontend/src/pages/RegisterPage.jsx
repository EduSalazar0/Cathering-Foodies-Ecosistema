import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const { register } = useAuth();

  useEffect(() => {
    register();
  }, [register]);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Crear Cuenta</h1>
      <p>Redirigiendo al servidor de autenticación para el registro...</p>
      <button onClick={() => register()} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Ir a Registro (Keycloak)
      </button>
    </div>
  );
};

export default RegisterPage;