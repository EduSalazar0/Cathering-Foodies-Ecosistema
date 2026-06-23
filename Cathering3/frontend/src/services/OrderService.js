import api from './api';

const OrderService = {
    createOrder: async (cartData) => {
        // En vez de apuntar a localhost:3003, usamos el endpoint relativo
        const response = await api.post('/orders', cartData);
        return response.data;
    },

    getOrders: async () => {
        const response = await api.get('/orders');
        return response.data;
    }
};

export default OrderService;