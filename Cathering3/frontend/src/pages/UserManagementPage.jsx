import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Input from '../components/common/Input'; 
import Button from '../components/common/Button'; 

const UserManagementPage = () => {
    const { isAuthenticated, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estado para el formulario de creación
    const [createForm, setCreateForm] = useState({ username: "", email: "", password: "" });
    const [userTypeToCreate, setUserTypeToCreate] = useState('ESTUDIANTE'); // 'ESTUDIANTE' o 'CAFETERIA'
    const [isCreating, setIsCreating] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/auth/users');
            setUsers(response.data);
        } catch (err) {
            const errorMsg = err.response?.data?.error || err.message;
            setError(errorMsg);
            if (err.response?.status === 401 || err.response?.status === 403) {
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers();
        }
    }, [isAuthenticated]);

    const handleCreateFormChange = (e) => {
        setCreateForm({ ...createForm, [e.target.name]: e.target.value });
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            if (userTypeToCreate === 'ESTUDIANTE') {
                await api.post('/auth/users/estudiante', createForm);
            } else if (userTypeToCreate === 'CAFETERIA') {
                await api.post('/auth/users/cafeteria', createForm);
            } else {
                await api.post('/auth/users/personal', createForm);
            }
            alert(`Usuario ${createForm.username} (${userTypeToCreate}) creado!`);
            setCreateForm({ username: "", email: "", password: "" });
            setIsCreating(false);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm(`¿Seguro que quieres eliminar al usuario ID ${userId}?`)) return;
        setError(null);
        try {
            await api.delete(`/auth/users/${userId}`);
            alert(`Usuario ID ${userId} eliminado.`);
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        }
    };

    if (loading) return <div className="loading">Cargando usuarios...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="user-management-container">
            <h1>Gestión de Usuarios (Admin)</h1>
            <p className="total-users">Usuarios en tu colegio: {users.length}</p>
            <Button onClick={() => setIsCreating(!isCreating)} className="btn-toggle-create">
                {isCreating ? 'Ocultar Formulario' : 'Crear Nuevo Usuario'}
            </Button>

            {isCreating && (
                <form className="create-form" onSubmit={handleCreateUser}>
                    <h3>Crear Usuario</h3>
                    <div style={{ marginBottom: '10px' }}>
                        <label>Tipo de Usuario: </label>
                        <select 
                            id="userType"
                            value={userTypeToCreate} 
                            onChange={(e) => setUserTypeToCreate(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                        >
                            <option value="ESTUDIANTE">Estudiante</option>
                            <option value="CAFETERIA">Cafetería</option>
                            <option value="PERSONAL_ACADEMICO">Personal Académico</option>
                        </select>
                    </div>
                    <Input type="text" name="username" placeholder="Username" value={createForm.username} onChange={handleCreateFormChange} required />
                    <Input type="email" name="email" placeholder="Email" value={createForm.email} onChange={handleCreateFormChange} required />
                    <Input type="password" name="password" placeholder="Password" value={createForm.password} onChange={handleCreateFormChange} required />
                    <Button type="submit">Crear</Button>
                </form>
            )}

            <table className="user-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user.id}>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <Button className="btn-delete" onClick={() => handleDeleteUser(user.id)}>
                                    Delete
                                </Button>
                                {/* (El botón de Edit se puede agregar después) */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserManagementPage;