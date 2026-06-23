import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext'; 
import Button from '../components/common/Button';
import { Link } from 'react-router-dom';

const StudentMenuPage = () => {
    const { productService, userService } = useAuth();
    const { addToCart, cart } = useCart();
    
    const [menu, setMenu] = useState([]);
    const [myAllergies, setMyAllergies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Estados para el Modal de Personalización
    const [conflictProduct, setConflictProduct] = useState(null);
    const [conflictIngredients, setConflictIngredients] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [menuData, allergiesData] = await Promise.all([
                    productService.getMenu(),
                    userService.getMyAllergies()
                ]);
                setMenu(Array.isArray(menuData) ? menuData : []);
                setMyAllergies(Array.isArray(allergiesData) ? allergiesData : []);
            } catch (error) {
                console.error("Error cargando datos:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [productService, userService]);

    // Detecta qué ingredientes del producto están en tu lista de alergias
    const checkAllergyRisk = (productIngredients) => {
        if (!productIngredients || !myAllergies.length) return [];
        
        // Convertimos el string "Pan, Mani" en un array
        const ingredientsArray = productIngredients.split(',').map(i => i.trim().toLowerCase());
        
        // Retornamos los nombres de los ingredientes que coinciden con las alergias
        return ingredientsArray.filter(ing => 
            myAllergies.some(allergy => allergy.toLowerCase() === ing)
        );
    };

    const handleAddToCart = (product) => {
        const risks = checkAllergyRisk(product.ingredients);

        if (risks.length > 0) {
            // Si hay riesgo, abrimos el modal con la lista de ingredientes malos
            setConflictIngredients(risks);
            setConflictProduct(product);
        } else {
            // Si no hay riesgo, agregamos directo (sin ingredientes a quitar)
            addToCart(product, []);
            alert(`${product.name} agregado al carrito.`);
        }
    };

    const handleCustomizeAdd = () => {
        // El usuario decidió quitar los ingredientes conflictivos
        addToCart(conflictProduct, conflictIngredients);

        setConflictProduct(null);
        setConflictIngredients([]);
        alert("Producto agregado SIN los ingredientes alérgicos.");
    };

    const filteredMenu = menu.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{padding: '20px'}}>Cargando menú...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>Menú del Día</h1>
                <Link to="/cart" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ 
                        background: '#ff9800', color: 'white', padding: '10px 20px', 
                        borderRadius: '20px', fontWeight: 'bold', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                        🛒 Carrito: <strong>{cart.length}</strong> ítems
                    </div>
                </Link>
            </header>

            <div style={{ marginBottom: '20px' }}>
                <input 
                    type="text" placeholder="Buscar comida..." value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px', width: '100%', maxWidth: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {filteredMenu.map(product => {
                    const risks = checkAllergyRisk(product.ingredients);
                    const hasRisk = risks.length > 0;

                    return (
                        <div key={product.id} style={{ 
                            border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', 
                            position: 'relative', boxShadow: '0 2px 5px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' 
                        }}>
                            {hasRisk && (
                                <div style={{ background: '#ffeb3b', padding: '5px', fontSize: '0.8em', textAlign: 'center', fontWeight: 'bold' }}>
                                    ⚠️ Contiene alérgenos
                                </div>
                            )}

                            <div style={{ height: '150px', overflow: 'hidden', background: '#f9f9f9' }}>
                                <img 
                                    src={product.imageUrl || `http://localhost:3000${product.imagen_url}`} 
                                    alt={product.name} 
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    onError={(e) => {
                                        e.target.onerror = null; 
                                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200' viewBox='0 0 300 200'%3E%3Crect fill='%23cccccc' width='300' height='200'/%3E%3Ctext fill='%23969696' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ESin Imagen%3C/text%3E%3C/svg%3E";
                                    }}
                                />
                            </div>

                            <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ margin: '0 0 5px 0' }}>{product.name}</h3>
                                <p style={{ color: '#666', fontSize: '0.9em', margin: '0 0 10px 0', flex: 1 }}>{product.description}</p>
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '15px' }}>
                                    {product.ingredients?.split(',').map((ing, idx) => (
                                        <span key={idx} style={{ 
                                            background: risks.includes(ing.trim().toLowerCase()) ? '#ffebee' : '#eee', 
                                            color: risks.includes(ing.trim().toLowerCase()) ? '#d32f2f' : '#333',
                                            fontSize: '0.7em', padding: '2px 6px', borderRadius: '4px' 
                                        }}>
                                            {ing.trim()}
                                        </span>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 'bold', color: '#2e7d32' }}>${product.price}</span>
                                    <Button onClick={() => handleAddToCart(product)} style={{ background: '#d32f2f' }}>
                                        {hasRisk ? 'Ver Opciones' : 'Agregar'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* MODAL DE PERSONALIZACIÓN */}
            {conflictProduct && (
                <div style={{ position: 'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex: 1000 }}>
                    <div style={{ background:'white', padding:'30px', borderRadius:'10px', maxWidth:'400px', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
                        <h2 style={{ color: '#d32f2f', marginTop: 0 }}>⚠️ ¡Alerta de Alergia!</h2>
                        <p>El plato <strong>{conflictProduct.name}</strong> contiene:</p>
                        <ul style={{ color: '#d32f2f' }}>
                            {conflictIngredients.map((name, idx) => <li key={idx}><strong>{name.toUpperCase()}</strong></li>)}
                        </ul>
                        <p>¿Deseas pedirlo <strong>SIN</strong> estos ingredientes?</p>

                        <div style={{ display:'flex', gap:'10px', marginTop:'20px', justifyContent: 'flex-end' }}>
                            <Button onClick={() => setConflictProduct(null)} style={{ background:'#999' }}>Cancelar</Button>
                            <Button onClick={handleCustomizeAdd}>Sí, quitar ingredientes</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentMenuPage;