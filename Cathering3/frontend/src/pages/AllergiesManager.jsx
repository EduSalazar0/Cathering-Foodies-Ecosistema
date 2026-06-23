import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const AllergiesManager = () => {
    const { userService } = useAuth();
    
    const [myAllergies, setMyAllergies] = useState([]); 
    const [allIngredients, setAllIngredients] = useState([]); 
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIngredientName, setSelectedIngredientName] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ingredientsData, allergiesData] = await Promise.all([
                userService.getAllIngredients(),
                userService.getMyAllergies()
            ]);
            setAllIngredients(Array.isArray(ingredientsData) ? ingredientsData : []);
            setMyAllergies(Array.isArray(allergiesData) ? allergiesData : []);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAllergy = async (e) => {
        e.preventDefault();
        if (!selectedIngredientName) return;
        if (myAllergies.includes(selectedIngredientName)) {
            alert("Ya tienes registrada esta alergia.");
            return;
        }
        const newAllergies = [...myAllergies, selectedIngredientName];
        try {
            await userService.updateMyAllergies(newAllergies);
            setMyAllergies(newAllergies);
            setIsModalOpen(false);
            setSelectedIngredientName("");
        } catch (error) {
            alert("Error al guardar");
        }
    };

    const handleRemoveAllergy = async (allergyName) => {
        if(!window.confirm(`¿Ya no eres alérgico a ${allergyName}?`)) return;
        const newAllergies = myAllergies.filter(name => name !== allergyName);
        try {
            await userService.updateMyAllergies(newAllergies);
            setMyAllergies(newAllergies);
        } catch (error) {
            alert("Error al eliminar alergia");
        }
    };

    

    if (loading) return <div style={{padding:'20px'}}>Cargando gestor de alergias...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Mis Alergias y Restricciones</h1>
                <Button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#d32f2f' }}>
                    + Agregar Alergia
                </Button>
            </div>

            <p style={{ color: '#666' }}>
                Gestiona aquí los ingredientes que no puedes consumir. El sistema bloqueará compras peligrosas.
            </p>

            {myAllergies.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f9f9f9', borderRadius: '8px' }}>
                    No tienes alergias registradas. ¡Qué suerte!
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px', marginTop: '20px' }}>
                    {myAllergies.map((allergyName, index) => (
                        <div key={index} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '15px', 
                            border: '1px solid #ffcdd2', 
                            background: '#ffebee', 
                            borderRadius: '8px',
                            color: '#b71c1c'
                        }}>
                            <span style={{ fontWeight: 'bold' }}>⚠️ {allergyName}</span>
                            <button 
                                onClick={() => handleRemoveAllergy(allergyName)}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1.2rem' }}
                                title="Eliminar alergia"
                            >
                                -
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
                        <h3>Registrar Nueva Alergia</h3>
                        <form onSubmit={handleAddAllergy}>
                            <label style={{ display: 'block', marginBottom: '10px' }}>Selecciona el ingrediente:</label>
                            
                            <select 
                                value={selectedIngredientName} 
                                onChange={(e) => setSelectedIngredientName(e.target.value)}
                                style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc' }}
                                required
                            >
                                <option value="">-- Buscar ingrediente --</option>
                                {allIngredients.map((ing, idx) => (
                                    <option key={idx} value={ing.nombre || ing.name}>
                                        {ing.nombre || ing.name}
                                    </option>
                                ))}
                            </select>

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <Button type="button" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: '#999' }}>
                                    Cancelar
                                </Button>
                                <Button type="submit" style={{ backgroundColor: '#d32f2f' }}>
                                    Guardar Alergia
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AllergiesManager;