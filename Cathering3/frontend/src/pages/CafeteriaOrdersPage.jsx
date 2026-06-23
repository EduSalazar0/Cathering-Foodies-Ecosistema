import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const CafeteriaOrdersPage = () => {
    const { orderService } = useAuth();
    const [orders, setOrders] = useState([]);
    const [errorMsg, setErrorMsg] = useState(null);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getIncomingOrders();
            if (Array.isArray(data)) {
                setOrders(data);
                setErrorMsg(null);
            } else {
                setOrders([]); // Evita errores si no hay datos
            }
        } catch (error) {
            console.error("Error cargando pedidos:", error);
            setErrorMsg("No se pudo conectar con el servidor de cocina.");
        }
    };

    // Auto-actualización cada 5 segundos
    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [orderService]);

    const changeStatus = async (orderId, newStatus) => {
        // Optimistic UI: Actualizamos visualmente antes de confirmar
        const previousOrders = [...orders];
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

        try {
            await orderService.updateStatus(orderId, newStatus);
            // Si funciona, recargamos la lista real
            fetchOrders(); 
        } catch (error) {
            alert("Error al cambiar estado: " + error.message);
            setOrders(previousOrders); // Revertimos si falla
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>👨‍🍳 Pedidos en Cocina</h1>
            
            {errorMsg && <div style={{color: 'red', padding: '10px'}}>{errorMsg}</div>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                
                {orders.length === 0 && !errorMsg && (
                    <p style={{ gridColumn: '1/-1', textAlign: 'center', fontSize: '1.2em', color: '#666' }}>
                        No hay pedidos pendientes. ¡Todo limpio! ✨
                    </p>
                )}

                {orders.map(order => (
                    <div key={order.id} style={{ 
                        border: '1px solid #ccc', 
                        borderRadius: '8px', 
                        overflow: 'hidden',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                        backgroundColor: '#fff'
                    }}>
                        {/* Cabecera de la Tarjeta */}
                        <div style={{ 
                            background: order.status === 'PAID' ? '#ffeb3b' : (order.status === 'EN_PREPARACION' ? '#ff9800' : '#4caf50'),
                            padding: '10px',
                            fontWeight: 'bold',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span>Orden #{order.id}</span>
                            <span style={{ fontSize: '0.8em', background: 'rgba(255,255,255,0.5)', padding: '2px 6px', borderRadius: '4px' }}>
                                {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>

                        {/* Cuerpo de la Tarjeta */}
                        <div style={{ padding: '15px' }}>
                            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '0.9em' }}>
                                Cliente ID: {order.userId}
                            </p>
                            
                            <ul style={{ paddingLeft: '20px', margin: '0' }}>
                                {order.items && order.items.map((item, idx) => {
                                    // Parsear ingredientes removidos si existen
                                    let removed = [];
                                    try {
                                        if (item.removedIngredients) removed = JSON.parse(item.removedIngredients);
                                    } catch (e) {}

                                    return (
                                        <li key={idx} style={{ marginBottom: '5px' }}>
                                            <strong>{item.quantity}x</strong> {item.productName}
                                            {removed.length > 0 && (
                                                <div style={{ color: '#d32f2f', fontSize: '0.85em', fontWeight: 'bold' }}>
                                                    🚫 Sin: {removed.join(', ')}
                                                </div>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Botones de Acción */}
                        <div style={{ padding: '10px', borderTop: '1px solid #eee', background: '#f9f9f9', display: 'flex', gap: '5px' }}>
                            {order.status === 'PAID' && (
                                <button 
                                    onClick={() => changeStatus(order.id, 'EN_PREPARACION')}
                                    style={{ flex: 1, padding: '8px', background: '#ff9800', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    🔥 Cocinar
                                </button>
                            )}
                            
                            {order.status === 'EN_PREPARACION' && (
                                <button 
                                    onClick={() => changeStatus(order.id, 'LISTO')}
                                    style={{ flex: 1, padding: '8px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    ✅ Listo
                                </button>
                            )}

                            {order.status === 'LISTO' && (
                                <button 
                                    onClick={() => changeStatus(order.id, 'COMPLETED')}
                                    style={{ flex: 1, padding: '8px', background: '#2196f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    📦 Entregado
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CafeteriaOrdersPage;