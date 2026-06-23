// services/auth-service/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

// Importar definiciones de modelos
const UserModelDef = require('./src/models/UserModel');
const ColegioModelDef = require('./src/models/ColegioModel');
const TransactionModelDef = require('./src/models/TransactionModel');


// Importar rutas
const authRoutes = require('./src/routes/auth.routes');

const app = express();

app.use(cors());
app.use(express.json());

// 1. Configurar Base de Datos
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

// 2. Inicializar Modelos
const UserModel = UserModelDef(sequelize, DataTypes);
const ColegioModel = ColegioModelDef(sequelize, DataTypes);
const TransactionModel = TransactionModelDef(sequelize, DataTypes);

// 3. Definir Relaciones (BYPASS PARA EVITAR FOREIGN KEY CONSTRAINTS)
// UserModel.hasOne(ColegioModel, { foreignKey: 'admin_user_id' });
// ColegioModel.belongsTo(UserModel, { foreignKey: 'admin_user_id' });
UserModel.hasMany(TransactionModel, { foreignKey: 'userId', as: 'transactions' });
TransactionModel.belongsTo(UserModel, { foreignKey: 'userId' });

// 4. Sincronizar Base de Datos
sequelize.sync({ force: true })
    .then(() => console.log('Base de datos sincronizada'))
    .catch(err => console.error('Error al sincronizar DB:', err));

// 5. Configurar Rutas
app.use('/api/auth', authRoutes(UserModel, ColegioModel, sequelize, TransactionModel));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Auth Service corriendo en puerto ${PORT}`);
});