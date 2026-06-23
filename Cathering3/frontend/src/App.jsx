import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserManagementPage from './pages/UserManagementPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ColegioProfilePage from './pages/ColegioProfilePage';
import CafeteriaDashboard from './pages/CafeteriaDashboard';
import StudentMenuPage from './pages/StudentMenuPage'; 
import AllergiesManager from './pages/AllergiesManager'; 
import CafeteriaOrdersPage from './pages/CafeteriaOrdersPage';
import StudentWalletPage from './pages/StudentWalletPage';
import CartPage from './pages/CartPage';

const Navigation = () => {
    const { isAuthenticated, logout, user } = useAuth(); 

    return (
        <nav>
            <Link to="/">App Cathering</Link>
            
            {!isAuthenticated ? (
                <>
                    <Link to="/login">Iniciar Sesión</Link>
                    <Link to="/register">Registrar Colegio</Link>
                </>
            ) : (
                <>
                    
                    {user?.role === 'admin' && (
                        <>
                            <Link to="/manage-users">Usuarios</Link>
                            <Link to="/manage-colegio">Mi Colegio</Link>
                        </>
                    )}
                    
                    
                    {user?.role === 'cafeteria' && (
                        <>
                            <Link to="/manage-menu">Gestionar Menú</Link>
                            <Link to="/kitchen">Cocina</Link> 
                        </>
                    )}

                    
                    {(user?.role === 'estudiante' || user?.role === 'personal_academico') && (
                        <>
                            <Link to="/menu">Ver Menú</Link>
                            <Link to="/allergies" style={{ color: '#ffeb3b' }}>Mis Alergias</Link>
                            <Link to="/cart">Carrito</Link>
                            <Link to="/wallet">Mi Billetera</Link>
                        </>
                    )}
                    
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8em' }}>Hola, {user?.username} ({user?.role})</span>
                        <button onClick={logout} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.2)' }}>
                            Salir
                        </button>
                    </div>
                </>
            )}
        </nav>
    );
};

const App = () => {
    const { loading } = useAuth();

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando...</div>;
    }

    return (
        <>
            <Navigation />
            <div className="container">
                <Routes>
                    <Route path="/" element={
                        <div style={{textAlign: 'center', marginTop: '50px'}}>
                            <h1>Bienvenido a App Cathering</h1>
                            <p>Gestión inteligente de cafeterías escolares.</p>
                        </div>
                    } />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    <Route element={<ProtectedRoute allowedRoles={['admin', 'cafeteria', 'estudiante', 'personal_academico']} />}>

                        <Route path="/manage-users" element={<UserManagementPage />} />
                        <Route path="/manage-colegio" element={<ColegioProfilePage />} />

                        <Route path="/manage-menu" element={<CafeteriaDashboard />} />
                        <Route path="/kitchen" element={<CafeteriaOrdersPage />} />

                        <Route path="/menu" element={<StudentMenuPage />} />
                        <Route path="/allergies" element={<AllergiesManager />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/wallet" element={<StudentWalletPage />} />

                        <Route path="/dashboard" element={<div style={{padding: 20}}>Selecciona una opción del menú.</div>} />
                    </Route>
                </Routes>
            </div>
        </>
    );
};

export default App;