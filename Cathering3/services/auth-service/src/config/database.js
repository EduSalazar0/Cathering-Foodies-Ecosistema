const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Ruta absoluta segura para el archivo DB
// En Docker será: /app/data/auth.sqlite
const dbPath = path.resolve(__dirname, '../../../../data/auth.sqlite');

// ASEGURAR QUE LA CARPETA EXISTE (Truco anti-errores)
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

// Configuración
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: dbPath,
    logging: false, // Quitar ruido en consola
});

module.exports = sequelize;