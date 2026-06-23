import api from './api';

const WalletService = {
    getBalance: async () => {
        const response = await api.get('/wallet/balance');
        return response.data;
    },

    recharge: async (amount) => {
        const response = await api.post('/wallet/recharge', { amount });
        return response.data;
    }
};

export default WalletService;