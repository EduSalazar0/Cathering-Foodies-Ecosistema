
import React from 'react';

import { Navigate, Outlet, useLocation } from 'react-router-dom'; 
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = () => {

    const { isAuthenticated, loading } = useAuth(); 
    const location = useLocation();
    

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando sesión...</div>;
    }


    if (!isAuthenticated) {
        const returnTo = `${location.pathname}${location.search}`;
        sessionStorage.setItem('cathering_post_login_return_url', returnTo);
        return <Navigate to="/login" replace state={{ returnTo }} />;
    }



    return <Outlet />; 
};

export default ProtectedRoute;
