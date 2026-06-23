const { Router } = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const isColegioAdmin = require('../middlewares/isColegioAdmin');
const validateColegio = require('../middlewares/validateColegio');

const ColegioController = require('../controllers/ColegioController');

module.exports = (ColegioModel) => {
    const router = Router();

    const controller = new ColegioController(ColegioModel);

    // Middleware global para estas rutas
    router.use(AuthMiddleware);
    router.use(isColegioAdmin);

    // Rutas usando la instancia 'controller'
    router.get('/me', controller.getDetails.bind(controller));

    router.put(
        '/me', 
        validateColegio, 
        controller.updateDetails.bind(controller)
    );

    return router;
};