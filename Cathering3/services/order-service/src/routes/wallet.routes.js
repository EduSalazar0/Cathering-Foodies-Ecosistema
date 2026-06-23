// order-service/src/routes/wallet.routes.js
const { Router } = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const WalletController = require('../controllers/WalletController');

module.exports = (WalletModel, TransactionModel) => {
    const router = Router();
    
    // Instanciamos el controlador inyectando los modelos
    const controller = new WalletController(WalletModel, TransactionModel);

    router.use(AuthMiddleware);

    // GET /api/wallet/balance -> Obtener saldo
    router.get('/balance', controller.getBalance.bind(controller));

    // POST /wallet/recharge -> Recargar saldo
    router.post('/recharge', controller.recharge.bind(controller));
    

    return router;
};