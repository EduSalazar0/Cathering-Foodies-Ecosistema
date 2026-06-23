
import React from 'react';

import { Navigate, Outlet } from 'react-router-dom'; 
import { useAuth } from '../../hooks/useAuth';

const ProtectedRoute = () => {

    const { isAuthenticated, loading } = useAuth(); 
    

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando sesión...</div>;
    }


    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }



    return <Outlet />; 
};

export default ProtectedRoute;