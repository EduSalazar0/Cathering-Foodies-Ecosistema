// services/auth-service/src/routes/auth.routes.js
const { Router } = require('express');

// Middlewares
const { authMiddleware, handleAuthError } = require('../middlewares/AuthMiddleware');

// Controladores
const UserController = require('../controllers/UserController');

// Dependencias
const SQLiteUserRepository = require('../repositories/SQLiteUserRepository'); 
const UpdateUser = require('../use-cases/UpdateUser'); 

module.exports = (UserModel, ColegioModel, sequelize, TransactionModel) => {
    const router = Router();

    // 1. Iniciar Dependencias
    const userRepository = new SQLiteUserRepository(UserModel, ColegioModel, sequelize);
    
    // 2. Casos de Uso
    const updateUserUseCase = new UpdateUser(userRepository); 

    // 3. Controladores
    const userController = new UserController(userRepository, updateUserUseCase, TransactionModel);

    // --- APLICAR CAPTURA DE ERRORES GLOBAL PARA JWT ---
    router.use(handleAuthError);

    // --- RUTAS PROTEGIDAS (Requieren Token de Keycloak) ---
    
    // Gestión General (Admin)
    router.get('/users', authMiddleware, userController.listUsers.bind(userController));
    
    // Gestión del Colegio
    router.get('/colegio', authMiddleware, userController.getColegio.bind(userController));
    router.put('/colegio', authMiddleware, userController.updateColegio.bind(userController));
    
    // Creación de Roles (Idealmente solo el Admin debería hacer esto)
    router.post('/users/cafeteria', authMiddleware, (req, res) => userController.createUserByAdmin(req, res, 'cafeteria'));
    router.post('/users/estudiante', authMiddleware, (req, res) => userController.createUserByAdmin(req, res, 'estudiante'));
    router.post('/users/personal', authMiddleware, (req, res) => userController.createUserByAdmin(req, res, 'personal_academico'));

    // Actualizar y Eliminar Usuarios
    router.put('/users/:id', authMiddleware, userController.update.bind(userController));
    router.delete('/users/:id', authMiddleware, userController.delete.bind(userController));

    // --- RUTAS DE UTILIDAD (PERFIL, ALERGIAS, BILLETERA) ---
    router.get('/me', authMiddleware, userController.getProfile.bind(userController));
    router.get('/allergies', authMiddleware, userController.getMyAllergies.bind(userController));
    router.post('/allergies', authMiddleware, userController.updateMyAllergies.bind(userController));
    
    // --- BILLETERA ---
    router.get('/balance', authMiddleware, userController.getBalance.bind(userController));
    router.post('/balance/recharge', authMiddleware, userController.rechargeBalance.bind(userController));

    return router;
};