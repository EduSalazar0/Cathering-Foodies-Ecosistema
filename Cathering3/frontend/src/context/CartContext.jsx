import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth'; // Importamos Auth para saber quién es el usuario

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth(); // Obtenemos el usuario actual
    const [cart, setCart] = useState([]);

    // 1. CARGAR CARRITO: Cada vez que cambia el usuario, cargamos SU carrito
    useEffect(() => {
        if (user && user.id) {
            try {
                // Usamos una clave única: 'cart_1', 'cart_2', etc.
                const saved = localStorage.getItem(`cart_${user.id}`);
                setCart(saved ? JSON.parse(saved) : []);
            } catch (e) {
                setCart([]);
            }
        } else {
            // Si no hay usuario (logout), limpiamos el estado del carrito en memoria
            setCart([]);
        }
    }, [user]); // Se ejecuta cuando el usuario cambia (login/logout)

    // 2. GUARDAR CARRITO: Cada vez que el carrito cambia, guardamos con la clave del usuario
    useEffect(() => {
        if (user && user.id) {
            localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
        }
    }, [cart, user]);

    const addToCart = (product, removedIngredients = []) => {
        if (!user) return alert("Inicia sesión para agregar productos");

        setCart(currentCart => {
            const cartId = removedIngredients.length > 0 
                ? `${product.id}-${removedIngredients.join('-')}` 
                : product.id.toString(); // Aseguramos que sea string
            
            const existing = currentCart.find(item => item.cartId === cartId);
            
            if (existing) {
                return currentCart.map(item => 
                    item.cartId === cartId 
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...currentCart, { 
                cartId: cartId,
                id: product.id,
                name: product.name || product.nombre,
                price: parseFloat(product.price || product.precio),
                quantity: 1,
                image: product.imageUrl || product.imagen_url,
                removedIngredients: removedIngredients
            }];
        });
    };

    const removeFromCart = (cartId) => {
        setCart(current => current.filter(item => item.cartId !== cartId));
    };

    const clearCart = () => {
        setCart([]);
        // También limpiamos el localStorage específico
        if (user && user.id) {
            localStorage.removeItem(`cart_${user.id}`);
        }
    };

    const total = cart.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        return sum + (price * item.quantity);
    }, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);