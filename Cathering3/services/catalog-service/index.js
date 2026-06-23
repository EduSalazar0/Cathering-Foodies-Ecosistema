require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

app.use('/uploads', express.static(uploadDir));

// --- BASE DE DATOS ---
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './catalog_database.sqlite', 
    logging: false
});

// Importar Modelos
const ProductDef = require('./src/models/ProductModel');
const ColegioDef = require('./src/models/ColegioModel');
const IngredientDef = require('./src/models/IngredientModel');

const Product = ProductDef(sequelize, DataTypes);
const Colegio = ColegioDef(sequelize, DataTypes);
const Ingredient = IngredientDef(sequelize, DataTypes);

// Relaciones
Colegio.hasMany(Product, { foreignKey: 'colegioId' });
Product.belongsTo(Colegio, { foreignKey: 'colegioId' });

// Sincronización Forzada
sequelize.sync({ force: true })
    .then(() => console.log('Catalog DB sincronizada forzosamente'))
    .catch(err => console.error('Error sincronizando Catalog DB:', err));

// Rutas
const productRoutes = require('./src/routes/product.routes');

// Inyección de modelos estandarizados (1:1 con el Gateway sin pathRewrite)
app.use('/api/catalog', productRoutes(Product, Colegio, Ingredient));
app.use('/api/products', productRoutes(Product, Colegio, Ingredient)); // Fallback para vistas legacy
app.use('/api/ingredients', productRoutes(Product, Colegio, Ingredient));

app.listen(PORT, () => {
    console.log(`Catalog Service corriendo en puerto ${PORT}`);
});