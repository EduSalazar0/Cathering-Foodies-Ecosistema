const { Router } = require('express');
const upload = require('../middlewares/uploadMiddleware');
const isCafeteria = require('../middlewares/isCafeteria');
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const ProductController = require('../controllers/ProductController');

module.exports = (ProductModel, ColegioModel, IngredientModel) => {
    const router = Router();
    
    // Pasamos los 3 modelos al constructor
    const controller = new ProductController(ProductModel, ColegioModel, IngredientModel);

    router.get('/', AuthMiddleware, controller.getAll.bind(controller));
    
    // Endpoint para lista de ingredientes (Alergias)
    router.get('/ingredients', controller.getIngredients.bind(controller));

    router.post('/safe-menu', AuthMiddleware, controller.getSafeMenu.bind(controller));

    router.post(
        '/', 
        AuthMiddleware, 
        isCafeteria, 
        upload.single('image'), 
        controller.create.bind(controller)
    );
    
    router.delete(
        '/:id', 
        AuthMiddleware, 
        isCafeteria, 
        controller.delete.bind(controller)
    );
    
    return router;
};