// order-service/src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 3003;

// DETECTOR DE MENTIRAS (Tráfico entrante en bruto)
app.use((req, res, next) => {
    console.log(`[ORDER-SERVICE ENTRADA] ${req.method} ${req.originalUrl}`);
    next();
});

app.use(cors());
app.use(express.json());

// 1. CONFIGURACIÓN DB
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './orders_database.sqlite',
    logging: false
});

// 2. IMPORTAR DEFINICIONES DE MODELOS
// (Asegúrate de que las rutas sean correctas según tu estructura de carpetas)
const OrderModelDef = require('./src/models/OrderModel');
const OrderItemModelDef = require('./src/models/OrderItemModel');
const WalletModelDef = require('./src/models/WalletModel');
const TransactionModelDef = require('./src/models/TransactionModel');

// 3. INICIALIZAR MODELOS
const Order = OrderModelDef(sequelize, DataTypes);
const OrderItem = OrderItemModelDef(sequelize, DataTypes);
const Wallet = WalletModelDef(sequelize, DataTypes);
const Transaction = TransactionModelDef(sequelize, DataTypes);

// 4. DEFINIR RELACIONES
// Ordenes e Items
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'OrderId' });
OrderItem.belongsTo(Order, { foreignKey: 'OrderId' });

// Billetera y Transacciones
Wallet.hasMany(Transaction, { as: 'transactions', foreignKey: 'walletId' });
Transaction.belongsTo(Wallet, { foreignKey: 'walletId' });

// 5. CONFIGURAR RUTAS
// Importamos los creadores de rutas
const createOrderRoutes = require('./src/routes/order.routes'); // Asegúrate que este archivo exista y exporte una función
const createWalletRoutes = require('./src/routes/wallet.routes');

// Inyectamos modelos necesarios a las rutas de Órdenes (Ahora Order necesita Wallet y Transaction para cobrar)
// NOTA: Pasamos Wallet a las rutas de Order para poder validar saldo en el OrderController
app.use('/api/orders', createOrderRoutes(Order, OrderItem, Wallet, Transaction)); 

// Inyectamos modelos a las rutas de Billetera
app.use('/api/wallet', createWalletRoutes(Wallet, Transaction));

// Atrapamoscas 404 (CRÍTICO)
app.use((req, res) => {
    console.error(`[ORDER-SERVICE 404] Ruta no encontrada: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Ruta no encontrada en Order Service', path: req.originalUrl });
});

// 6. INICIAR SERVIDOR
sequelize.sync({ force: false }).then(() => {
    console.log('Base de datos sincronizada (Orders + Wallets)');
    
    // Iniciar el servidor INDEPENDIENTEMENTE de KMS
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Order Service corriendo en 0.0.0.0:${PORT}`);
        
        // Pre-calentar KMS asíncronamente (NO bloqueante)
        const kmsService = require('./src/services/KmsService');
        kmsService.init().then(() => {
            console.log('[KMS] Servicio criptográfico pre-calentado correctamente.');
        }).catch(err => {
            console.warn('[KMS] ADVERTENCIA: No se pudo conectar a LocalStack KMS en el arranque. Se reintentará bajo demanda.', err.message);
        });
    });
}).catch(err => console.error("Error al iniciar DB:", err));