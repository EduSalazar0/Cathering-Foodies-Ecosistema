const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// 1. Conectar a la misma DB que usa el servidor
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../../catalog_database.sqlite'),
    logging: false
});

// 2. Definir modelos mínimos necesarios para crear datos
const IngredientModel = require('../models/IngredientModel');
const ColegioModel = require('../models/ColegioModel');

const Ingredient = IngredientModel(sequelize, DataTypes);
const Colegio = ColegioModel(sequelize, DataTypes);

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Conectado a la base de datos...');

        // Sincronizar (crear tablas si no existen)
        await sequelize.sync();

        // --- CREAR INGREDIENTES ---
        const ingredientes = [
            { nombre: 'Pan de Hamburguesa', is_common: true },
            { nombre: 'Carne de Res', is_common: true },
            { nombre: 'Lechuga', is_common: true },
            { nombre: 'Tomate', is_common: true },
            { nombre: 'Queso Cheddar', is_common: true },
            { nombre: 'Salsa de Tomate', is_common: true },
            { nombre: 'Arroz', is_common: true },
            { nombre: 'Pollo', is_common: true }
        ];

        for (const ing of ingredientes) {
            // findOrCreate evita duplicados
            await Ingredient.findOrCreate({
                where: { nombre: ing.nombre },
                defaults: ing
            });
        }
        console.log('Ingredientes creados.');

        // --- CREAR COLEGIO ---
        const [colegio, created] = await Colegio.findOrCreate({
            where: { nombre: 'Colegio San Patricio' }, // Nombre ejemplo
            defaults: {
                nombre: 'Colegio San Patricio',
                direccion: 'Av. Principal 123',
                telefono: '0999999999',
                ciudad: 'Quito',
                provincia: 'Pichincha'
            }
        });

        if (created) console.log('Colegio por defecto creado (ID: 1).');
        else console.log('El colegio ya existía.');

        console.log('¡Base de datos poblada con éxito!');
        process.exit(0);
    } catch (error) {
        console.error('Error al poblar datos:', error);
        process.exit(1);
    }
}

seed();