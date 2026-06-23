import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const StudentAllergiesPage = () => {
    const { userService } = useAuth();
    const [allIngredients, setAllIngredients] = useState([]);
    const [selectedAllergies, setSelectedAllergies] = useState([]); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {               
                const ingredients = await userService.getAllIngredients();
                console.log("DATOS CRUDOS REACT:", ingredients); // Mira la consola (F12)
                setAllIngredients(ingredients);

                const myAllergies = await userService.getMyAllergies();
                setSelectedAllergies(Array.isArray(myAllergies) ? myAllergies : []);
            } catch (error) {
                console.error("Error cargando alergias:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [userService]);

    const toggleAllergy = (name) => {
        if (!name) return; // Protección
        if (selectedAllergies.includes(name)) {
            setSelectedAllergies(selectedAllergies.filter(item => item !== name));
        } else {
            setSelectedAllergies([...selectedAllergies, name]);
        }
    };

    const handleSave = async () => {
        try {
            const payload = { allergies: selectedAllergies };
            await userService.updateMyAllergies(payload);
            alert("¡Alergias actualizadas correctamente!");
        } catch (error) {
            const errorMsg = error.response?.data?.error || error.message;
            alert("Error al guardar: " + errorMsg);
        }
    };

    if (loading) return <div style={{padding:'20px'}}>Cargando...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Mis Alergias (Modo Debug)</h1>
            
            {/* --- CAJA DE DIAGNÓSTICO --- */}
            <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px', borderRadius: '5px', fontSize: '12px', fontFamily: 'monospace' }}>
                <strong>Lo que React está viendo:</strong>
                <pre>{JSON.stringify(allIngredients, null, 2)}</pre>
            </div>
            {/* --------------------------- */}

            <p>Selecciona tus alergias:</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                {/* Protección: Si allIngredients no es array, no intenta mapear */}
                {Array.isArray(allIngredients) && allIngredients.map((ing, index) => {
                    // Intento de obtener el nombre de varias formas por si acaso
                    const displayName = ing.name || ing.nombre || "SIN NOMBRE";
                    const isSelected = selectedAllergies.includes(displayName);
                    
                    return (
                        <button
                            key={ing.id || index} 
                            onClick={() => toggleAllergy(displayName)}
                            style={{
                                padding: '10px 20px',
                                borderRadius: '20px',
                                border: isSelected ? '2px solid #d32f2f' : '1px solid #ccc',
                                backgroundColor: isSelected ? '#ffebee' : 'white',
                                color: isSelected ? '#d32f2f' : '#333',
                                cursor: 'pointer',
                                fontWeight: isSelected ? 'bold' : 'normal'
                            }}
                        >
                            {displayName} {isSelected && '⚠️'}
                        </button>
                    );
                })}
            </div>

            <Button onClick={handleSave} style={{ width: '100%', backgroundColor: '#d32f2f' }}>
                Guardar
            </Button>
        </div>
    );
};

export default StudentAllergiesPage;