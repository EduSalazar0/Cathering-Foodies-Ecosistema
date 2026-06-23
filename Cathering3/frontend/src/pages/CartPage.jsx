import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth'; 
import Button from '../components/common/Button';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
    const { cart, removeFromCart, total, clearCart } = useCart();
    const { orderService, walletService } = useAuth(); 
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(false);
    const [balance, setBalance] = useState(0);

    // Cargar saldo al entrar al carrito desde el walletService
    useEffect(() => {
        const fetchBalance = async () => {
            try {
                if (walletService) {
                    const data = await walletService.getBalance();
                    // Usamos 'saldo' que es como viene de tu base de datos
                    setBalance(parseFloat(data.saldo) || 0);
                }
            } catch (error) {
                console.error("Error cargando saldo", error);
            }
        };
        fetchBalance();
    }, [walletService]);

    const handlePayment = async () => {
        if (cart.length === 0) return;

        // VALIDACIÓN DE SALDO: Si el total es mayor al balance, bloqueamos la ejecución
        if (balance < total) {
            alert(`Saldo insuficiente. Tu saldo es $${balance.toFixed(2)} y el total es $${total.toFixed(2)}`);
            return;
        }

        if (!window.confirm(`¿Confirmar pago de $${total.toFixed(2)} con tu saldo disponible?`)) return;

        setLoading(true);
        try {
            // Enviamos el carrito con los ingredientes quitados al servicio de órdenes
            await orderService.createOrder(cart);

            alert("¡Pedido Confirmado! La cocina ha recibido tu orden.");
            clearCart(); 
            navigate('/menu'); 

        } catch (error) {
            alert(`Error al procesar el pedido: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div style={{ padding: '100px 20px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '3rem', margin: 0 }}>🛒</h2>
                <h3>Tu carrito está vacío</h3>
                <p style={{ color: '#666' }}>Parece que aún no has añadido nada al menú.</p>
                <Button onClick={() => navigate('/menu')}>Volver al Menú</Button>
            </div>
        );
    }

    // Variable de control para el diseño
    const canPay = balance >= total;

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            
            {/* COLUMNA 1: RESUMEN DEL PEDIDO */}
            <div style={{ flex: 2, minWidth: '350px' }}>
                <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>Resumen del Pedido</h2>
                {cart.map((item) => (
                    <div key={item.cartId} style={{ borderBottom: '1px solid #eee', padding: '15px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                                {item.name} <span style={{ color: '#666', fontWeight: 'normal' }}>x{item.quantity}</span>
                            </div>
                            
                            {/* Visualización de ingredientes quitados por alergia */}
                            {item.removedIngredients && item.removedIngredients.length > 0 && (
                                <div style={{ 
                                    color: '#d32f2f', 
                                    fontSize: '0.85em', 
                                    backgroundColor: '#ffebee', 
                                    padding: '2px 8px', 
                                    borderRadius: '4px',
                                    marginTop: '5px',
                                    display: 'inline-block'
                                }}>
                                    Sin: {item.removedIngredients.join(', ')}
                                </div>
                            )}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span style={{ fontWeight: '500' }}>${(item.price * item.quantity).toFixed(2)}</span>
                            <button 
                                onClick={() => removeFromCart(item.cartId)} 
                                style={{ color: '#d32f2f', border: 'none', backgroundColor: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                title="Eliminar del carrito"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
                
                <div style={{ textAlign: 'right', marginTop: '20px' }}>
                    <p style={{ color: '#666', margin: 0 }}>Subtotal estimado</p>
                    <h3 style={{ fontSize: '2.2rem', margin: '5px 0', color: '#2c3e50' }}>Total: ${total.toFixed(2)}</h3>
                </div>
            </div>

            {/* COLUMNA 2: SECCIÓN DE PAGO (BILLETERA) */}
            <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '25px', 
                    borderRadius: '15px', 
                    border: '1px solid #e9ecef', 
                    position: 'sticky', 
                    top: '20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Método de Pago</h3>
                    
                    <div style={{ 
                        marginBottom: '20px', 
                        padding: '15px', 
                        backgroundColor: 'white', 
                        borderRadius: '10px', 
                        border: '1px solid #dee2e6',
                        textAlign: 'center'
                    }}>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#6b7280' }}>Tu Saldo Disponible:</p>
                        <div style={{ 
                            fontSize: '2.4rem', 
                            fontWeight: 'bold', 
                            color: canPay ? '#2e7d32' : '#d32f2f' 
                        }}>
                            ${balance.toFixed(2)}
                        </div>
                    </div>

                    {/* Alerta de saldo insuficiente */}
                    {!canPay && (
                        <div style={{ 
                            color: '#c0392b', 
                            marginBottom: '15px', 
                            fontSize: '0.9em', 
                            backgroundColor: '#fadbd8', 
                            padding: '12px', 
                            borderRadius: '8px',
                            border: '1px solid #ebccd1'
                        }}>
                            <strong>⚠️ Saldo insuficiente</strong><br />
                            Te faltan ${(total - balance).toFixed(2)} para completar este pedido.
                        </div>
                    )}

                    <Button 
                        onClick={handlePayment} 
                        disabled={!canPay || loading} 
                        style={{ 
                            width: '100%', 
                            backgroundColor: canPay ? '#2e7d32' : '#9e9e9e',
                            padding: '18px',
                            fontSize: '1.1em',
                            fontWeight: 'bold',
                            boxShadow: canPay ? '0 4px 10px rgba(46,125,50,0.3)' : 'none'
                        }}
                    >
                        {loading ? 'Procesando...' : 'Confirmar y Pagar'}
                    </Button>

                    {!canPay && (
                        <button 
                            onClick={() => navigate('/wallet')}
                            style={{ 
                                width: '100%', 
                                marginTop: '15px', 
                                padding: '12px', 
                                backgroundColor: 'none', 
                                border: '2px solid #1976d2', 
                                color: '#1976d2', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontWeight: 'bold',
                                transition: '0.3s'
                            }}
                        >
                            Ir a Recargar Saldo
                        </button>
                    )}
                    
                    <p style={{ fontSize: '0.75em', color: '#9e9e9e', marginTop: '20px', textAlign: 'center', lineHeight: '1.4' }}>
                        🔒 El monto se descontará automáticamente de tu billetera escolar al confirmar.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CartPage;