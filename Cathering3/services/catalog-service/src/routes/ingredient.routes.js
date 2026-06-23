const { Router } = require('express');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const isCafeteria = require('../middlewares/isCafeteria');

module.exports = (IngredientModel) => {
    const router = Router();
    
    // Instanciamos el controlador
    const IngredientController = require('../controllers/IngredientController');
    const controller = new IngredientController(IngredientModel);

    // RUTAS PÚBLICAS O SOLO AUTENTICADAS (Ver lista)
    router.get('/', controller.getAll.bind(controller));

    // RUTAS PROTEGIDAS (Solo Cafetería puede crear/borrar)
    router.post('/', AuthMiddleware, isCafeteria, controller.create.bind(controller));
    router.delete('/:id', AuthMiddleware, isCafeteria, controller.delete.bind(controller));

    return router;
};