// frontend/src/pages/ColegioProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const ColegioProfilePage = () => {
    const { logout, user } = useAuth();
    const [formData, setFormData] = useState({
        nombre: "",
        direccion: "",
        telefono: "",
        ciudad: "",
        provincia: "",
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        const fetchColegioData = async () => {
            try {
                const response = await api.get('/auth/colegio');
                const data = response.data;
                setFormData({
                    nombre: data.nombre || "",
                    direccion: data.direccion || "",
                    telefono: data.telefono || "",
                    ciudad: data.ciudad || "",
                    provincia: data.provincia || "",
                });
                setIsCreating(false);
            } catch (err) {
                // Si el backend retorna 404, habilitamos el formulario vacío limpiamente
                if (err.response && err.response.status === 404) {
                    setIsCreating(true);
                    setError(null);
                } else {
                    const errorMsg = err.response?.data?.error || err.message;
                    setError(errorMsg);
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        logout();
                    }
                }
            } finally {
                setLoading(false);
            }
        };
        fetchColegioData();
    }, [logout]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null);
        setSuccess(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            // El backend solo soporta PUT para actualizar/crear el colegio asignado al ID (fallback implementado en el backend)
            await api.put('/auth/colegio', formData);
            setSuccess('¡Perfil del colegio guardado con éxito!');
            setIsCreating(false);
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formData.nombre && !isCreating) {
        return <div className="loading">Cargando perfil del colegio...</div>;
    }

    return (
        <div className="colegio-profile-container">
            <h1>{isCreating ? 'Registrar Institución' : 'Perfil de mi Institución'}</h1>
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}
            
            <form onSubmit={handleSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
                <Input label="Nombre del Colegio" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required />
                <Input label="Dirección" id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} />
                <Input label="Teléfono (10 dígitos)" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} required />
                <Input label="Ciudad" id="ciudad" name="ciudad" value={formData.ciudad} onChange={handleChange} />
                <Input label="Provincia" id="provincia" name="provincia" value={formData.provincia} onChange={handleChange} />
                
                <Button type="submit" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
                    {loading ? 'Procesando...' : 'Guardar Cambios'}
                </Button>
            </form>
        </div>
    );
};

export default ColegioProfilePage;