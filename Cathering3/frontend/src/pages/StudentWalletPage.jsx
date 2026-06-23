import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const StudentWalletPage = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    // Estado para recarga
    const [amount, setAmount] = useState('');
    const [cardNumber, setCardNumber] = useState('');

    useEffect(() => {
        loadBalance();
    }, []);

    const loadBalance = async () => {
        try {
            // FORZANDO URL RELATIVA HACIA EL API GATEWAY PARA OBTENER SALDO
            console.log('[Frontend] Obteniendo saldo...');
            const response = await api.get('/wallet/balance');
            setBalance(Number(response.data.saldo) || 0);
        } catch (error) {
            console.error("Error cargando saldo:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecharge = async (e) => {
        e.preventDefault();
        if (!amount || amount <= 0) return alert("Ingresa un monto válido");
        try {
            console.log(`[Frontend] Enviando petición a API... POST /wallet/recharge, amount: ${amount}`);
            const response = await api.post('/wallet/recharge', { amount: parseFloat(amount) });
            if (response.data && response.data.nuevo_saldo !== undefined) {
                setBalance(parseFloat(response.data.nuevo_saldo));
            } else {
                loadBalance(); // Fallback si no viene el nuevo saldo
            }
            alert("¡Recarga exitosa!");
            setAmount('');
            setCardNumber('');
        } catch (error) {
            alert("Error en la recarga: " + (error.response?.data?.error || error.message));
        }
    };

    if (loading) return <div style={{ padding: 20 }}>Cargando billetera...</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h1>Mi Billetera Digital</h1>

            {/* Tarjeta de Saldo */}
            <div style={{
                background: 'linear-gradient(135deg, #1e88e5 0%, #1565c0 100%)',
                color: 'white',
                padding: '30px',
                borderRadius: '15px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                marginBottom: '30px'
            }}>
                <p style={{ margin: 0, opacity: 0.8 }}>Saldo Disponible</p>
                <h1 style={{ fontSize: '3rem', margin: '10px 0' }}>
                    ${balance.toFixed(2)}
                </h1>
                <p style={{ margin: 0, fontSize: '0.9em' }}>Estudiante: {user?.username}</p>
            </div>

            {/* Formulario de Recarga */}
            <div style={{ border: '1px solid #ddd', padding: '25px', borderRadius: '10px', background: '#fff' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Recargar Saldo</h3>
                <form onSubmit={handleRecharge}>
                    <Input
                        label="Monto a recargar ($)"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min="1"
                        required
                    />
                    <Input
                        label="Número de Tarjeta (Simulado)"
                        placeholder="**** **** **** ****"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        required
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Input label="MM/YY" placeholder="12/25" style={{ flex: 1 }} />
                        <Input label="CVV" placeholder="123" style={{ flex: 1 }} />
                    </div>

                    <Button type="submit" style={{ width: '100%', marginTop: '10px' }}>
                        Confirmar Recarga
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default StudentWalletPage;